// =========================================
// ELEMENTS
// =========================================

const dashboardNav =
    document.getElementById("dashboardNav");

const scanRecordsNav =
    document.getElementById("scanRecordsNav");

const logoutButton =
    document.getElementById("logoutButton");

const viewRecords =
    document.getElementById("viewRecords");

const recordRows =
    document.querySelectorAll(".record-row");

const dashboardChartInstances = {};

const dashboardSampleRecords = [

    {
        scanId: "SCAN-000124",
        date: "May 18, 2025 10:24 AM",
        disease: "Coffee Leaf Rust",
        confidence: 92.4,
        farmName: "PhytoSentry Farm",
        status: "Completed"
    },
    {
        scanId: "SCAN-000123",
        date: "May 18, 2025 09:15 AM",
        disease: "Cercospora Leaf Spot",
        confidence: 89.1,
        farmName: "Santos Coffee Farm",
        status: "Completed"
    },
    {
        scanId: "SCAN-000122",
        date: "May 17, 2025 04:42 PM",
        disease: "Coffee Berry Disease",
        confidence: 87.7,
        farmName: "Reyes Coffee Farm",
        status: "Completed"
    },
    {
        scanId: "SCAN-000121",
        date: "May 17, 2025 03:11 PM",
        disease: "Healthy",
        confidence: 98.6,
        farmName: "Garcia Coffee Farm",
        status: "Completed"
    },
    {
        scanId: "SCAN-000120",
        date: "May 17, 2025 11:08 AM",
        disease: "Coffee Leaf Rust",
        confidence: 91.3,
        farmName: "Cruz Coffee Farm",
        status: "Completed"
    },
    {
        scanId: "SCAN-000119",
        date: "May 16, 2025 08:20 AM",
        disease: "Healthy",
        confidence: 96.4,
        farmName: "Baguio Valley Farm",
        status: "Completed"
    },
    {
        scanId: "SCAN-000118",
        date: "May 15, 2025 01:45 PM",
        disease: "Coffee Leaf Rust",
        confidence: 90.8,
        farmName: "Del Monte Coffee Grove",
        status: "Completed"
    },
    {
        scanId: "SCAN-000117",
        date: "May 14, 2025 06:35 PM",
        disease: "Anthracnose",
        confidence: 84.4,
        farmName: "North Valley Estate",
        status: "Completed"
    },
    {
        scanId: "SCAN-000116",
        date: "May 13, 2025 09:55 AM",
        disease: "Healthy",
        confidence: 97.7,
        farmName: "Central Green Farm",
        status: "Completed"
    },
    {
        scanId: "SCAN-000115",
        date: "May 12, 2025 03:25 PM",
        disease: "Cercospora Leaf Spot",
        confidence: 86.1,
        farmName: "South Harvest Farm",
        status: "Completed"
    }

];


// =========================================
// DASHBOARD NAVIGATION
// =========================================

dashboardNav.addEventListener("click", () => {

    window.location.href =
        "dashboard.html";

});


// =========================================
// SCAN RECORDS NAVIGATION
// =========================================

scanRecordsNav.addEventListener("click", () => {

    window.location.href =
        "scan-records.html";

});


// =========================================
// VIEW FULL SCAN RECORDS
// =========================================

viewRecords.addEventListener("click", () => {

    window.location.href =
        "scan-records.html";

});


// =========================================
// CLICK RECORD → SCAN DETAILS
// =========================================

recordRows.forEach((row) => {

    row.addEventListener("click", () => {

        const scanId =
            row.dataset.scanId;


        // Save selected scan ID
        // so scan-details.html can read it

        localStorage.setItem(
            "selectedScanId",
            scanId
        );


        // Open scan details page

        window.location.href =
            "scan-details.html";

    });

});


// =========================================
// LOGOUT
// =========================================

logoutButton.addEventListener("click", () => {

    const confirmLogout =
        confirm(
            "Are you sure you want to logout?"
        );


    if (confirmLogout) {

        // Remove admin login data

        localStorage.removeItem(
            "phytosentryAdminUsername"
        );


        // Remove selected scan data

        localStorage.removeItem(
            "selectedScanId"
        );


        // Go to login page

        window.location.href =
            "login.html";

    }

});


// =========================================
// CHART DATA LOADING
// =========================================

function parseScanDate(value) {

    if (!value) {
        return null;
    }

    const parsedDate =
        new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return parsedDate;

}


