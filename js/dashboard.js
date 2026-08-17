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