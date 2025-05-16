import React from "react";
import "../App.css";

const SummaryCard = () => {
  return (
    <>
      <div className="summary-glass-card summary-glass-card-vertical">
        <div className="summary-label">Summary:</div>
        <div className="summary-columns">
          <div className="summary-column">
            <span className="summary-heading gradient-income">Income</span>
            <span className="summary-amount">$2,499.00</span>
          </div>
          <span className="summary-separator">|</span>
          <div className="summary-column">
            <span className="summary-heading gradient-bills">Bills</span>
            <span className="summary-amount">$365.95</span>
          </div>
        </div>
      </div>
      <div className="summary-action-row">
        <button className="summary-action-btn">
          Add <span className="gradient-expense">Expense</span>
        </button>
        <button className="summary-action-btn">
          Add <span className="gradient-bills">Recurring Bill</span>
        </button>
        <button className="summary-action-btn">
          Add <span className="gradient-trial">Free Trial</span>
        </button>
        <button className="summary-action-btn">
          Add <span className="gradient-income">Income</span>
        </button>
      </div>
    </>
  );
};

export default SummaryCard;
