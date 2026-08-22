import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// =========================================
// ELEMENTS
// =========================================

const dashboardNav =
    document.getElementById("dashboardNav");

const scanRecordsNav =
    document.getElementById("scanRecordsNav");

const logoutButton = 
    document.getElementById("logoutButton");

const logoutModal = 
    document.getElementById("logoutModal");

const cancelLogout = 
    document.getElementById("cancelLogout");

const confirmLogout = 
    document.getElementById("confirmLogout");

const viewRecords =
    document.getElementById("viewRecords");

const totalUsers =
    document.getElementById("totalUsers");

const totalScans =
    document.getElementById("totalScans");

const diseaseDetections =
    document.getElementById("diseaseDetections");

const activeFarms =
    document.getElementById("activeFarms");

const recentScansBody =
    document.getElementById("recentScansBody");

const dashboardChartInstances = {};


// =========================================
// NAVIGATION
// =========================================

dashboardNav.addEventListener("click", () => {

    window.location.href =
        "dashboard.html";

});


scanRecordsNav.addEventListener("click", () => {

    window.location.href =
        "scan-records.html";

});


viewRecords.addEventListener("click", () => {

    window.location.href =
        "scan-records.html";

});


logoutButton.addEventListener("click", () => {
    logoutModal.classList.add("show");
});

// Cancel
cancelLogout.addEventListener("click", () => {
    logoutModal.classList.remove("show");
});

// Confirm logout
confirmLogout.addEventListener("click", () => {
    localStorage.removeItem("phytosentryAdminUsername");
    localStorage.removeItem("selectedScanId");

    window.location.href = "login.html";
});


// =========================================
// DASHBOARD CHARTS
// =========================================

function parseScanDate(value) {
    if (!value) return null;

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed;
}

function destroyChart(chartKey) {
    if (dashboardChartInstances[chartKey]) {
        dashboardChartInstances[chartKey].destroy();
        delete dashboardChartInstances[chartKey];
    }
}

function createChart(chartKey, config) {
    const canvas = document.getElementById(chartKey);
    if (!canvas || typeof window.Chart === "undefined") return null;

    destroyChart(chartKey);
    dashboardChartInstances[chartKey] = new Chart(canvas, config);
    return dashboardChartInstances[chartKey];
}

function buildWeeklyScanVolume(records) {
    const validDates = records
        .map((record) => parseScanDate(record.capturedAt || record.date))
        .filter(Boolean);

    if (validDates.length === 0) {
        return {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            values: [0, 0, 0, 0, 0, 0, 0]
        };
    }

    const latestDate = new Date(Math.max(...validDates.map((date) => date.getTime())));
    latestDate.setHours(0, 0, 0, 0);

    const labels = [];
    const values = new Array(7).fill(0);

    for (let index = 6; index >= 0; index -= 1) {
        const day = new Date(latestDate);
        day.setDate(latestDate.getDate() - index);
        labels.push(day.toLocaleDateString("en-US", { weekday: "short" }));
    }

    records.forEach((record) => {
        const recordDate = parseScanDate(record.capturedAt || record.date);
        if (!recordDate) return;

        recordDate.setHours(0, 0, 0, 0);
        const diffDays = Math.round((latestDate.getTime() - recordDate.getTime()) / 86400000);

        if (diffDays >= 0 && diffDays < 7) {
            values[6 - diffDays] += 1;
        }
    });

    return { labels, values };
}

function buildDiseaseDistribution(records) {
    const diseaseCounts = {};

    records.forEach((record) => {
        const diseaseName = (
            record.displayName ||
            record.scientificName ||
            record.prediction?.label ||
            "Unknown"
        ).trim() || "Unknown";

        diseaseCounts[diseaseName] = (diseaseCounts[diseaseName] || 0) + 1;
    });

    const labels = Object.keys(diseaseCounts);
    const values = Object.values(diseaseCounts);
    const total = values.reduce((sum, value) => sum + value, 0) || 1;

    return {
        labels,
        values: values.map((value) => Number(((value / total) * 100).toFixed(1)))
    };
}

