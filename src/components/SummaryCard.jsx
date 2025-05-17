import React, { useState } from "react";
import "../App.css";
import AddIncomeModal from "./AddIncomeModal";
import AddExpenseModal from "./AddExpenseModal";
import AddRecurringBillModal from "./AddRecurringBillModal";
import AddFreeTrialModal from "./AddFreeTrialModal";
import { useFirebase } from "../context/FirebaseContext";

const SummaryCard = () => {
  const { summary, refreshTransactions, refreshRecurringBills } = useFirebase();
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showRecurringBillModal, setShowRecurringBillModal] = useState(false);
  const [showFreeTrialModal, setShowFreeTrialModal] = useState(false);

  const openIncomeModal = () => {
    setShowIncomeModal(true);
  };

  const closeIncomeModal = () => {
    setShowIncomeModal(false);
  };

  const openExpenseModal = () => {
    setShowExpenseModal(true);
  };

  const closeExpenseModal = () => {
    setShowExpenseModal(false);
  };

  const openRecurringBillModal = () => {
    setShowRecurringBillModal(true);
  };

  const closeRecurringBillModal = () => {
    setShowRecurringBillModal(false);
  };

  const openFreeTrialModal = () => {
    setShowFreeTrialModal(true);
  };

  const closeFreeTrialModal = () => {
    setShowFreeTrialModal(false);
  };

  const handleTransactionAdded = () => {
    refreshTransactions();
  };

  const handleRecurringBillAdded = () => {
    refreshRecurringBills();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <>
      <div className="summary-glass-card summary-glass-card-vertical">
        <div className="summary-label">Summary:</div>
        <div className="summary-columns">
          <div className="summary-column">
            <span className="summary-heading gradient-income">Income</span>
            <span className="summary-amount">
              {formatCurrency(summary.income)}
            </span>
          </div>
          <span className="summary-separator">|</span>
          <div className="summary-column">
            <span className="summary-heading gradient-bills">Bills</span>
            <span className="summary-amount">
              {formatCurrency(summary.expenses)}
            </span>
          </div>
        </div>
      </div>
      <div className="summary-action-row">
        <button className="summary-action-btn" onClick={openExpenseModal}>
          Add <span className="gradient-expense">Expense</span>
        </button>
        <button className="summary-action-btn" onClick={openRecurringBillModal}>
          Add <span className="gradient-bills">Recurring Bill</span>
        </button>
        <button className="summary-action-btn" onClick={openFreeTrialModal}>
          Add <span className="gradient-trial">Free Trial</span>
        </button>
        <button className="summary-action-btn" onClick={openIncomeModal}>
          Add <span className="gradient-income">Income</span>
        </button>
      </div>

      {showIncomeModal && (
        <AddIncomeModal
          onClose={closeIncomeModal}
          onIncomeAdded={handleTransactionAdded}
        />
      )}

      {showExpenseModal && (
        <AddExpenseModal
          onClose={closeExpenseModal}
          onExpenseAdded={handleTransactionAdded}
        />
      )}

      {showRecurringBillModal && (
        <AddRecurringBillModal
          onClose={closeRecurringBillModal}
          onBillAdded={handleRecurringBillAdded}
        />
      )}

      {showFreeTrialModal && (
        <AddFreeTrialModal
          onClose={closeFreeTrialModal}
          onTrialAdded={handleRecurringBillAdded}
        />
      )}
    </>
  );
};

export default SummaryCard;
