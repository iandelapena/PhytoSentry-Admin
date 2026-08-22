import { db } from "./firebase.js";
import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

console.log("SCAN RECORDS JS LOADED");
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

const searchInput =
    document.getElementById("searchInput");

const startDate =
    document.getElementById("startDate");

const endDate =
    document.getElementById("endDate");

const diseaseFilter =
    document.getElementById("diseaseFilter");

const downloadButton =
    document.getElementById("downloadButton");

 const downloadModal =
    document.getElementById("downloadModal");

const downloadCsv =
    document.getElementById("downloadCsv");

const downloadPdf =
    document.getElementById("downloadPdf");

const cancelDownload =
    document.getElementById("cancelDownload");
const recordsBody =
    document.getElementById("recordsTableBody");

const noResults =
    document.getElementById("noResults");


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

// Open confirmation
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


// ======================================
// SEARCH
// =========================================

searchInput.addEventListener("input", () => {

    filterRecords();

});


// =========================================
// DISEASE FILTER
// =========================================

diseaseFilter.addEventListener("change", () => {

    filterRecords();

});


// =========================================
// DATE FILTER
// =========================================

startDate.addEventListener("change", () => {

    filterRecords();

});


endDate.addEventListener("change", () => {

    filterRecords();

});


// =========================================
// FILTER RECORDS
// =========================================

function filterRecords() {

    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedDisease =
        diseaseFilter.value
            .trim()
            .toLowerCase();


    const selectedStartDate =
        startDate.value;


    const selectedEndDate =
        endDate.value;


    let visibleRecords = 0;


    document
    .querySelectorAll(".record-row")
    .forEach((row) => {

        // =====================================
        // GET RECORD DATA
        // =====================================

        const firstName =
            (row.dataset.firstName || "")
                .toLowerCase();


        const lastName =
            (row.dataset.lastName || "")
                .toLowerCase();


        const farmName =
            (row.dataset.farmName || "")
                .toLowerCase();


        const scanId =
            (row.dataset.scanId || "")
                .toLowerCase();


        const disease =
            (row.dataset.disease || "")
                .toLowerCase();


        const rowDate =
            row.dataset.date || "";


        // =====================================
        // SEARCH
        // =====================================

        /*
            Search can find:

            - First Name
            - Last Name
            - Full Name
            - Scan ID
            - Disease
        */

        const fullName =
            `${firstName} ${lastName}`;


        const matchesSearch =
            searchValue === "" ||

            firstName.includes(searchValue) ||

            lastName.includes(searchValue) ||

            fullName.includes(searchValue) ||

            farmName.includes(searchValue) ||

            scanId.includes(searchValue) ||

            disease.includes(searchValue);


        // =====================================
        // DISEASE FILTER
        // =====================================

        const matchesDisease =
            selectedDisease === "all" ||

            disease === selectedDisease;


        // =====================================
        // START DATE
        // =====================================

        const matchesStartDate =
            !selectedStartDate ||

            rowDate >= selectedStartDate;


        // =====================================
        // END DATE
        // =====================================

        const matchesEndDate =
            !selectedEndDate ||

            rowDate <= selectedEndDate;


        // =====================================
        // FINAL RESULT
        // =====================================

        const shouldShow =
            matchesSearch &&
            matchesDisease &&
            matchesStartDate &&
            matchesEndDate;


        if (shouldShow) {

            row.style.display = "";

            visibleRecords++;

        } else {

            row.style.display = "none";

        }

    });


    // =========================================
    // NO RESULTS
    // =========================================

    if (visibleRecords === 0) {

        noResults.style.display =
            "block";

    } else {

        noResults.style.display =
            "none";

    }

}

// =========================================
// DOWNLOAD REPORT MODAL
// =========================================

downloadButton.addEventListener("click", () => {

    console.log("DOWNLOAD BUTTON CLICKED");

    const rows =
        Array.from(
            document.querySelectorAll(".record-row")
        ).filter(row =>
            row.style.display !== "none"
        );

    console.log("Visible rows:", rows.length);

    if (rows.length === 0) {

        alert("There are no records to download.");

        return;

    }

    console.log("Opening download modal");

    downloadModal.classList.add("show");

});

// =========================================
// CANCEL DOWNLOAD
// =========================================

cancelDownload.addEventListener("click", () => {

    downloadModal.classList.remove("show");

});


