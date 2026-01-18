// ==============================
// DOM ELEMENTS
// ==============================
const balanceEl = document.getElementById("balance");
const transactionsEl = document.getElementById("transactions");
const dateEl = document.getElementById("currentDate");

const fab = document.getElementById("fab");
const modal = document.getElementById("modal");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

const incomeBtn = document.getElementById("incomeBtn");
const expenseBtn = document.getElementById("expenseBtn");

const amountInput = document.getElementById("amount");
const titleInput = document.getElementById("title");

// ==============================
// STATE
// ==============================
let currentType = "income";
let currentDate = new Date().toISOString().slice(0, 10);

// Ledger storage structure
// store[date] = { openingBalance: number, transactions: [] }
let store = JSON.parse(localStorage.getItem("finora")) || {};

// ==============================
// HELPERS
// ==============================
function getPreviousDate(date) {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Ensure day exists with carry-forward balance
function ensureDay(date) {
  if (store[date]) return;

  const prevDate = getPreviousDate(date);
  let openingBalance = 0;

  if (store[prevDate]) {
    openingBalance = store[prevDate].openingBalance;
    store[prevDate].transactions.forEach(t => {
      openingBalance += t.type === "income" ? t.amount : -t.amount;
    });
  }

  store[date] = {
    openingBalance,
    transactions: []
  };

  localStorage.setItem("finora", JSON.stringify(store));
}

// ==============================
// RENDER
// ==============================
function render() {
  ensureDay(currentDate);

  const day = store[currentDate];
  let balance = day.openingBalance;

  transactionsEl.innerHTML = "";

  day.transactions.forEach(t => {
    balance += t.type === "income" ? t.amount : -t.amount;

    const li = document.createElement("li");
    li.innerHTML = `
      <span>${t.title}</span>
      <span class="${t.type}">₹ ${t.amount}</span>
    `;
    transactionsEl.appendChild(li);
  });

  balanceEl.textContent = `₹ ${balance}`;
  dateEl.textContent = currentDate;
}

// ==============================
// TYPE TOGGLE
// ==============================
function setType(type) {
  currentType = type;

  incomeBtn.classList.toggle("active", type === "income");
  expenseBtn.classList.toggle("active", type === "expense");

  saveBtn.className = `save ${type}`;
  fab.className = `fab ${type}`;
}

incomeBtn.onclick = () => setType("income");
expenseBtn.onclick = () => setType("expense");

// ==============================
// MODAL CONTROLS
// ==============================
fab.onclick = () => {
  modal.classList.add("show");
};

cancelBtn.onclick = () => {
  modal.classList.remove("show");
};

// ==============================
// SAVE TRANSACTION
// ==============================
saveBtn.onclick = () => {
  if (!amountInput.value || +amountInput.value <= 0) return;

  ensureDay(currentDate);

  store[currentDate].transactions.push({
    title: titleInput.value || currentType,
    amount: +amountInput.value,
    type: currentType
  });

  localStorage.setItem("finora", JSON.stringify(store));

  amountInput.value = "";
  titleInput.value = "";
  modal.classList.remove("show");

  render();
};

// ==============================
// DATE NAVIGATION
// ==============================
document.getElementById("prevDay").onclick = () => {
  const d = new Date(currentDate);
  d.setDate(d.getDate() - 1);
  currentDate = d.toISOString().slice(0, 10);
  render();
};

document.getElementById("nextDay").onclick = () => {
  const d = new Date(currentDate);
  d.setDate(d.getDate() + 1);
  currentDate = d.toISOString().slice(0, 10);
  render();
};

// ==============================
// THEME TOGGLE
// ==============================
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("light");
};

// ==============================
// INIT
// ==============================
render();
