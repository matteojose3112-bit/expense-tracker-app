const balance = document.getElementById("balance");
const form = document.getElementById("form");
const list = document.getElementById("list");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

let currentFilter = "all";
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let chart;

// ✅ MAIN UI UPDATE
function updateUI() {
  list.innerHTML = "";

  // empty state
  if (transactions.length === 0) {
    list.innerHTML = "<p>No transactions yet</p>";
    balance.innerText = 0;
    incomeEl.innerText = 0;
    expenseEl.innerText = 0;
    updateChart();
    return;
  }

  let total = 0;
  let income = 0;
  let expense = 0;

  transactions.forEach((t, index) => {

    if (currentFilter === "income" && t.amount < 0) return;
    if (currentFilter === "expense" && t.amount > 0) return;

    total += t.amount;

    if (t.amount > 0) income += t.amount;
    else expense += t.amount;

    const li = document.createElement("li");
    li.classList.add(t.amount > 0 ? "income" : "expense");

    li.innerHTML = `
      <div>
        ${t.text}
        <span class="tag ${t.category.toLowerCase()}">${t.category}</span>
      </div>
      <span>${t.amount > 0 ? "+" : ""}$${Math.abs(t.amount)}</span>
      <button onclick="deleteTx(${index})">x</button>
    `;

    list.appendChild(li);
  });

  balance.innerText = total;
  incomeEl.innerText = income;
  expenseEl.innerText = expense;

  updateChart(); // ✅ always update chart
}

// ✅ DELETE
function deleteTx(index) {
  transactions.splice(index, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateUI();
}

// ✅ FILTER
function setFilter(type) {
  currentFilter = type;
  updateUI();
}

// ✅ ADD TRANSACTION
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = document.getElementById("text").value;
  const amount = +document.getElementById("amount").value;
  const category = document.getElementById("category").value;

  transactions.push({ text, amount, category });

  localStorage.setItem("transactions", JSON.stringify(transactions));

  form.reset();
  updateUI();
});

// ✅ CHART
function updateChart() {
  const data = {};

  transactions.forEach(t => {
    if (t.amount < 0) {
      if (!data[t.category]) data[t.category] = 0;
      data[t.category] += Math.abs(t.amount);
    }
  });

  const labels = Object.keys(data);
  const values = Object.values(data);

  if (chart) chart.destroy();

  const ctx = document.getElementById("chart").getContext("2d");

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{
        data: values
      }]
    }
  });
}

// ✅ CLEAR ALL
function clearAll() {
  transactions = [];
  localStorage.removeItem("transactions");
  updateUI();
}

// ✅ EXPORT
function exportData() {
  const dataStr = JSON.stringify(transactions, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.json";
  a.click();
}

// ✅ INIT
updateUI();