// =========================================
// DOWNLOAD CSV
// =========================================

downloadCsv.addEventListener("click", () => {

    const rows =
        Array.from(
            document.querySelectorAll(".record-row")
        ).filter(row =>
            row.style.display !== "none"
        );


    if (rows.length === 0) {

        alert(
            "There are no records to download."
        );

        return;

    }


    let csv =
        "First Name,Last Name,Farm Name,Scan ID,Disease Detected,Confidence %,Date/Time,Status\n";


    rows.forEach((row) => {

        const cells =
            row.querySelectorAll("td");


        const firstName =
            cells[0].textContent.trim();

        const lastName =
            cells[1].textContent.trim();

        const farmName =
            cells[2].textContent.trim();

        const scanId =
            cells[3].textContent.trim();

        const disease =
            cells[4].textContent.trim();

        const confidence =
            cells[5].textContent.trim();

        const dateTime =
            cells[6].textContent.trim();

        const status =
            cells[7].textContent.trim();


        csv +=
            `"${firstName}","${lastName}","${farmName}","${scanId}","${disease}","${confidence}","${dateTime}","${status}"\n`;

    });


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href =
        url;


    link.download =
        "phytosentry-scan-records.csv";


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);


    // Close modal

    downloadModal.classList.remove("show");

});

// =========================================
// DOWNLOAD PDF
// =========================================

