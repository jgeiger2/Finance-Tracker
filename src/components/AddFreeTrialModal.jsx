import React, { useState, useEffect } from "react";
import { addRecurringBill } from "../firebase/recurringBillService";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../App.css";

const AddFreeTrialModal = ({ onClose, onTrialAdded }) => {
  const [formData, setFormData] = useState({
    service: "",
    trialLength: "",
    trialUnit: "days",
    endDate: "",
    price: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Calculate end date based on trial length
  useEffect(() => {
    if (formData.trialLength && formData.trialUnit) {
      const today = new Date();
      let endDate = new Date(today);
      
      if (formData.trialUnit === "days") {
        endDate.setDate(today.getDate() + parseInt(formData.trialLength));
      } else if (formData.trialUnit === "weeks") {
        endDate.setDate(today.getDate() + (parseInt(formData.trialLength) * 7));
      } else if (formData.trialUnit === "months") {
        endDate.setMonth(today.getMonth() + parseInt(formData.trialLength));
      }
      
      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split("T")[0]
      }));
    }
  }, [formData.trialLength, formData.trialUnit]);

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

  // Trial unit options
  const trialUnitOptions = ["days", "weeks", "months"];

  return (
    <div className="modal-backdrop">
      <div className="modal-content glass-card">
        <div className="modal-header">
          <h2>Add Free Trial</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="service">Service Name</label>
            <input
              type="text"
              id="service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              placeholder="e.g., Netflix, Spotify"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="trialLength">Length of Trial</label>
              <div className="form-row">
                <input
                  type="number"
                  id="trialLength"
                  name="trialLength"
                  min="1"
                  value={formData.trialLength}
                  onChange={handleChange}
                  placeholder="14"
                  required
                  style={{ flexGrow: 1 }}
                />
                <select
                  id="trialUnit"
                  name="trialUnit"
                  value={formData.trialUnit}
                  onChange={handleChange}
                  style={{ width: "40%" }}
                >
                  {trialUnitOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="price">Price After Trial ($)</label>
            <input
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
              {loading ? "Adding..." : "Add Free Trial"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFreeTrialModal; 