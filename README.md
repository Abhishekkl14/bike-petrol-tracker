# 🏍️ Bike Petrol Tracker

A simple, responsive web application to track your bike's petrol/fuel expenses.

## Features

- **Add Fuel Entries** — Record date, fuel filled (litres), price per litre (₹), and average mileage (km/L).
- **Monthly Summary** — View total money spent, total fuel consumed, number of entries, and estimated distance covered for any month.
- **Spending Chart** — Bar chart showing monthly spending trends over the last 12 months.
- **Fuel Log** — Full history of all fuel entries with the ability to delete any entry.
- **Local Storage** — All data is saved in your browser's local storage (no server required).
- **Responsive Design** — Works on desktop, tablet, and mobile.

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/Abhishekkl14/bike-petrol-tracker.git
   ```
2. Open `index.html` in your browser — no build step required.

## How to Use

1. Fill in the **Date**, **Fuel Filled**, **Price per Litre**, and **Avg Mileage** fields.
2. Click **Add Entry**.
3. Use the **Monthly Summary** section to navigate between months and see totals.
4. The **Spending Over Months** chart updates automatically.
5. Scroll down to view and manage your full **Fuel Log**.

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- [Chart.js](https://www.chartjs.org/) for spending visualisation
- Browser `localStorage` for persistence
