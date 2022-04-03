// Creates temp database variable for indexedDB
let db;

// Contains request response upon opening the db
const request = indexedDB.open("budget_tracker", 1);

// Creates an object store for new budget
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
  
  // Method that uploads the budget once connection is back up
  function uploadBudgets() {
    /// Opens the transaction in indexedDB
    const transaction = db.transaction(["new_budget"], "readwrite");
  
    // Accesses the budget store
    const budgetObjectStore = transaction.objectStore("new_budget");
  
    // Gathers all the transactions stored in the object store
    const getAll = budgetObjectStore.getAll();
  
    // If getAll is successfull, this function will run
    getAll.onsuccess = function () {
      // Does an api call with the stored up transactions
      if (getAll.result.length > 0) {
        fetch("/api/transaction", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((serverResponse) => {
            if (serverResponse.message) {
              throw new Error(serverResponse);
            }
            
            const transaction = db.transaction(["new_budget"], "readwrite");
            
            const budgetObjectStore = transaction.objectStore("new_budget");
            
            // Clears the object store
            budgetObjectStore.clear();
  
            alert("All saved offline transactions have been submitted!");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    };
  }
  
  // Alerts the program when the user is back online to then upload the budget
  window.addEventListener("online", uploadBudgets);