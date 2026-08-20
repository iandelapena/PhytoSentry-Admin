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
// DOWNLOAD REPORT
// =========================================

downloadButton.addEventListener("click", () => {

    const rows =
    Array.from(
        document.querySelectorAll(".record-row")
    )
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
    "First Name,Last Name,Farm Name,Scan ID,Disease Detected,Confidence %,Date/Time,Status\n";


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