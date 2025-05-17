import React, { useState, useEffect } from "react";
import { addRecurringBill } from "../firebase/recurringBillService";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../App.css";

const AddFreeTrialModal = ({ onClose, onTrialAdded }) => {
  const [formData, setFormData] = useState({
    service: "",
    endDate: "",
    price: "",
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
    if (!formData.service.trim()) return "Service name is required";
    if (!formData.endDate) return "End date is required";
    if (!formData.price || isNaN(formData.price) || Number(formData.price) < 0)
      return "Please enter a valid price";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check for user
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setError("You must be logged in to add a free trial");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare bill data
      const billData = {
        title: formData.service,
        type: "subscription",
        amount: Number(formData.price).toFixed(2),
        frequency: "monthly", // Default to monthly after trial
        isTrial: true,
        trialEndDate: formData.endDate,
        company: formData.service,
        category: "Subscription",
        notes: formData.notes,
      };

      // Add to Firebase
      const result = await addRecurringBill(billData);

      // Notify parent and close modal
      if (typeof onTrialAdded === "function") {
        onTrialAdded();
      }
      onClose();
    } catch (err) {
      console.error("Error adding free trial:", err);
      setError(`Failed to add free trial: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

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
          <h2 style={modalStyles.header}>Add Trial</h2>
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
            <label htmlFor="service" style={modalStyles.label}>
              Service Name
            </label>
            <input
              style={modalStyles.input}
              type="text"
              id="service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              placeholder="e.g., Netflix, Spotify"
              required
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label htmlFor="endDate" style={modalStyles.label}>
              End Date
            </label>
            <input
              style={modalStyles.input}
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label htmlFor="price" style={modalStyles.label}>
              Price After Trial ($)
            </label>
            <input
              style={modalStyles.input}
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>

          <div style={modalStyles.formGroup}>
            <label htmlFor="notes" style={modalStyles.label}>
              Notes (Optional)
            </label>
            <textarea
              style={modalStyles.textarea}
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional details..."
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
              {loading ? "Adding..." : "Add Trial"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFreeTrialModal;
