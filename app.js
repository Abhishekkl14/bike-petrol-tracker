// ===== State =====
const STORAGE_KEY = "bikePetrolTracker";

function loadEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

let entries = loadEntries();
let selectedDate = new Date(); // controls which month is shown in the summary

// ===== DOM refs =====
const form = document.getElementById("fuelForm");
const dateInput = document.getElementById("date");
const fuelInput = document.getElementById("fuelFilled");
const priceInput = document.getElementById("pricePerLitre");
const mileageInput = document.getElementById("avgMileage");

const totalSpentEl = document.getElementById("totalSpent");
const totalFuelEl = document.getElementById("totalFuel");
const totalEntriesEl = document.getElementById("totalEntries");
const estDistanceEl = document.getElementById("estDistance");
const currentMonthEl = document.getElementById("currentMonth");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

const tableBody = document.getElementById("fuelTableBody");
const noEntriesEl = document.getElementById("noEntries");

// ===== Chart setup =====
let spendingChart = null;

function initChart() {
  const ctx = document.getElementById("spendingChart").getContext("2d");
  spendingChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Monthly Spending (₹)",
          data: [],
          backgroundColor: "rgba(37, 99, 235, 0.7)",
          borderColor: "rgba(37, 99, 235, 1)",
          borderWidth: 1,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `₹${ctx.raw.toFixed(2)}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => `₹${v}`,
          },
          grid: { color: "#e2e8f0" },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  });
}

// ===== Helpers =====
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function monthYearKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(year, month) {
  return new Date(year, month).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function showToast(msg) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

// ===== Render functions =====
function renderSummary() {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const key = `${year}-${String(month + 1).padStart(2, "0")}`;

  currentMonthEl.textContent = monthLabel(year, month);

  const monthEntries = entries.filter((e) => monthYearKey(e.date) === key);

  const spent = monthEntries.reduce((s, e) => s + e.totalCost, 0);
  const fuel = monthEntries.reduce((s, e) => s + e.fuelFilled, 0);
  const dist = monthEntries.reduce(
    (s, e) => s + e.fuelFilled * e.avgMileage,
    0
  );

  totalSpentEl.textContent = `₹${spent.toFixed(2)}`;
  totalFuelEl.textContent = `${fuel.toFixed(2)} L`;
  totalEntriesEl.textContent = monthEntries.length;
  estDistanceEl.textContent = `${dist.toFixed(1)} km`;
}

function renderTable() {
  // Sort entries newest-first
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  if (sorted.length === 0) {
    tableBody.innerHTML = "";
    noEntriesEl.style.display = "block";
    return;
  }

  noEntriesEl.style.display = "none";
  tableBody.innerHTML = sorted
    .map(
      (e) => `
    <tr>
      <td>${formatDate(e.date)}</td>
      <td>${e.fuelFilled.toFixed(2)}</td>
      <td>₹${e.pricePerLitre.toFixed(2)}</td>
      <td>₹${e.totalCost.toFixed(2)}</td>
      <td>${e.avgMileage} km/L</td>
      <td>${(e.fuelFilled * e.avgMileage).toFixed(1)} km</td>
      <td><button class="btn-delete" data-id="${e.id}">Delete</button></td>
    </tr>
  `
    )
    .join("");
}

function renderChart() {
  // Aggregate spending by month across all entries
  const monthMap = {};
  entries.forEach((e) => {
    const key = monthYearKey(e.date);
    monthMap[key] = (monthMap[key] || 0) + e.totalCost;
  });

  // Sort chronologically and show last 12 months
  const sortedKeys = Object.keys(monthMap).sort();
  const last12 = sortedKeys.slice(-12);

  const labels = last12.map((k) => {
    const [y, m] = k.split("-");
    return monthLabel(parseInt(y), parseInt(m) - 1);
  });
  const data = last12.map((k) => monthMap[k]);

  spendingChart.data.labels = labels;
  spendingChart.data.datasets[0].data = data;
  spendingChart.update();
}

function renderAll() {
  renderSummary();
  renderTable();
  renderChart();
}

// ===== Event handlers =====
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const entry = {
    id: Date.now().toString(),
    date: dateInput.value,
    fuelFilled: parseFloat(fuelInput.value),
    pricePerLitre: parseFloat(priceInput.value),
    avgMileage: parseFloat(mileageInput.value),
    totalCost: parseFloat(fuelInput.value) * parseFloat(priceInput.value),
  };

  entries.push(entry);
  saveEntries(entries);

  // Jump summary to the month of the new entry
  selectedDate = new Date(entry.date + "T00:00:00");
  renderAll();

  form.reset();
  dateInput.value = new Date().toISOString().split("T")[0];
  showToast("Entry added!");
});

tableBody.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    entries = entries.filter((en) => en.id !== id);
    saveEntries(entries);
    renderAll();
    showToast("Entry deleted");
  }
});

prevMonthBtn.addEventListener("click", () => {
  selectedDate.setMonth(selectedDate.getMonth() - 1);
  renderSummary();
});

nextMonthBtn.addEventListener("click", () => {
  selectedDate.setMonth(selectedDate.getMonth() + 1);
  renderSummary();
});

// ===== Init =====
dateInput.value = new Date().toISOString().split("T")[0];
initChart();
renderAll();
