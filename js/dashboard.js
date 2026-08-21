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