function buildConfidenceBands(records) {
    const bands = { "<80%": 0, "80-89%": 0, "90-100%": 0 };

    records.forEach((record) => {
        const confidenceValue = Number(record.prediction?.confidence || record.confidence || 0) * 100;

        if (confidenceValue < 80) {
            bands["<80%"] += 1;
        } else if (confidenceValue < 90) {
            bands["80-89%"] += 1;
        } else {
            bands["90-100%"] += 1;
        }
    });

    return {
        labels: Object.keys(bands),
        values: Object.values(bands)
    };
}

function buildTopActiveFarms(records) {
    const farmCounts = {};

    records.forEach((record) => {
        const farmName = (record.farmName || record.FarmName || "Unknown Farm").trim() || "Unknown Farm";
        farmCounts[farmName] = (farmCounts[farmName] || 0) + 1;
    });

    const sortedFarms = Object.entries(farmCounts)
        .sort(([, leftCount], [, rightCount]) => rightCount - leftCount)
        .slice(0, 5);

    return {
        labels: sortedFarms.map(([farmName]) => farmName),
        values: sortedFarms.map(([, count]) => count)
    };
}

function buildPeakUsageHours(records) {
    const timeBuckets = { Morning: 0, Afternoon: 0, Evening: 0 };

    records.forEach((record) => {
        const recordDate = parseScanDate(record.capturedAt || record.date);
        if (!recordDate) return;

        const hour = recordDate.getHours();

        if (hour >= 5 && hour < 12) {
            timeBuckets.Morning += 1;
        } else if (hour >= 12 && hour < 17) {
            timeBuckets.Afternoon += 1;
        } else {
            timeBuckets.Evening += 1;
        }
    });

    return {
        labels: Object.keys(timeBuckets),
        values: Object.values(timeBuckets)
    };
}

function updateChartDescriptions(records) {
    const weeklyVolume = buildWeeklyScanVolume(records);
    const weeklyPeakIndex = weeklyVolume.values.indexOf(Math.max(...weeklyVolume.values));
    const weeklyPeakValue = weeklyVolume.values[weeklyPeakIndex] || 0;
    const weeklyTotal = weeklyVolume.values.reduce((sum, value) => sum + value, 0);
    const weeklyDescription = `This week saw a total of ${weeklyTotal} scans, with peak activity on ${weeklyVolume.labels[weeklyPeakIndex] || "the latest day"} (${weeklyPeakValue} scans).`;
    document.getElementById("chart-description-weekly").textContent = weeklyDescription;

    const diseaseDistribution = buildDiseaseDistribution(records);
    const diseasePeakIndex = diseaseDistribution.values.indexOf(Math.max(...diseaseDistribution.values));
    const diseasePeakName = diseaseDistribution.labels[diseasePeakIndex] || "Healthy";
    const diseasePeakPercent = diseaseDistribution.values[diseasePeakIndex] || 0;
    const diseaseDescription = `${diseasePeakName} remains the most prevalent issue, accounting for ${diseasePeakPercent}% of all recorded scans.`;
    document.getElementById("chart-description-disease").textContent = diseaseDescription;

    const confidenceBands = buildConfidenceBands(records);
    const confidenceTotal = confidenceBands.values.reduce((sum, value) => sum + value, 0);
    const highConfidencePercent = confidenceTotal > 0 ? Number(((confidenceBands.values[2] / confidenceTotal) * 100).toFixed(1)) : 0;
    const confidenceDescription = `${highConfidencePercent}% of scans fell into the high-confidence bracket (90-100%).`;
    document.getElementById("chart-description-confidence").textContent = confidenceDescription;

    const topFarms = buildTopActiveFarms(records);
    const farmLeader = topFarms.labels[0] || "No farm data";
    const farmLeaderCount = topFarms.values[0] || 0;
    const farmDescription = `${farmLeader} recorded the highest activity with ${farmLeaderCount} total scans.`;
    document.getElementById("chart-description-farms").textContent = farmDescription;

    const peakHours = buildPeakUsageHours(records);
    const peakHourTotal = peakHours.values.reduce((sum, value) => sum + value, 0);
    const peakHourIndex = peakHours.values.indexOf(Math.max(...peakHours.values));
    const peakHourLabel = peakHours.labels[peakHourIndex] || "Morning";
    const peakHourPercent = peakHourTotal > 0 ? Math.round((peakHours.values[peakHourIndex] / peakHourTotal) * 100) : 0;
    const hoursDescription = `Most scans occurred during the ${peakHourLabel} interval (${peakHourPercent}% of total volume).`;
    document.getElementById("chart-description-hours").textContent = hoursDescription;
}

