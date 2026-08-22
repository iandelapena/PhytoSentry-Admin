import { db } from "./firebase.js";

import {
    doc,
    getDoc
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

const backButton =
    document.getElementById("backButton");


// =========================================
// SCAN INFORMATION
// =========================================

const scanId =
    document.getElementById("scanId");

const scanDate =
    document.getElementById("scanDate");

const scanStatus =
    document.getElementById("scanStatus");


// =========================================
// DETECTION INFORMATION
// =========================================

const diseaseDetected =
    document.getElementById("diseaseDetected");

const confidence =
    document.getElementById("confidence");

const severity =
    document.getElementById("severity");


// =========================================
// FARM INFORMATION
// =========================================

const farmerName =
    document.getElementById("farmerName");

const farmName =
    document.getElementById("farmName");


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
// BACK BUTTON
// =========================================

backButton.addEventListener("click", () => {

    window.location.href =
        "scan-records.html";

});


// =========================================
// LOGOUT
// =========================================

logoutButton.addEventListener("click", () => {

    logoutModal.classList.add("show");

});


cancelLogout.addEventListener("click", () => {

    logoutModal.classList.remove("show");

});


confirmLogout.addEventListener("click", () => {

    localStorage.removeItem(
        "phytosentryAdminUsername"
    );

    localStorage.removeItem(
        "selectedScanId"
    );

    window.location.href =
        "login.html";

});


// =========================================
// LOAD SELECTED SCAN
// =========================================

async function loadScanDetails() {

    try {

        // -----------------------------------------
        // GET SELECTED SCAN ID
        // -----------------------------------------

        const selectedScanId =
            localStorage.getItem(
                "selectedScanId"
            );


        if (!selectedScanId) {

            console.error(
                "No scan was selected."
            );

            return;

        }


        console.log(
            "Loading scan:",
            selectedScanId
        );


        // -----------------------------------------
        // GET DOCUMENT FROM FIRESTORE
        // -----------------------------------------

        const scanReference =
            doc(
                db,
                "scanHistory",
                selectedScanId
            );


        const scanSnapshot =
            await getDoc(
                scanReference
            );


        // -----------------------------------------
        // CHECK IF SCAN EXISTS
        // -----------------------------------------

        if (!scanSnapshot.exists()) {

            console.error(
                "Scan not found in Firebase:",
                selectedScanId
            );

            scanId.textContent =
                selectedScanId;

            return;

        }


        // -----------------------------------------
        // GET FIREBASE DATA
        // -----------------------------------------

        const data =
            scanSnapshot.data();


        console.log(
            "Selected scan data:",
            data
        );


        // =========================================
        // SCAN INFORMATION
        // =========================================

        const actualScanId =
            data.id ||
            scanSnapshot.id;


        const capturedDate =
            data.capturedDate ||
            "—";


        const capturedTime =
            data.capturedTime ||
            "";


        const status =
            data.status ||
            "Completed";


        scanId.textContent =
            actualScanId;


        scanDate.textContent =
            `${capturedDate} ${capturedTime}`;


        scanStatus.textContent =
            status;


        // =========================================
        // DETECTION RESULTS
        // =========================================

        const disease =
            data.displayName ||
            data.scientificName ||
            data.prediction?.label ||
            "Unknown";


        const confidenceValue =
            Number(
                data.prediction?.confidence ||
                0
            );


        diseaseDetected.textContent =
            disease;


        confidence.textContent =
            `${(
                confidenceValue * 100
            ).toFixed(1)}%`;


        // =========================================
        // SEVERITY
        // =========================================

        const actualSeverity =
            data.severity ||
            data.prediction?.severity ||
            "—";


        severity.textContent =
            actualSeverity;


        severity.classList.remove(
            "high",
            "medium",
            "low"
        );


        if (
            actualSeverity &&
            actualSeverity.toLowerCase() === "high"
        ) {

            severity.classList.add(
                "high"
            );

        }
        else if (
            actualSeverity &&
            actualSeverity.toLowerCase() === "medium"
        ) {

            severity.classList.add(
                "medium"
            );

        }
        else if (
            actualSeverity &&
            actualSeverity.toLowerCase() === "low"
        ) {

            severity.classList.add(
                "low"
            );

        }


        // =========================================
        // FARM DETAILS
        // =========================================

        const firstName =
            data.firstName ||
            "";


        const lastName =
            data.LastName ||
            data.lastName ||
            "";


        const actualFarmerName =
            `${firstName} ${lastName}`
                .trim();


        const actualFarmName =
            data.farmName ||
            data.FarmName ||
            "—";


        farmerName.textContent =
            actualFarmerName || "—";


        farmName.textContent =
            actualFarmName;


        // =========================================
        // SUCCESS
        // =========================================

        console.log(
            "Scan details loaded successfully!"
        );

    }

    catch (error) {

        console.error(
            "Error loading scan details:",
            error
        );

    }

}


// =========================================
// INITIALIZE
// =========================================

loadScanDetails();