import React, { useState, useEffect } from "react";
import { addTransaction } from "../firebase/transactionService";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../App.css";

const AddIncomeModal = ({ onClose, onIncomeAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    source: "",
    frequency: "one-time",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Check auth state when component mounts
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log(
        "Current user in AddIncomeModal:",
        currentUser ? currentUser.uid : "No user"
      );
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required";
    if (
      !formData.amount ||
      isNaN(formData.amount) ||
      Number(formData.amount) <= 0
    )
      return "Please enter a valid amount";
    if (!formData.date) return "Date is required";
    if (!formData.source) return "Source is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check for user again right before submission
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.error("No user logged in at submission time");
      setError(
        "You must be logged in to add income. Please log in and try again."
      );
      return;
    }

    console.log("User authenticated:", currentUser.uid);
    setLoading(true);
    setError("");

    try {
      // Prepare transaction data
      const transactionData = {
        title: formData.title,
        type: "income",
        amount: Number(formData.amount).toFixed(2),
        date: formData.date,
        category: "Income",
        company: formData.source,
        frequency: formData.frequency,
        notes: formData.notes,
      };

      console.log("Submitting transaction data:", transactionData);

      // Add to Firebase
      const result = await addTransaction(transactionData);
      console.log("Transaction added successfully:", result);

      // Notify parent and close modal
      if (typeof onIncomeAdded === "function") {
        onIncomeAdded();
      } else {
        console.error("onIncomeAdded is not a function:", onIncomeAdded);
      }
      onClose();
    } catch (err) {
      console.error("Error adding income:", err);
      console.error("Error stack:", err.stack);
      setError(`Failed to add income: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Frequency options
  const frequencyOptions = [
    "one-time",
    "weekly",
    "bi-weekly",
    "monthly",
    "quarterly",
    "yearly",
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2>Add New Income</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Income Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Salary Payment"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount ($)</label>
              <input
                type="number"
                id="amount"
                name="amount"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="source">Source</label>
              <input
                type="text"
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                placeholder="e.g., Employer Name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="frequency">Frequency</label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                required
              >
                {frequencyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional details..."
              rows="3"
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Adding..." : "Add Income"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddIncomeModal;
