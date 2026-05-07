// ===== State =====
const STORAGE_KEY = "petrolTracker";

function loadEntries() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

let entries = loadEntries();
let editingId = null;

// ===== DOM refs =====
const form = document.getElementById("fuelForm");
const vehicleInput = document.getElementById("vehicleNumber");
const vehicleDatalist = document.getElementById("vehicleList");
const dateInput = document.getElementById("date");
const fuelInput = document.getElementById("fuelFilled");
const priceInput = document.getElementById("price");
const locationInput = document.getElementById("location");

const vehicleFilter = document.getElementById("vehicleFilter");
const totalSpentEl = document.getElementById("totalSpent");
const totalFuelEl = document.getElementById("totalFuel");
const totalEntriesEl = document.getElementById("totalEntries");
const avgPricePerLitreEl = document.getElementById("avgPricePerLitre");

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
          label: "Monthly Spending (\u20b9)",
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
            label: (ctx) => `\u20b9${ctx.raw.toFixed(2)}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => `\u20b9${v}`,
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

function getUniqueVehicles() {
  const vehicles = new Set();
  entries.forEach((e) => vehicles.add(e.vehicleNumber.toUpperCase()));
  return [...vehicles].sort();
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

// ===== Update vehicle datalist and filter dropdown =====
function updateVehicleOptions() {
  const vehicles = getUniqueVehicles();

  vehicleDatalist.innerHTML = vehicles
    .map((v) => `<option value="${v}">`)
    .join("");

  const currentFilter = vehicleFilter.value;
  vehicleFilter.innerHTML = '<option value="__all__">All Vehicles</option>';
  vehicles.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    vehicleFilter.appendChild(opt);
  });

  if (vehicles.includes(currentFilter) || currentFilter === "__all__") {
    vehicleFilter.value = currentFilter;
  } else {
    vehicleFilter.value = "__all__";
  }
}

// ===== Render functions =====
function renderSummary() {
  const selected = vehicleFilter.value;

  const filtered =
    selected === "__all__"
      ? entries
      : entries.filter((e) => e.vehicleNumber.toUpperCase() === selected);

  const totalFuel = filtered.reduce((s, e) => s + e.fuelFilled, 0);
  const totalSpent = filtered.reduce((s, e) => s + e.price, 0);
  const avgPrice = totalFuel > 0 ? totalSpent / totalFuel : 0;

  totalFuelEl.textContent = `${totalFuel.toFixed(2)} L`;
  totalSpentEl.textContent = `\u20b9${totalSpent.toFixed(2)}`;
  totalEntriesEl.textContent = filtered.length;
  avgPricePerLitreEl.textContent = `\u20b9${avgPrice.toFixed(2)}`;
}

function renderTable() {
  const selected = vehicleFilter.value;

  const filtered =
    selected === "__all__"
      ? [...entries]
      : entries.filter((e) => e.vehicleNumber.toUpperCase() === selected);

  const sorted = filtered.sort(
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
    <tr${editingId === e.id ? ' class="editing-row"' : ""}>
      <td>${e.vehicleNumber}</td>
      <td>${formatDate(e.date)}</td>
      <td>${e.fuelFilled.toFixed(2)}</td>
      <td>\u20b9${e.price.toFixed(2)}</td>
      <td>\u20b9${(e.price / e.fuelFilled).toFixed(2)}</td>
      <td>${e.location || "-"}</td>
      <td class="action-btns">
        <button class="btn-edit" data-id="${e.id}">Edit</button>
        <button class="btn-delete" data-id="${e.id}">Delete</button>
      </td>
    </tr>
  `
    )
    .join("");
}

function renderChart() {
  const selected = vehicleFilter.value;

  const filtered =
    selected === "__all__"
      ? entries
      : entries.filter((e) => e.vehicleNumber.toUpperCase() === selected);

  const monthMap = {};
  filtered.forEach((e) => {
    const key = monthYearKey(e.date);
    monthMap[key] = (monthMap[key] || 0) + e.price;
  });

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
  updateVehicleOptions();
  renderSummary();
  renderTable();
  renderChart();
}

// ===== Form state helpers =====
const submitBtn = form.querySelector("button[type='submit']");

function setFormEditMode(entry) {
  editingId = entry.id;
  vehicleInput.value = entry.vehicleNumber;
  dateInput.value = entry.date;
  fuelInput.value = entry.fuelFilled;
  priceInput.value = entry.price;
  locationInput.value = entry.location || "";
  submitBtn.textContent = "Update Entry";
  form.classList.add("editing");
  form.parentElement.querySelector("h2").textContent = "Edit Fuel Entry";
  renderTable();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function resetForm() {
  editingId = null;
  form.reset();
  dateInput.value = new Date().toISOString().split("T")[0];
  submitBtn.textContent = "Add Entry";
  form.classList.remove("editing");
  form.parentElement.querySelector("h2").textContent = "Add Fuel Entry";
}

// ===== Event handlers =====
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const vehicleNum = vehicleInput.value.trim().toUpperCase();

  if (editingId) {
    const idx = entries.findIndex((en) => en.id === editingId);
    if (idx !== -1) {
      entries[idx].vehicleNumber = vehicleNum;
      entries[idx].date = dateInput.value;
      entries[idx].fuelFilled = parseFloat(fuelInput.value);
      entries[idx].price = parseFloat(priceInput.value);
      entries[idx].location = locationInput.value.trim();
    }
    saveEntries(entries);
    resetForm();
    renderAll();
    showToast("Entry updated!");
  } else {
    const entry = {
      id: Date.now().toString(),
      vehicleNumber: vehicleNum,
      date: dateInput.value,
      fuelFilled: parseFloat(fuelInput.value),
      price: parseFloat(priceInput.value),
      location: locationInput.value.trim(),
    };

    entries.push(entry);
    saveEntries(entries);
    renderAll();

    form.reset();
    dateInput.value = new Date().toISOString().split("T")[0];
    showToast("Entry added!");
  }
});

tableBody.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-edit")) {
    const id = e.target.dataset.id;
    const entry = entries.find((en) => en.id === id);
    if (entry) setFormEditMode(entry);
  }

  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    entries = entries.filter((en) => en.id !== id);
    saveEntries(entries);
    if (editingId === id) resetForm();
    renderAll();
    showToast("Entry deleted");
  }
});

vehicleFilter.addEventListener("change", () => {
  renderSummary();
  renderTable();
  renderChart();
});

// ===== Export to Excel =====
document.getElementById("exportExcel").addEventListener("click", () => {
  if (entries.length === 0) {
    showToast("No entries to export");
    return;
  }

  const selected = vehicleFilter.value;
  const filtered =
    selected === "__all__"
      ? [...entries]
      : entries.filter((e) => e.vehicleNumber.toUpperCase() === selected);

  const sorted = filtered.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const rows = sorted.map((e) => ({
    "Vehicle Number": e.vehicleNumber,
    Date: formatDate(e.date),
    "Fuel Filled (L)": e.fuelFilled,
    "Price (\u20b9)": e.price,
    "\u20b9/Litre": parseFloat((e.price / e.fuelFilled).toFixed(2)),
    Location: e.location || "-",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  const colWidths = Object.keys(rows[0]).map((key) => ({
    wch: Math.max(key.length, 14),
  }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Fuel Log");

  XLSX.writeFile(wb, "fuel-log.xlsx");
  showToast("Excel file downloaded!");
});

// ===== Init =====
dateInput.value = new Date().toISOString().split("T")[0];
initChart();
renderAll();
