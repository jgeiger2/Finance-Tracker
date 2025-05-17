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
        provider: formData.title, // Set provider to match title for backward compatibility
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

  const modalStyles = {
    formGroup: {
      marginBottom: "1rem",
    },
    label: {
      marginBottom: "0.4rem",
      fontWeight: "600",
      display: "block",
      color: "#d4d7e6",
      fontSize: "0.9rem",
    },
    input: {
      width: "100%",
      padding: "0.6rem",
      borderRadius: "0.6rem",
      background: "rgba(255, 255, 255, 0.06)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      color: "#fff",
      fontSize: "0.9rem",
    },
    textarea: {
      width: "100%",
      padding: "0.6rem",
      borderRadius: "0.6rem",
      background: "rgba(255, 255, 255, 0.06)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      color: "#fff",
      fontSize: "0.9rem",
      resize: "vertical",
      minHeight: "70px",
    },
    formActions: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "1.2rem",
      gap: "1rem",
    },
    cancelButton: {
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      background: "rgba(255, 255, 255, 0.1)",
      color: "#fff",
      fontWeight: "600",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      cursor: "pointer",
      flex: "1",
      fontSize: "0.9rem",
      transition: "background 0.2s",
      maxWidth: "120px",
      height: "36px",
    },
    submitButton: {
      padding: "0.5rem 1rem",
      borderRadius: "0.5rem",
      background: "linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)",
      color: "#181924",
      fontWeight: "700",
      border: "none",
      cursor: "pointer",
      flex: "1",
      fontSize: "0.9rem",
      transition: "transform 0.2s ease",
      boxShadow: "0 2px 5px rgba(0, 242, 254, 0.3)",
      maxWidth: "120px",
      height: "36px",
    },
    header: {
      fontSize: "1.4rem",
      textAlign: "center",
      background: "linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      fontWeight: "700",
      margin: 0,
      padding: 0,
    },
    checkbox: {
      marginRight: "8px",
    },
    checkboxLabel: {
      fontWeight: "600",
      color: "#d4d7e6",
      fontSize: "0.9rem",
      display: "flex",
      alignItems: "center",
    },
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content glass-card"
        style={{
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="modal-header">
          <h2 style={modalStyles.header}>Add Recurring Bill</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form
          onSubmit={handleSubmit}
          style={{ overflowY: "auto", padding: "0 15px" }}
        >
          <div style={{ ...modalStyles.formGroup, marginTop: "10px" }}>
            <label htmlFor="title" style={modalStyles.label}>
              Company
            </label>
            <input
              style={modalStyles.input}
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Netflix"
              required
            />
          </div>

          <div className="form-row">
            <div style={modalStyles.formGroup}>
              <label htmlFor="amount" style={modalStyles.label}>
                Amount ($)
              </label>
              <input
                style={modalStyles.input}
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

            <div style={modalStyles.formGroup}>
              <label htmlFor="dueDate" style={modalStyles.label}>
                Due Date
              </label>
              <input
                style={modalStyles.input}
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
            <div style={modalStyles.formGroup}>
              <label htmlFor="category" style={modalStyles.label}>
                Category
              </label>
              <select
                style={modalStyles.input}
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

            <div style={modalStyles.formGroup}>
              <label htmlFor="frequency" style={modalStyles.label}>
                Frequency
              </label>
              <select
                style={modalStyles.input}
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

          <div style={modalStyles.formGroup}>
            <label htmlFor="notes" style={modalStyles.label}>
              Description / Notes
            </label>
            <textarea
              style={modalStyles.textarea}
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g., Premium Plan, account details, etc."
              rows="3"
            ></textarea>
          </div>

          <div
            style={{
              ...modalStyles.formActions,
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <button
              type="button"
              style={modalStyles.cancelButton}
              onClick={onClose}
              onMouseOver={(e) =>
                (e.target.style.background = "rgba(255, 255, 255, 0.15)")
              }
              onMouseOut={(e) =>
                (e.target.style.background = "rgba(255, 255, 255, 0.1)")
              }
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...modalStyles.submitButton,
                opacity: loading ? "0.7" : "1",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
              onMouseOver={(e) =>
                !loading && (e.target.style.transform = "translateY(-2px)")
              }
              onMouseOut={(e) =>
                !loading && (e.target.style.transform = "translateY(0px)")
              }
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecurringBillModal;
