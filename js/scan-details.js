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

const backButton =
    document.getElementById("backButton");


// Scan information

const scanId =
    document.getElementById("scanId");

const scanDate =
    document.getElementById("scanDate");

const scanStatus =
    document.getElementById("scanStatus");


// Detection information

const diseaseDetected =
    document.getElementById("diseaseDetected");

const confidence =
    document.getElementById("confidence");

const severity =
    document.getElementById("severity");


// Farm information

const farmerName =
    document.getElementById("farmerName");

const farmName =
    document.getElementById("farmName");


// =========================================
// DASHBOARD NAVIGATION
// =========================================

dashboardNav.addEventListener("click", () => {

    window.location.href = "dashboard.html";

});


// =========================================
// SCAN RECORDS NAVIGATION
// =========================================

scanRecordsNav.addEventListener("click", () => {

    window.location.href = "scan-records.html";

});


// =========================================
// BACK BUTTON
// =========================================

backButton.addEventListener("click", () => {

    window.location.href = "scan-records.html";

});


// =========================================
// LOGOUT
// =========================================

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


// =========================================
// LOAD SELECTED SCAN
// =========================================

function loadScanDetails() {

    const selectedScanId =
        localStorage.getItem("selectedScanId");


    // If no scan ID was selected,
    // keep the default sample data.

    if (!selectedScanId) {

        return;

    }


    // =========================================
    // SAMPLE SCAN RECORDS
    // =========================================

    const scanRecords = {

        "SCAN-000124": {

            scanId:
                "SCAN-000124",

            date:
                "May 18, 2025 10:24 AM",

            status:
                "Completed",

            disease:
                "Coffee Leaf Rust",

            confidence:
                "92.4%",

            severity:
                "High",

            farmerName:
                "Juan Dela Cruz",

            farmName:
                "PhytoSentry Farm"

        },


        "SCAN-000123": {

            scanId:
                "SCAN-000123",

            date:
                "May 18, 2025 09:15 AM",

            status:
                "Completed",

            disease:
                "Cercospora Leaf Spot",

            confidence:
                "89.1%",

            severity:
                "High",

            farmerName:
                "Maria Santos",

            farmName:
                "Santos Coffee Farm"

        },


        "SCAN-000122": {

            scanId:
                "SCAN-000122",

            date:
                "May 17, 2025 04:42 PM",

            status:
                "Completed",

            disease:
                "Coffee Berry Disease",

            confidence:
                "87.7%",

            severity:
                "Medium",

            farmerName:
                "Pedro Reyes",

            farmName:
                "Reyes Coffee Farm"

        },


        "SCAN-000121": {

            scanId:
                "SCAN-000121",

            date:
                "May 17, 2025 03:11 PM",

            status:
                "Completed",

            disease:
                "Healthy",

            confidence:
                "98.6%",

            severity:
                "Low",

            farmerName:
                "Ana Garcia",

            farmName:
                "Garcia Coffee Farm"

        },


        "SCAN-000120": {

            scanId:
                "SCAN-000120",

            date:
                "May 17, 2025 11:08 AM",

            status:
                "Completed",

            disease:
                "Coffee Leaf Rust",

            confidence:
                "91.3%",

            severity:
                "High",

            farmerName:
                "Carlos Cruz",

            farmName:
                "Cruz Coffee Farm"

        }

    };


    // =========================================
    // GET SELECTED RECORD
    // =========================================

    const record =
        scanRecords[selectedScanId];


    // If selected ID is not found,
    // only display the selected scan ID.

    if (!record) {

        scanId.textContent =
            selectedScanId;

        return;

    }


    // =========================================
    // DISPLAY RECORD
    // =========================================

    scanId.textContent =
        record.scanId;


    scanDate.textContent =
        record.date;


    scanStatus.textContent =
        record.status;


    diseaseDetected.textContent =
        record.disease;


    confidence.textContent =
        record.confidence;


    severity.textContent =
        record.severity;


    farmerName.textContent =
        record.farmerName;


    farmName.textContent =
        record.farmName;


    // =========================================
    // UPDATE SEVERITY STYLE
    // =========================================

    severity.classList.remove(
        "high",
        "medium",
        "low"
    );


    if (
        record.severity.toLowerCase() === "high"
    ) {

        severity.classList.add(
            "high"
        );

    }
    else if (
        record.severity.toLowerCase() === "medium"
    ) {

        severity.classList.add(
            "medium"
        );

    }
    else {

        severity.classList.add(
            "low"
        );

    }

}


// =========================================
// INITIALIZE
// =========================================

loadScanDetails();