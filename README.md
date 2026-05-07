# ⛽ Petrol Tracker

A simple, responsive web application to track petrol and diesel fuel expenses across multiple vehicles.

## Features

- **Vehicle Number** — Enter vehicle registration numbers; previously entered numbers appear as a dropdown for quick selection.
- **Fuel Entries** — Record date, fuel filled (litres), total price (₹), and optional location for each fill-up.
- **Edit & Delete** — Edit or delete any entry from the fuel log.
- **Per-Vehicle Totals** — Select a vehicle from the dropdown to see its total fuel filled, total amount spent, number of entries, and average price per litre. When the same vehicle number has multiple entries, totals are automatically aggregated.
- **All Vehicles View** — Choose "All Vehicles" to see combined stats.
- **Spending Chart** — Bar chart showing monthly spending trends over the last 12 months (filtered by vehicle).
- **Export to Excel** — Download the fuel log (current filter) as an Excel file.
- **Local Storage** — All data is saved in your browser's local storage (no server required).
- **Responsive Design** — Works on desktop, tablet, and mobile.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Abhishekkl14/bike-petrol-tracker.git
   ```
2. Open `index.html` in your browser — no build step required.

## How to Use

1. Enter the **Vehicle Number** (type or choose from the dropdown of previously entered vehicles).
2. Fill in the **Date**, **Fuel Filled**, and **Price** fields. Optionally add a **Location**.
3. Click **Add Entry**.
4. Use the **Vehicle Summary** dropdown to filter by a specific vehicle and view its aggregated totals.
5. The **Spending Over Months** chart updates automatically based on the selected vehicle.
6. Scroll down to view and manage your full **Fuel Log**. Use the **Edit** and **Delete** buttons on each row.

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- [Chart.js](https://www.chartjs.org/) for spending visualisation
- [SheetJS (xlsx)](https://sheetjs.com/) for Excel export
- Browser `localStorage` for persistence
