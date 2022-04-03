// Creates temp database variable for indexedDB
let db;

// Contains request response upon opening the db
const request = indexedDB.open("budget_tracker", 1);

// Stores new budget into indexedDB
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("new_budget", { autoIncrement: true });
};

// Runs when indexedDB sucessfully opens
request.onsuccess = function (event) {
  db = event.target.result;

  // Checks if online to upload the current budget
  if (navigator.onLine) {
    uploadBudgets();
  }
};

// Console logs an error if request fails
request.onerror = function (event) {
  console.log(event.target.errorCode);
};

// Method that saves the transaction if there is no connection
function saveRecord(record) {
    const transaction = db.transaction(["new_budget"], "readwrite");
  
    const budgetObjectStore = transaction.objectStore("new_budget");
  
    budgetObjectStore.add(record);
  }
  