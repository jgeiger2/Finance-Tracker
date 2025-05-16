import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";
import "../App.css";

const TransactionsCard = () => {
  const [activeTab, setActiveTab] = useState("All");

  return (
    <div className="transactions-glass-card">
      <div className="transactions-header">
        <h2 className="transactions-title">Transactions</h2>
        <p className="transactions-desc">View and manage your entries</p>
      </div>

      <div className="transactions-tabs">
        <button
          className={`tab-button ${activeTab === "All" ? "active" : ""}`}
          onClick={() => setActiveTab("All")}
        >
          All
        </button>
        <button
          className={`tab-button ${activeTab === "Income" ? "active" : ""}`}
          onClick={() => setActiveTab("Income")}
        >
          Income
        </button>
        <button
          className={`tab-button ${activeTab === "Expenses" ? "active" : ""}`}
          onClick={() => setActiveTab("Expenses")}
        >
          Expenses
        </button>
      </div>

      <div className="transactions-list">
        <div className="transaction-item">
          <div className="transaction-dot expense"></div>
          <div className="transaction-content">
            <div className="transaction-title">Payment: Apple TV+</div>
            <div className="transaction-details">
              Subscriptions <span className="bullet">•</span> 5/14/2025
            </div>
          </div>
          <div className="transaction-amount expense">-$11.99</div>
          <button className="transaction-delete" title="Delete transaction">
            <FaTrash />
          </button>
        </div>

        <div className="transaction-item">
          <div className="transaction-dot expense"></div>
          <div className="transaction-content">
            <div className="transaction-title">Quick Test Entry</div>
            <div className="transaction-details">
              Food <span className="bullet">•</span> 5/14/2025
            </div>
          </div>
          <div className="transaction-amount expense">-$25.99</div>
          <button className="transaction-delete" title="Delete transaction">
            <FaTrash />
          </button>
        </div>

        <div className="transaction-item">
          <div className="transaction-dot income"></div>
          <div className="transaction-content">
            <div className="transaction-title">Test Income Entry</div>
            <div className="transaction-details">
              Salary <span className="bullet">•</span> Test Company{" "}
              <span className="bullet">•</span> 5/13/2025
            </div>
          </div>
          <div className="transaction-amount income">+$1000.00</div>
          <button className="transaction-delete" title="Delete transaction">
            <FaTrash />
          </button>
        </div>

        <div className="transaction-item">
          <div className="transaction-dot expense"></div>
          <div className="transaction-content">
            <div className="transaction-title">Payment: bill</div>
            <div className="transaction-details">
              Healthcare <span className="bullet">•</span> 5/13/2025
            </div>
          </div>
          <div className="transaction-amount expense">-$99.00</div>
          <button className="transaction-delete" title="Delete transaction">
            <FaTrash />
          </button>
        </div>

        <div className="transaction-item">
          <div className="transaction-dot income"></div>
          <div className="transaction-content">
            <div className="transaction-title">999</div>
            <div className="transaction-details">
              Salary <span className="bullet">•</span> Lowe's{" "}
              <span className="bullet">•</span> 5/13/2025
            </div>
          </div>
          <div className="transaction-amount income">+$999.00</div>
          <button className="transaction-delete" title="Delete transaction">
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsCard;
