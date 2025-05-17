import React, { useState } from "react";
import { addRecurringBill } from "../firebase/recurringBillService";
import "../App.css";

const AddRecurringBillModal = ({ onClose, onBillAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    dueDate: "",
    frequency: "monthly",
    category: "",
    provider: "",
    autoPayEnabled: false,
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
    if (!formData.dueDate) return "Due date is required";
    if (!formData.category) return "Category is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Add the recurring bill to the database
      await addRecurringBill({
        ...formData,
        amount: Number(formData.amount).toFixed(2),
      });

      // Notify parent and close modal
      onBillAdded();
      onClose();
    } catch (err) {
      console.error("Error adding recurring bill:", err);
      setError("Failed to add recurring bill. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Category options
  const categoryOptions = [
    "Housing",
    "Utilities",
    "Transportation",
    "Insurance",
    "Subscriptions",
    "Entertainment",
    "Phone/Internet",
    "Healthcare",
    "Education",
    "Fitness",
    "Other",
  ];

  // Frequency options
  const frequencyOptions = [
    "daily",
    "weekly",
    "bi-weekly",
    "monthly",
    "quarterly",
    "semi-annually",
    "annually",
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2>Add Recurring Bill</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Bill Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Netflix Subscription"
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
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="provider">Provider/Company (Optional)</label>
              <input
                type="text"
                id="provider"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                placeholder="e.g., Netflix"
              />
            </div>

            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="autoPayEnabled"
                name="autoPayEnabled"
                checked={formData.autoPayEnabled}
                onChange={handleChange}
              />
              <label htmlFor="autoPayEnabled">Auto-pay Enabled</label>
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
              {loading ? "Adding..." : "Add Recurring Bill"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecurringBillModal;
