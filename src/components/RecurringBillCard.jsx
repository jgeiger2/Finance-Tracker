import React from "react";
import "../App.css";
import {
  FaSyncAlt,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

const RecurringBillCard = ({
  title = "Apple TV+",
  amount = "$11.99",
  paid = true,
  dueDate = "5/14/2025",
  nextDue = "6/14/2025",
  status = "Trial ended",
  category = "Subscriptions",
  frequency = "Monthly",
}) => {
  // Badge and color logic
  let badgeClass = "rb-badge paid";
  let badgeText = "Paid";
  if (!paid && status.toLowerCase().includes("due")) {
    badgeClass = "rb-badge due";
    badgeText = "Due";
  } else if (!paid && status.toLowerCase().includes("trial")) {
    badgeClass = "rb-badge trial";
    badgeText = "Trial";
  }

  let amountClass = "rb-amount paid";
  if (!paid && status.toLowerCase().includes("due")) {
    amountClass = "rb-amount";
  } else if (!paid && status.toLowerCase().includes("trial")) {
    amountClass = "rb-amount trial";
  }

  // Button text and icon logic
  const payBtnText = paid ? "Unpay" : "Pay";
  const payBtnIcon = paid ? <FaTimesCircle /> : <FaCheckCircle />;

  const payBtnClass = `rb-action-btn unpay${!paid ? " pay" : ""}`;

  return (
    <div className="recurring-bill-card">
      {/* Header Row */}
      <div className="rb-header-row">
        <div className="rb-header-left">
          <FaSyncAlt className="rb-icon" />
          <span className="rb-title">{title}</span>
          <span className={badgeClass}>{badgeText}</span>
        </div>
        <div className="rb-header-right">
          <span className="rb-amount-label">Amount</span>
          <span className={amountClass}>{amount}</span>
        </div>
      </div>
      {/* Details Row */}
      <div className="rb-details-row">
        <div className="rb-details-col">
          <div>
            Category: <span className="rb-detail-value">{category}</span>
          </div>
          <div>
            {status.toLowerCase().includes("trial") ? (
              <>
                Trial End Date:{" "}
                <span className="rb-detail-value">{dueDate}</span>
              </>
            ) : (
              <>
                Due Date: <span className="rb-detail-value">{dueDate}</span>
              </>
            )}
          </div>
          {paid && (
            <div>
              Paid: <span className="rb-detail-value paid">{dueDate}</span>
            </div>
          )}
        </div>
        <div className="rb-details-col">
          <div>
            Frequency: <span className="rb-detail-value">{frequency}</span>
          </div>
          <div>
            Status:{" "}
            <span
              className={`rb-detail-value${
                status.toLowerCase().includes("trial")
                  ? " trial-ended"
                  : status.toLowerCase().includes("due")
                  ? " next-due"
                  : paid
                  ? " paid"
                  : ""
              }`}
            >
              {status}
            </span>
          </div>
          <div>
            Next Due:{" "}
            <span className="rb-detail-value next-due">{nextDue}</span>
          </div>
        </div>
        <div className="rb-actions-col">
          <button
            className={payBtnClass}
            title={paid ? "Mark as unpaid" : "Mark as paid"}
          >
            {payBtnIcon} {payBtnText}
          </button>
          <button className="rb-action-btn delete">
            <FaTrash /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecurringBillCard;
