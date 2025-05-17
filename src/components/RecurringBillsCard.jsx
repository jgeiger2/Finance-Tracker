import React, { useState } from "react";
import {
  FaSync,
  FaTrash,
  FaSpinner,
  FaBell,
  FaBellSlash,
} from "react-icons/fa";
import "../App.css";
import { useFirebase } from "../context/FirebaseContext";
import {
  deleteRecurringBill,
  updateRecurringBill,
} from "../firebase/recurringBillService";
import { addReminder } from "../firebase/reminderService";

const RecurringBillsCard = () => {
  const { recurringBills, refreshRecurringBills, refreshReminders } =
    useFirebase();
  const [loadingStates, setLoadingStates] = useState({});

  const handleDelete = async (id) => {
    try {
      // Set loading state for this specific button
      setLoadingStates((prev) => ({ ...prev, [`delete_${id}`]: true }));

      // Call Firebase delete function
      await deleteRecurringBill(id);

      // Refresh the list of bills
      await refreshRecurringBills();

      // Clear loading state
      setLoadingStates((prev) => ({ ...prev, [`delete_${id}`]: false }));
    } catch (error) {
      console.error("Error deleting recurring bill:", error);
      // Clear loading state even if there's an error
      setLoadingStates((prev) => ({ ...prev, [`delete_${id}`]: false }));
      alert("Error deleting bill. Please try again.");
    }
  };

  const handleTogglePaid = async (bill) => {
    try {
      // Set loading state for this specific button
      setLoadingStates((prev) => ({ ...prev, [`toggle_${bill.id}`]: true }));

      // If bill is already marked as paid, mark it as unpaid
      if (bill.isPaid) {
        await updateRecurringBill(bill.id, {
          isPaid: false,
          lastPaid: null,
        });
      } else {
        // Mark the bill as paid with current date
        await updateRecurringBill(bill.id, {
          isPaid: true,
          lastPaid: new Date().toISOString().split("T")[0],
        });
      }

      // Refresh the list of bills
      await refreshRecurringBills();

      // Clear loading state
      setLoadingStates((prev) => ({ ...prev, [`toggle_${bill.id}`]: false }));
    } catch (error) {
      console.error("Error updating recurring bill payment status:", error);
      // Clear loading state even if there's an error
      setLoadingStates((prev) => ({ ...prev, [`toggle_${bill.id}`]: false }));
      alert("Error updating payment status. Please try again.");
    }
  };

  const handleCreateReminder = async (bill) => {
    try {
      // Set loading state for this specific button
      setLoadingStates((prev) => ({ ...prev, [`reminder_${bill.id}`]: true }));

      // Create reminder from bill data
      const reminderData = {
        title: `Payment due: ${bill.title}`,
        description: `Your payment of ${formatCurrency(
          bill.amount
        )} is due for ${bill.title}${
          bill.provider ? ` (${bill.provider})` : ""
        }.`,
        dueDate: bill.dueDate,
      };

      // Add reminder to Firebase
      await addReminder(reminderData);

      // Refresh reminders list
      await refreshReminders();

      // Clear loading state
      setLoadingStates((prev) => ({ ...prev, [`reminder_${bill.id}`]: false }));

      // Show success message
      alert("Reminder created successfully!");
    } catch (error) {
      console.error("Error creating reminder:", error);
      // Clear loading state even if there's an error
      setLoadingStates((prev) => ({ ...prev, [`reminder_${bill.id}`]: false }));
      alert(`Error creating reminder: ${error.message}`);
    }
  };

  // Format the date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Get the status of the bill
  const getBillStatus = (bill) => {
    if (bill.isPaid) return "paid";
    if (bill.trialEndDate) return "trial";
    return "due";
  };

  // Determine if a bill is in trial period
  const isInTrialPeriod = (bill) => {
    return bill.trialEndDate ? true : false;
  };

  // Check if we have any bills
  const noBills = !recurringBills || recurringBills.length === 0;

  return (
    <div className="recurring-bills-glass-card">
      <div className="recurring-bills-header">
        <h2 className="recurring-bills-title">Upcoming Recurring Bills</h2>
        <p className="recurring-bills-desc">
          Keep track of your regular payments
        </p>
      </div>

      {noBills ? (
        <div className="no-bills">
          No recurring bills found. Add some to get started!
        </div>
      ) : (
        <div className="recurring-bills-list">
          {recurringBills.map((bill) => (
            <div className="recurring-bill-card" key={bill.id}>
              <div className="rb-header-row">
                <div className="rb-header-left">
                  <FaSync className="rb-icon" />
                  <span className="rb-title">{bill.title}</span>
                  {isInTrialPeriod(bill) && (
                    <span className="rb-badge trial">Trial</span>
                  )}
                  {bill.isPaid && <span className="rb-badge paid">Paid</span>}
                </div>
                <div className="rb-actions-top">
                  <button
                    className={`rb-action-btn small ${
                      bill.isPaid ? "unpay" : "unpay pay"
                    }`}
                    onClick={() => handleTogglePaid(bill)}
                    disabled={loadingStates[`toggle_${bill.id}`]}
                  >
                    {loadingStates[`toggle_${bill.id}`] ? (
                      <FaSpinner className="spinner" />
                    ) : bill.isPaid ? (
                      "Mark Unpaid"
                    ) : (
                      "Mark Paid"
                    )}
                  </button>
                  <button
                    className="rb-action-btn small reminder"
                    onClick={() => handleCreateReminder(bill)}
                    disabled={
                      loadingStates[`reminder_${bill.id}`] ||
                      !bill.dueDate ||
                      bill.isPaid
                    }
                    title={
                      !bill.dueDate
                        ? "Bill needs due date to create reminder"
                        : bill.isPaid
                        ? "Bill already paid"
                        : "Create reminder for this bill"
                    }
                  >
                    {loadingStates[`reminder_${bill.id}`] ? (
                      <FaSpinner className="spinner" />
                    ) : (
                      <>
                        <FaBell /> <span className="remind-text">Remind</span>
                      </>
                    )}
                  </button>
                  <button
                    className="rb-action-btn small delete"
                    onClick={() => handleDelete(bill.id)}
                    disabled={loadingStates[`delete_${bill.id}`]}
                  >
                    {loadingStates[`delete_${bill.id}`] ? (
                      <FaSpinner className="spinner" />
                    ) : (
                      <>
                        <FaTrash /> Delete
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="rb-content-row">
                <div className="rb-details-grid">
                  <div className="rb-details-item">
                    <span className="rb-details-label">Category:</span>
                    <span className="rb-detail-value">
                      {bill.category || "General"}
                    </span>
                  </div>
                  <div className="rb-details-item">
                    <span className="rb-details-label">Frequency:</span>
                    <span className="rb-detail-value">
                      {bill.frequency
                        ? bill.frequency.charAt(0).toUpperCase() +
                          bill.frequency.slice(1)
                        : "Monthly"}
                    </span>
                  </div>
                  <div className="rb-details-item">
                    <span className="rb-details-label">Provider:</span>
                    <span className="rb-detail-value">
                      {bill.provider || "N/A"}
                    </span>
                  </div>
                  <div className="rb-details-item">
                    <span className="rb-details-label">Amount:</span>
                    <span className={`rb-amount ${getBillStatus(bill)}`}>
                      {formatCurrency(bill.amount)}
                    </span>
                  </div>
                </div>
                <div className="rb-date-container">
                  <div className="rb-date-label">
                    {isInTrialPeriod(bill) ? "Trial End:" : "Due Date:"}
                  </div>
                  <div
                    className={`rb-date-value ${
                      isInTrialPeriod(bill) ? "trial-ended" : "next-due"
                    }`}
                  >
                    {formatDate(
                      isInTrialPeriod(bill) ? bill.trialEndDate : bill.dueDate
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecurringBillsCard;