function renderDashboardCharts(records) {
    if (typeof window.Chart === "undefined") return;

    const weeklyVolume = buildWeeklyScanVolume(records);
    const diseaseDistribution = buildDiseaseDistribution(records);
    const confidenceBands = buildConfidenceBands(records);
    const topFarms = buildTopActiveFarms(records);
    const peakHours = buildPeakUsageHours(records);

    Chart.defaults.color = "#53655f";
    Chart.defaults.font.family = "Arial, Helvetica, sans-serif";

    createChart("weeklyScanVolumeChart", {
        type: "line",
        data: {
            labels: weeklyVolume.labels,
            datasets: [{
                label: "Scans",
                data: weeklyVolume.values,
                borderColor: "#173a25",
                backgroundColor: "rgba(23, 58, 37, 0.12)",
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: "#4a7c59",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                fill: true,
                tension: 0.35
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#173a25",
                    titleColor: "#ffffff",
                    bodyColor: "#f4f6f5",
                    borderColor: "#4a7c59",
                    borderWidth: 1
                }
            },
            scales: {
                x: { grid: { color: "rgba(23, 58, 37, 0.08)" } },
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                    grid: { color: "rgba(23, 58, 37, 0.08)" }
                }
            }
        }
    });

    createChart("diseaseDistributionChart", {
        type: "doughnut",
        data: {
            labels: diseaseDistribution.labels,
            datasets: [{
                data: diseaseDistribution.values,
                backgroundColor: [
                    "#173a25",
                    "#4a7c59",
                    "#d58a2a",
                    "#7b9cab",
                    "#a35f59",
                    "#5b7f5d"
                ],
                borderWidth: 0,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: "58%",
            plugins: {
                legend: {
                    position: "bottom",
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        padding: 14,
                        color: "#3d4a46"
                    }
                },
                tooltip: {
                    callbacks: {
                        label(context) {
                            return `${context.label}: ${context.parsed}%`;
                        }
                    },
                    backgroundColor: "#173a25",
                    titleColor: "#ffffff",
                    bodyColor: "#f4f6f5"
                }
            }
        }
    });

    createChart("confidenceBandsChart", {
        type: "bar",
        data: {
            labels: confidenceBands.labels,
            datasets: [{
                label: "Scans",
                data: confidenceBands.values,
                backgroundColor: ["#d58a2a", "#4a7c59", "#173a25"],
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#173a25",
                    titleColor: "#ffffff",
                    bodyColor: "#f4f6f5"
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                    grid: { color: "rgba(23, 58, 37, 0.08)" }
                }
            }
        }
    });

    createChart("topActiveFarmsChart", {
        type: "bar",
        data: {
            labels: topFarms.labels,
            datasets: [{
                label: "Scans",
                data: topFarms.values,
                backgroundColor: "#4a7c59",
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#173a25",
                    titleColor: "#ffffff",
                    bodyColor: "#f4f6f5"
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                    grid: { color: "rgba(23, 58, 37, 0.08)" }
                },
                y: { grid: { display: false } }
            }
        }
    });

    createChart("peakUsageHoursChart", {
        type: "bar",
        data: {
            labels: peakHours.labels,
            datasets: [{
                label: "Scans",
                data: peakHours.values,
                backgroundColor: ["#d58a2a", "#4a7c59", "#173a25"],
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#173a25",
                    titleColor: "#ffffff",
                    bodyColor: "#f4f6f5"
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 },
                    grid: { color: "rgba(23, 58, 37, 0.08)" }
                }
            }
        }
    });

    updateChartDescriptions(records);
}