function getDashboardScanData() {

    const storageKeys = [
        "phytosentryScanRecords",
        "scanReports",
        "dashboardScanReports"
    ];


    for (const storageKey of storageKeys) {

        const value =
            localStorage.getItem(storageKey);

        if (!value) {
            continue;
        }

        try {

            const parsedValue =
                JSON.parse(value);

            if (Array.isArray(parsedValue) && parsedValue.length > 0) {
                return parsedValue;
            }

        }
        catch (error) {
            console.warn(
                `Unable to parse dashboard scan data from ${storageKey}`,
                error
            );
        }

    }


    const rowsFromTable =
        Array.from(document.querySelectorAll(".record-row"));

    if (rowsFromTable.length > 0) {

        return rowsFromTable.map((row) => {

            const cells =
                Array.from(row.querySelectorAll("td"));

            const diseaseCell =
                cells[3]?.textContent.trim() || "Unknown";

            const confidenceCell =
                cells[4]?.textContent.trim() || "0%";

            const dateCell =
                cells[5]?.textContent.trim() || "";

            const confidenceValue =
                Number.parseFloat(
                    confidenceCell.replace("%", "")
                ) || 0;

            return {
                scanId: row.dataset.scanId || "",
                disease: diseaseCell,
                confidence: confidenceValue,
                date: dateCell,
                farmName: row.dataset.farmName || "Unknown Farm",
                status: "Completed"
            };

        });

    }

    return dashboardSampleRecords;

}


function buildWeeklyScanVolume(records) {

    const validDates =
        records
            .map((record) => parseScanDate(record.date))
            .filter(Boolean);

    if (validDates.length === 0) {
        return {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            values: [0, 0, 0, 0, 0, 0, 0]
        };
    }

    const latestDate =
        new Date(Math.max(...validDates.map((date) => date.getTime())));

    latestDate.setHours(0, 0, 0, 0);

    const labels = [];
    const values = new Array(7).fill(0);

    for (let index = 6; index >= 0; index -= 1) {

        const day =
            new Date(latestDate);

        day.setDate(latestDate.getDate() - index);

        labels.push(
            day.toLocaleDateString("en-US", {
                weekday: "short"
            })
        );

    }

    records.forEach((record) => {

        const recordDate =
            parseScanDate(record.date);

        if (!recordDate) {
            return;
        }

        recordDate.setHours(0, 0, 0, 0);

        const differenceInDays =
            Math.round(
                (latestDate.getTime() - recordDate.getTime()) / 86400000
            );

        if (differenceInDays >= 0 && differenceInDays < 7) {
            values[6 - differenceInDays] += 1;
        }

    });

    return {
        labels,
        values
    };

}


function buildDiseaseDistribution(records) {

    const diseaseCounts = {};

    records.forEach((record) => {

        const diseaseName =
            (record.disease || "Unknown").trim() || "Unknown";

        diseaseCounts[diseaseName] =
            (diseaseCounts[diseaseName] || 0) + 1;

    });

    const labels = Object.keys(diseaseCounts);
    const values = Object.values(diseaseCounts);
    const total = values.reduce((sum, value) => sum + value, 0);

    return {
        labels,
        values: values.map((value) => Number(((value / total) * 100).toFixed(1)))
    };

}


