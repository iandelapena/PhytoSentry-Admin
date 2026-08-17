# PhytoSentry Admin Dashboard

A web-based admin dashboard for managing and viewing PhytoSentry scan records.

## What is it for?

The system allows administrators to:

* View dashboard statistics
* View recent scan records
* Search and filter scan records
* View detailed information about a scan
* Download scan records as a CSV report
* Navigate between the dashboard and scan records
* Log out of the admin dashboard

## How to Use

1. Open `index.html` to access the login page.
2. Log in using the available admin credentials.
3. From the dashboard, view the summary statistics and recent scans.
4. Click a scan record to view its detailed information.
5. Go to **Scan Records** to search or filter records.
6. Click **Download Report** to export the displayed records as a CSV file.
7. Click **Logout** to return to the login page.

## Technologies Used

* HTML
* CSS
* JavaScript
* LocalStorage

## Project Structure

```text
PhytoSentry/
├── index.html
├── dashboard.html
├── scan-records.html
├── scan-details.html
├── css/
│   ├── dashboard.css
│   ├── scan-records.css
│   └── scan-details.css
├── js/
│   ├── dashboard.js
│   ├── scan-records.js
│   └── scan-details.js
└── assets/
    └── images/
```