// =========================================
// LOAD DASHBOARD DATA
// =========================================

async function loadDashboardData() {

    try {

        // =====================================
        // GET USERS
        // =====================================

        const scansSnapshot =
             await getDocs(
              collection(db, "scanHistory")
            );

        const users = new Set();

        scansSnapshot.forEach((doc) => {
            const data = doc.data();

            const firstName =
                data.firstName || "";

            const lastName =
                data.LastName ||
                data.lastName ||
                "";

            const userName =
                `${firstName} ${lastName}`.trim().toLowerCase();

            if (userName) {
                users.add(userName);
            }
        });


        console.log(
            "Dashboard Firebase connected!"
        );

        console.log(
            "Users found:",
            users.size
        );

        console.log(
            "Scan records found:",
            scansSnapshot.size
        );


        // =====================================
        // DISEASE + FARM COUNTS
        // =====================================

        let diseaseCount = 0;

        const farms =
            new Set();


        scansSnapshot.forEach((doc) => {

            const data =
                doc.data();


            // ---------------------------------
            // GET DISEASE
            // Same logic as scan-records.js
            // ---------------------------------

            const disease =
                data.displayName ||
                data.scientificName ||
                data.prediction?.label ||
                "Unknown";


            // ---------------------------------
            // COUNT DISEASES
            // ---------------------------------

            if (
                disease.toLowerCase() !==
                "healthy leaf"
            ) {

                diseaseCount++;

            }


            // ---------------------------------
            // COUNT FARMS
            // ---------------------------------

            const farmName =
                data.farmName ||
                data.FarmName ||
                "";


            if (farmName) {

                farms.add(farmName);

            }

        });


        // =====================================
        // UPDATE SUMMARY CARDS
        // =====================================

        totalUsers.textContent =
               users.size;

        totalScans.textContent =
            scansSnapshot.size;

        diseaseDetections.textContent =
            diseaseCount;

        activeFarms.textContent =
            farms.size;

                const usersChange =
            document.getElementById("usersChange");

        const scansChange =
            document.getElementById("scansChange");

        const diseaseChange =
            document.getElementById("diseaseChange");

        const farmsChange =
    document.getElementById("farmsChange");

    // =====================================
// CALCULATE THIS WEEK'S CHANGES
// =====================================

const now = new Date();

const startOfWeek = new Date(now);

const day = startOfWeek.getDay();

const diff =
    day === 0
        ? -6
        : 1 - day;

startOfWeek.setDate(
    startOfWeek.getDate() + diff
);

startOfWeek.setHours(
    0, 0, 0, 0
);


const weeklyUsers =
    new Set();

let weeklyScans = 0;

let weeklyDiseaseDetections = 0;

const weeklyFarms =
    new Set();


scansSnapshot.forEach((doc) => {

    const data =
        doc.data();

    // Use the exact ISO timestamp for reliable math
    const capturedAt = data.capturedAt || "";

    if (!capturedAt) {
        return;
    }

    const scanDate = new Date(capturedAt);
    

        if (isNaN(scanDate.getTime())) {
            return;
        }

    // Only count this week's records

    if (scanDate >= startOfWeek) {

        weeklyScans++;


        // -----------------------------
        // USER
        // -----------------------------

        const firstName =
            data.firstName || "";

        const lastName =
            data.LastName ||
            data.lastName ||
            "";

        const userName =
            `${firstName} ${lastName}`
                .trim()
                .toLowerCase();


        if (userName) {
            weeklyUsers.add(userName);
        }


        // -----------------------------
        // DISEASE
        // -----------------------------

        const disease =
            data.displayName ||
            data.scientificName ||
            data.prediction?.label ||
            "Unknown";


        if (
            disease.toLowerCase() !==
            "healthy leaf"
        ) {

            weeklyDiseaseDetections++;

        }


        // -----------------------------
        // FARM
        // -----------------------------

        const farmName =
            data.farmName ||
            data.FarmName ||
            "";


        if (farmName) {

            weeklyFarms.add(
                farmName
            );

        }

    }

});
usersChange.textContent =
    `+${weeklyUsers.size} this week`;

scansChange.textContent =
    `+${weeklyScans} this week`;

diseaseChange.textContent =
    `+${weeklyDiseaseDetections} this week`;

farmsChange.textContent =
    `+${weeklyFarms.size} this week`;
        // =====================================
        // CLEAR TABLE
        // =====================================

        recentScansBody.innerHTML = "";


        // =====================================
        // SORT SCANS BY DATE
        // NEWEST FIRST
        // =====================================

        const scans =
            scansSnapshot.docs
                .map((doc) => {

                    return {
                        id: doc.id,
                        data: doc.data()
                    };

                })
                .sort((a, b) => {

                    const dateA =
                        a.data.capturedAt || "";

                    const dateB =
                        b.data.capturedAt || "";

                    return dateB.localeCompare(
                        dateA
                    );

                });


        // =====================================
        // GET FIVE MOST RECENT
        // =====================================

        const recentScans =
            scans.slice(0, 5);


        // =====================================
        // CREATE TABLE ROWS
        // =====================================

        recentScans.forEach((scan) => {

            const data =
                scan.data;


            // ---------------------------------
            // GET RECORD DATA
            // Same logic as scan-records.js
            // ---------------------------------

            const firstName =
                data.firstName ||
                "—";


            const lastName =
                data.LastName ||
                data.lastName ||
                "—";


            const farmName =
                data.farmName ||
                data.FarmName ||
                "—";


            const scanId =
                data.id ||
                scan.id;


            const disease =
                data.displayName ||
                data.scientificName ||
                data.prediction?.label ||
                "Unknown";


            const confidence =
                Number(
                    data.prediction?.confidence ||
                    0
                );


            const capturedDate =
                data.capturedDate ||
                "—";


            const capturedTime =
                data.capturedTime ||
                "";


            // ---------------------------------
            // CREATE ROW
            // ---------------------------------

            const row =
                document.createElement("tr");


            row.classList.add(
                "record-row"
            );


            // ---------------------------------
            // TABLE CONTENT
            // ---------------------------------

            row.innerHTML = `

                <td>
                    ${firstName}
                </td>

                <td>
                    ${lastName}
                </td>

                <td>
                    ${farmName}
                </td>

                <td>
                    ${scanId}
                </td>

                <td class="${
                    disease.toLowerCase() ===
                    "healthy leaf"
                        ? "healthy"
                        : ""
                }">
                    ${disease}
                </td>

                <td>
                    ${(confidence * 100).toFixed(1)}%
                </td>

                <td>
                    ${capturedDate}
                    ${capturedTime}
                </td>

                <td>
                    <span class="status completed">
                        Completed
                    </span>
                </td>

            `;


            // ---------------------------------
            // CLICK ROW
            // ---------------------------------

            row.addEventListener(
                "click",
                () => {

                    localStorage.setItem(
                        "selectedScanId",
                        scanId
                    );


                    window.location.href =
                        "scan-details.html";

                }
            );


            // ---------------------------------
            // ADD ROW
            // ---------------------------------

            recentScansBody.appendChild(
                row
            );

        });


        const dashboardRecords = scansSnapshot.docs.map((doc) => doc.data());
        renderDashboardCharts(dashboardRecords);

        // =====================================
        // SUCCESS
        // =====================================

        console.log(
            "Dashboard loaded successfully!"
        );

        console.log(
            "Total users:",
            users.size
        );

        console.log(
            "Total scans:",
            scansSnapshot.size
        );

        console.log(
            "Disease detections:",
            diseaseCount
        );

        console.log(
            "Active farms:",
            farms.size
        );

    }

    catch (error) {

        console.error(
            "Dashboard Firebase error:",
            error
        );

    }

}


// =========================================
// START
// =========================================

loadDashboardData();