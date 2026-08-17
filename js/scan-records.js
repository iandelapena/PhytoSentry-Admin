// =========================================
// ELEMENTS
// =========================================

const dashboardNav =
    document.getElementById("dashboardNav");

const scanRecordsNav =
    document.getElementById("scanRecordsNav");

const logoutButton =
    document.getElementById("logoutButton");

const searchInput =
    document.getElementById("searchInput");

const startDate =
    document.getElementById("startDate");

const endDate =
    document.getElementById("endDate");

const diseaseFilter =
    document.getElementById("diseaseFilter");

const downloadReport =
    document.getElementById("downloadReport");

const recordRows =
    document.querySelectorAll(".record-row");

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


    recordRows.forEach((row) => {

        // =====================================
        // GET RECORD DATA
        // =====================================

        const firstName =
            (row.dataset.firstName || "")
                .toLowerCase();


        const lastName =
            (row.dataset.lastName || "")
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
// DOWNLOAD REPORT
// =========================================

downloadReport.addEventListener("click", () => {

    const rows =
        Array.from(recordRows)
            .filter(row =>
                row.style.display !== "none"
            );


    if (rows.length === 0) {

        alert(
            "There are no records to download."
        );

        return;

    }


    // =====================================
    // CSV HEADER
    // =====================================

    let csv =
        "First Name,Last Name,Scan ID,Disease Detected,Confidence %,Date/Time,Status\n";


    // =====================================
    // CSV DATA
    // =====================================

    rows.forEach((row) => {

        const cells =
            row.querySelectorAll("td");


        const firstName =
            cells[0].textContent.trim();


        const lastName =
            cells[1].textContent.trim();


        const scanId =
            cells[2].textContent.trim();


        const disease =
            cells[3].textContent.trim();


        const confidence =
            cells[4].textContent.trim();


        const dateTime =
            cells[5].textContent.trim();


        const status =
            cells[6].textContent.trim();


        csv +=
            `"${firstName}","${lastName}","${scanId}","${disease}","${confidence}","${dateTime}","${status}"\n`;

    });


    // =====================================
    // CREATE CSV FILE
    // =====================================

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

});