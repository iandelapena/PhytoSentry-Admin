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
// LOAD DASHBOARD DATA
// =========================================

async function loadDashboardData() {

    try {

        // =====================================
        // GET USERS
        // =====================================

        const usersSnapshot =
            await getDocs(
                collection(db, "users")
            );


        // =====================================
        // GET SCAN RECORDS
        // =====================================

        const scansSnapshot =
            await getDocs(
                collection(db, "scanHistory")
            );


        console.log(
            "Dashboard Firebase connected!"
        );

        console.log(
            "Users found:",
            usersSnapshot.size
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
            usersSnapshot.size;

        totalScans.textContent =
            scansSnapshot.size;

        diseaseDetections.textContent =
            diseaseCount;

        activeFarms.textContent =
            farms.size;


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


        // =====================================
        // SUCCESS
        // =====================================

        console.log(
            "Dashboard loaded successfully!"
        );

        console.log(
            "Total users:",
            usersSnapshot.size
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