downloadPdf.addEventListener("click", () => {

    const rows =
        Array.from(
            document.querySelectorAll(".record-row")
        ).filter(row =>
            row.style.display !== "none"
        );


    if (rows.length === 0) {

        alert(
            "There are no records to download."
        );

        return;

    }


    // =====================================
    // CHECK jsPDF
    // =====================================

    if (!window.jspdf) {

        alert(
            "PDF library could not be loaded."
        );

        console.error(
            "jsPDF is not available."
        );

        return;

    }


    const { jsPDF } = window.jspdf;


    const doc =
        new jsPDF("landscape");


    // =====================================
    // REPORT DATE
    // =====================================

    const reportDate =
        new Date().toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );


    // =====================================
    // GET FILTERS
    // =====================================

    const selectedDisease =
        diseaseFilter.value;


    const selectedStartDate =
        startDate.value;


    const selectedEndDate =
        endDate.value;


    let filterText =
        "Disease: All";


    if (selectedDisease !== "all") {

        filterText =
            `Disease: ${selectedDisease}`;

    }


    if (selectedStartDate) {

        filterText +=
            ` | From: ${selectedStartDate}`;

    }


    if (selectedEndDate) {

        filterText +=
            ` | To: ${selectedEndDate}`;

    }


    // =====================================
    // GET RECORD DATA
    // =====================================

    const records =
        rows.map((row) => {

            const cells =
                row.querySelectorAll("td");


            return {

                firstName:
                    cells[0].textContent.trim(),

                lastName:
                    cells[1].textContent.trim(),

                farmName:
                    cells[2].textContent.trim(),

                scanId:
                    cells[3].textContent.trim(),

                disease:
                    cells[4].textContent.trim(),

                confidence:
                    parseFloat(
                        cells[5].textContent
                    ) || 0,

                dateTime:
                    cells[6].textContent.trim(),

                status:
                    cells[7].textContent.trim()

            };

        });


    // =====================================
    // CALCULATE SUMMARY
    // =====================================

    const diseaseCounts = {};


    let totalConfidence = 0;


    records.forEach((record) => {

        diseaseCounts[record.disease] =
            (diseaseCounts[record.disease] || 0) + 1;


        totalConfidence +=
            record.confidence;

    });


    const averageConfidence =
        totalConfidence / records.length;


    // =====================================
    // CONFIDENCE GROUPS
    // =====================================

    const confidenceGroups = {

        "90–100%": 0,

        "80–89%": 0,

        "70–79%": 0,

        "60–69%": 0,

        "Below 60%": 0

    };


    records.forEach((record) => {

        const confidence =
            record.confidence;


        if (confidence >= 90) {

            confidenceGroups["90–100%"]++;

        }
        else if (confidence >= 80) {

            confidenceGroups["80–89%"]++;

        }
        else if (confidence >= 70) {

            confidenceGroups["70–79%"]++;

        }
        else if (confidence >= 60) {

            confidenceGroups["60–69%"]++;

        }
        else {

            confidenceGroups["Below 60%"]++;

        }

    });


    // =====================================
    // PAGE 1 — REPORT HEADER
    // =====================================

    doc.setFontSize(22);

    doc.text(
        "PhytoSentry",
        14,
        18
    );


    doc.setFontSize(16);

    doc.text(
        "Scan Analysis Report",
        14,
        27
    );


    doc.setFontSize(9);

    doc.text(
        `Generated: ${reportDate}`,
        14,
        35
    );


    doc.text(
        `Filters: ${filterText}`,
        14,
        41
    );


    // =====================================
    // SUMMARY CARDS
    // =====================================

    doc.setFontSize(11);

    doc.text(
        "Report Summary",
        14,
        52
    );


    // Total scans

    doc.rect(
        14,
        58,
        75,
        25
    );


    doc.setFontSize(9);

    doc.text(
        "TOTAL SCANS",
        19,
        66
    );


    doc.setFontSize(18);

    doc.text(
        String(records.length),
        19,
        77
    );


    // Average confidence

    doc.rect(
        95,
        58,
        75,
        25
    );


    doc.setFontSize(9);

    doc.text(
        "AVERAGE CONFIDENCE",
        100,
        66
    );


    doc.setFontSize(18);

    doc.text(
        `${averageConfidence.toFixed(1)}%`,
        100,
        77
    );


    // =====================================
    // DISEASE DISTRIBUTION
    // =====================================

    doc.setFontSize(12);

    doc.text(
        "Disease Distribution",
        14,
        96
    );


    const diseaseEntries =
        Object.entries(diseaseCounts);


    const chartX = 20;

    const chartY = 104;

    const chartWidth = 240;

    const chartHeight = 55;


    const maxDiseaseCount =
        Math.max(
            ...diseaseEntries.map(
                ([, count]) => count
            ),
            1
        );


    // Chart border

    doc.rect(
        chartX,
        chartY,
        chartWidth,
        chartHeight
    );


    diseaseEntries.forEach(
        ([disease, count], index) => {

            const barHeight =
                (count / maxDiseaseCount) *
                35;


            const x =
                chartX +
                10 +
                index *
                (
                    (chartWidth - 20) /
                    diseaseEntries.length
                );


            const barWidth =
                Math.min(
                    25,
                    (
                        chartWidth - 30
                    ) /
                    diseaseEntries.length
                );


            const y =
                chartY +
                chartHeight -
                12 -
                barHeight;


            // Bar

            doc.rect(
                x,
                y,
                barWidth,
                barHeight,
                "F"
            );


            // Count

            doc.setFontSize(8);

            doc.text(
                String(count),
                x + barWidth / 2,
                y - 2,
                {
                    align: "center"
                }
            );


            // Disease label

            const shortName =
                disease.length > 14
                    ? disease.substring(0, 14) + "..."
                    : disease;


            doc.text(
                shortName,
                x + barWidth / 2,
                chartY + chartHeight - 4,
                {
                    align: "center"
                }
            );

        }
    );


    // =====================================
    // CONFIDENCE DISTRIBUTION
    // =====================================

    doc.setFontSize(12);

    doc.text(
        "Confidence Distribution",
        14,
        175
    );


    const confidenceEntries =
        Object.entries(
            confidenceGroups
        );


    const confidenceChartX = 20;

    const confidenceChartY = 183;

    const confidenceChartWidth = 240;

    const confidenceChartHeight = 55;


    const maxConfidenceCount =
        Math.max(
            ...confidenceEntries.map(
                ([, count]) => count
            ),
            1
        );


    doc.rect(
        confidenceChartX,
        confidenceChartY,
        confidenceChartWidth,
        confidenceChartHeight
    );


    confidenceEntries.forEach(
        ([label, count], index) => {

            const barHeight =
                (count / maxConfidenceCount) *
                35;


            const x =
                confidenceChartX +
                12 +
                index *
                42;


            const barWidth =
                24;


            const y =
                confidenceChartY +
                confidenceChartHeight -
                12 -
                barHeight;


            // Bar

            doc.rect(
                x,
                y,
                barWidth,
                barHeight,
                "F"
            );


            // Count

            doc.setFontSize(8);

            doc.text(
                String(count),
                x + barWidth / 2,
                y - 2,
                {
                    align: "center"
                }
            );


            // Label

            doc.setFontSize(7);

            doc.text(
                label,
                x + barWidth / 2,
                confidenceChartY +
                confidenceChartHeight -
                4,
                {
                    align: "center"
                }
            );

        }
    );


    // =====================================
    // PAGE 2 — DETAILED RECORDS
    // =====================================

    doc.addPage();


    doc.setFontSize(16);

    doc.text(
        "Detailed Scan Records",
        14,
        18
    );


    doc.setFontSize(9);

    doc.text(
        `Total records: ${records.length}`,
        14,
        25
    );


    // =====================================
    // TABLE DATA
    // =====================================

    const tableData =
        records.map((record) => {

            return [

                record.firstName,

                record.lastName,

                record.farmName,

                record.scanId,

                record.disease,

                `${record.confidence.toFixed(1)}%`,

                record.dateTime,

                record.status

            ];

        });


    // =====================================
    // PDF TABLE
    // =====================================

    doc.autoTable({

        startY: 32,

        head: [[

            "First Name",

            "Last Name",

            "Farm Name",

            "Scan ID",

            "Disease",

            "Confidence",

            "Date/Time",

            "Status"

        ]],

        body: tableData,

        styles: {

            fontSize: 7,

            cellPadding: 3

        },

        headStyles: {

            fontSize: 7

        },

        margin: {

            left: 10,

            right: 10

        }

    });


    // =====================================
    // FOOTER ON ALL PAGES
    // =====================================

    const pageCount =
        doc.internal.getNumberOfPages();


    for (
        let page = 1;
        page <= pageCount;
        page++
    ) {

        doc.setPage(page);


        doc.setFontSize(8);


        doc.text(
            `PhytoSentry Scan Report | Page ${page} of ${pageCount}`,
            14,
            200
        );

    }


    // =====================================
    // SAVE PDF
    // =====================================

    doc.save(
        "phytosentry-scan-report.pdf"
    );


    // =====================================
    // CLOSE MODAL
    // =====================================

    downloadModal.classList.remove(
        "show"
    );

});