function buildConfidenceBands(records) {

    const bands = {
        "<80%": 0,
        "80-89%": 0,
        "90-100%": 0
    };

    records.forEach((record) => {

        const confidenceValue =
            Number(record.confidence) || 0;

        if (confidenceValue < 80) {
            bands["<80%"] += 1;
        }
        else if (confidenceValue < 90) {
            bands["80-89%"] += 1;
        }
        else {
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

        const farmName =
            (record.farmName || "Unknown Farm").trim() || "Unknown Farm";

        farmCounts[farmName] =
            (farmCounts[farmName] || 0) + 1;

    });

    const sortedFarms =
        Object.entries(farmCounts)
            .sort(([, leftCount], [, rightCount]) => rightCount - leftCount)
            .slice(0, 5);

    return {
        labels: sortedFarms.map(([farmName]) => farmName),
        values: sortedFarms.map(([, count]) => count)
    };

}


function buildPeakUsageHours(records) {

    const timeBuckets = {
        Morning: 0,
        Afternoon: 0,
        Evening: 0
    };

    records.forEach((record) => {

        const recordDate =
            parseScanDate(record.date);

        if (!recordDate) {
            return;
        }

        const hour =
            recordDate.getHours();

        if (hour >= 5 && hour < 12) {
            timeBuckets.Morning += 1;
        }
        else if (hour >= 12 && hour < 17) {
            timeBuckets.Afternoon += 1;
        }
        else {
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
    const weeklyDescription =
        `This week saw a total of ${weeklyTotal} scans, with peak activity on ${weeklyVolume.labels[weeklyPeakIndex] || "the latest day"} (${weeklyPeakValue} scans).`;

    document.getElementById("chart-description-weekly").textContent = weeklyDescription;

    const diseaseDistribution = buildDiseaseDistribution(records);
    const diseasePeakIndex = diseaseDistribution.values.indexOf(Math.max(...diseaseDistribution.values));
    const diseasePeakName = diseaseDistribution.labels[diseasePeakIndex] || "Healthy";
    const diseasePeakPercent = diseaseDistribution.values[diseasePeakIndex] || 0;
    const diseaseDescription =
        `${diseasePeakName} remains the most prevalent issue, accounting for ${diseasePeakPercent}% of all recorded scans.`;

    document.getElementById("chart-description-disease").textContent = diseaseDescription;

    const confidenceBands = buildConfidenceBands(records);
    const confidenceTotal = confidenceBands.values.reduce((sum, value) => sum + value, 0);
    const highConfidencePercent = confidenceTotal > 0
        ? Number(((confidenceBands.values[2] / confidenceTotal) * 100).toFixed(1))
        : 0;
    const confidenceDescription =
        `${highConfidencePercent}% of scans fell into the high-confidence bracket (90-100%).`;

    document.getElementById("chart-description-confidence").textContent = confidenceDescription;

    const topFarms = buildTopActiveFarms(records);
    const farmLeader = topFarms.labels[0] || "No farm data";
    const farmLeaderCount = topFarms.values[0] || 0;
    const farmDescription =
        `${farmLeader} recorded the highest activity with ${farmLeaderCount} total scans.`;

    document.getElementById("chart-description-farms").textContent = farmDescription;

    const peakHours = buildPeakUsageHours(records);
    const peakHourTotal = peakHours.values.reduce((sum, value) => sum + value, 0);
    const peakHourIndex = peakHours.values.indexOf(Math.max(...peakHours.values));
    const peakHourLabel = peakHours.labels[peakHourIndex] || "Morning";
    const peakHourPercent = peakHourTotal > 0
        ? Math.round((peakHours.values[peakHourIndex] / peakHourTotal) * 100)
        : 0;
    const hoursDescription =
        `Most scans occurred during the ${peakHourLabel} interval (${peakHourPercent}% of total volume).`;

    document.getElementById("chart-description-hours").textContent = hoursDescription;

}


function destroyChart(chartKey) {

    if (dashboardChartInstances[chartKey]) {
        dashboardChartInstances[chartKey].destroy();
        delete dashboardChartInstances[chartKey];
    }

}


function createChart(chartKey, config) {

    const canvas =
        document.getElementById(chartKey);

    if (!canvas) {
        return null;
    }

    destroyChart(chartKey);

    dashboardChartInstances[chartKey] =
        new Chart(canvas, config);

    return dashboardChartInstances[chartKey];

}


function renderDashboardCharts() {

    const records =
        getDashboardScanData();

    const weeklyVolume =
        buildWeeklyScanVolume(records);

    const diseaseDistribution =
        buildDiseaseDistribution(records);

    const confidenceBands =
        buildConfidenceBands(records);

    const topFarms =
        buildTopActiveFarms(records);

    const peakHours =
        buildPeakUsageHours(records);

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
            animation: {
                duration: 700
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: "#173a25",
                    titleColor: "#ffffff",
                    bodyColor: "#f4f6f5",
                    borderColor: "#4a7c59",
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        color: "rgba(23, 58, 37, 0.08)"
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },
                    grid: {
                        color: "rgba(23, 58, 37, 0.08)"
                    }
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
                backgroundColor: [
                    "#d58a2a",
                    "#4a7c59",
                    "#173a25"
                ],
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: "#173a25",
                    titleColor: "#ffffff",
                    bodyColor: "#f4f6f5"
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },
                    grid: {
                        color: "rgba(23, 58, 37, 0.08)"
                    }
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
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: "#173a25",
                    titleColor: "#ffffff",
                    bodyColor: "#f4f6f5"
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },
                    grid: {
                        color: "rgba(23, 58, 37, 0.08)"
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
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
                backgroundColor: [
                    "#d58a2a",
                    "#4a7c59",
                    "#173a25"
                ],
                borderRadius: 6,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: "#173a25",
                    titleColor: "#ffffff",
                    bodyColor: "#f4f6f5"
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    },
                    grid: {
                        color: "rgba(23, 58, 37, 0.08)"
                    }
                }
            }
        }
    });

    updateChartDescriptions(records);

}


window.addEventListener("storage", renderDashboardCharts);
window.refreshDashboardCharts = renderDashboardCharts;
renderDashboardCharts();