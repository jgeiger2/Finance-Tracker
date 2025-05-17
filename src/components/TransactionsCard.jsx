import React, { useState, useEffect } from "react";
import { FaTrash, FaSpinner } from "react-icons/fa";
import "../App.css";
import { useFirebase } from "../context/FirebaseContext";
import { deleteTransaction } from "../firebase/transactionService";

const TransactionsCard = () => {
  // Get original transactions list from context
  const { transactions, refreshTransactions } = useFirebase();

  // Local state
  const [activeTab, setActiveTab] = useState("All");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loadingStates, setLoadingStates] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Apply filter whenever transactions or active tab changes
  useEffect(() => {
    setIsLoading(true);

    try {
      // Make a copy of transactions to prevent reference issues
      const allTransactions = [...(transactions || [])];

      // Apply filter based on active tab
      let filtered = allTransactions;
      if (activeTab === "Income") {
        filtered = allTransactions.filter((t) => t.type === "income");
      } else if (activeTab === "Expenses") {
        filtered = allTransactions.filter((t) => t.type === "expense");
      }

      console.log(
        `Filtering to ${activeTab}: ${filtered.length} of ${allTransactions.length} transactions`
      );
      setFilteredTransactions(filtered);
    } catch (error) {
      console.error("Error filtering transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [transactions, activeTab]);

  // Handle tab change
  const handleTabChange = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  const handleDelete = async (id) => {
    try {
      // Set loading state for this specific button
      setLoadingStates((prev) => ({ ...prev, [id]: true }));

      // Get current transaction to ensure we have the right userId
      const transaction = filteredTransactions.find((t) => t.id === id);
      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // Delete the transaction
      await deleteTransaction(id);

      // Manually refresh transactions to update the UI
      await refreshTransactions();

      // Clear loading state
      setLoadingStates((prev) => ({ ...prev, [id]: false }));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });

      // Clear loading state even if there's an error
      setLoadingStates((prev) => ({ ...prev, [id]: false }));

      // Better error message
      alert(
        `Error deleting transaction: ${error.message || "Please try again."}`
      );
    }
  };

  // Format the date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  // Check if we have any transactions
  const noTransactions = filteredTransactions.length === 0;

  return (
    <div className="transactions-glass-card">
      <div className="transactions-header">
        <h2 className="transactions-title">Transactions</h2>
        <p className="transactions-desc">View and manage your entries</p>
      </div>

      <div className="transactions-tabs">
        <button
          className={`tab-button ${activeTab === "All" ? "active" : ""}`}
          onClick={() => handleTabChange("All")}
          disabled={isLoading}
        >
          All
        </button>
        <button
          className={`tab-button ${activeTab === "Income" ? "active" : ""}`}
          onClick={() => handleTabChange("Income")}
          disabled={isLoading}
        >
          Income
        </button>
        <button
          className={`tab-button ${activeTab === "Expenses" ? "active" : ""}`}
          onClick={() => handleTabChange("Expenses")}
          disabled={isLoading}
        >
          Expenses
        </button>
      </div>

      <div className="transactions-list">
        {isLoading ? (
          <div className="loading-transactions">
            <FaSpinner className="spinner" /> Loading transactions...
          </div>
        ) : noTransactions ? (
          <div className="no-transactions">
            {transactions && transactions.length > 0
              ? `No ${
                  activeTab !== "All" ? activeTab.toLowerCase() : ""
                } transactions found.`
              : "No transactions found. Add some to get started!"}
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div className="transaction-item" key={transaction.id}>
              <div
                className={`transaction-dot ${
                  transaction.type === "income" ? "income" : "expense"
                }`}
              ></div>
              <div className="transaction-content">
                <div className="transaction-title">{transaction.title}</div>
                <div className="transaction-details">
                  {transaction.category}{" "}
                  {transaction.company && (
                    <>
                      <span className="bullet">•</span> {transaction.company}
                    </>
                  )}{" "}
                  <span className="bullet">•</span>{" "}
                  {formatDate(transaction.date)}
                </div>
              </div>
              <div
                className={`transaction-amount ${
                  transaction.type === "income" ? "income" : "expense"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"}${transaction.amount}
              </div>
              <button
                className="transaction-delete"
                title="Delete transaction"
                onClick={() => handleDelete(transaction.id)}
                disabled={loadingStates[transaction.id]}
              >
                {loadingStates[transaction.id] ? (
                  <FaSpinner className="spinner" />
                ) : (
                  <FaTrash />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionsCard;