// =========================================
// FIREBASE - LOAD SCAN RECORDS
// =========================================

async function loadScanRecords() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "scanHistory")
            );

        console.log(
            "Firebase connected successfully!"
        );

        console.log(
            "Scan records found:",
            snapshot.size
        );


        // Clear existing table rows

        recordsBody.innerHTML = "";


        // =====================================
        // CREATE TABLE ROWS
        // =====================================

        snapshot.forEach((doc) => {

            const data = doc.data();

            console.log(
                "Loading scan:",
                doc.id,
                data
            );


            // ---------------------------------
            // GET FIREBASE DATA
            // ---------------------------------

            const firstName =
                data.firstName || "—";


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
                doc.id;


            const disease =
                data.displayName ||
                data.scientificName ||
                data.prediction?.label ||
                "Unknown";


            const confidence =
                Number(
                    data.prediction?.confidence || 0
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
            // DATA ATTRIBUTES
            // ---------------------------------

            row.dataset.firstName =
                firstName;

            row.dataset.lastName =
                lastName;

            row.dataset.scanId =
                scanId;
            
            row.dataset.farmName =
                farmName;

            row.dataset.disease =
                disease;

            row.dataset.confidence =
                confidence;

            row.dataset.date =
                data.capturedAt
                    ? data.capturedAt.split("T")[0]
                    : "";


            row.dataset.datetime =
                `${capturedDate} ${capturedTime}`.trim();


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
                    disease.toLowerCase() === "healthy"
                        ? "healthy"
                        : ""
                }">
                    ${disease}
                </td>

                <td>
                    ${(confidence * 100).toFixed(1)}%
                </td>

                <td>
                    ${capturedDate} ${capturedTime}
                </td>

                <td>
                    <span class="status completed">
                        Completed
                    </span>
                </td>

            `;


            // ---------------------------------
            // CLICK RECORD
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
            // ADD ROW TO TABLE
            // ---------------------------------

            recordsBody.appendChild(row);

        });


        console.log(
            "Firebase records displayed:",
            snapshot.size
        );


        // Apply current filters

        filterRecords();


    } catch (error) {

        console.error(
            "Firebase connection failed:",
            error
        );

    }

}


// =========================================
// START FIREBASE LOADING
// =========================================

loadScanRecords();