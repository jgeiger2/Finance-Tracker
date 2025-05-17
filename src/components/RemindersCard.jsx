import React, { useState } from "react";
import {
  FaBell,
  FaTrash,
  FaSpinner,
  FaCheck,
  FaRegClock,
} from "react-icons/fa";
import "../App.css";
import { useFirebase } from "../context/FirebaseContext";
import {
  deleteReminder,
  markReminderAsDismissed,
  markReminderAsTriggered,
  addReminder,
} from "../firebase/reminderService";

const RemindersCard = () => {
  const { reminders, upcomingReminders, refreshReminders } = useFirebase();
  const [loadingStates, setLoadingStates] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const handleDelete = async (id) => {
    try {
      // Set loading state for this specific button
      setLoadingStates((prev) => ({ ...prev, [`delete_${id}`]: true }));

      // Call Firebase delete function
      await deleteReminder(id);

      // Refresh the list of reminders
      await refreshReminders();

      // Clear loading state
      setLoadingStates((prev) => ({ ...prev, [`delete_${id}`]: false }));
    } catch (error) {
      console.error("Error deleting reminder:", error);
      // Clear loading state even if there's an error
      setLoadingStates((prev) => ({ ...prev, [`delete_${id}`]: false }));
      alert(`Error deleting reminder: ${error.message}`);
    }
  };

  const handleMarkDismissed = async (id) => {
    try {
      // Set loading state for this specific button
      setLoadingStates((prev) => ({ ...prev, [`dismiss_${id}`]: true }));

      // Mark reminder as dismissed
      await markReminderAsDismissed(id);

      // Refresh the list of reminders
      await refreshReminders();

      // Clear loading state
      setLoadingStates((prev) => ({ ...prev, [`dismiss_${id}`]: false }));
    } catch (error) {
      console.error("Error dismissing reminder:", error);
      // Clear loading state even if there's an error
      setLoadingStates((prev) => ({ ...prev, [`dismiss_${id}`]: false }));
      alert(`Error dismissing reminder: ${error.message}`);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    try {
      setLoadingStates((prev) => ({ ...prev, addReminder: true }));

      // Add new reminder
      await addReminder(newReminder);

      // Reset form
      setNewReminder({
        title: "",
        description: "",
        dueDate: "",
      });

      // Close form
      setShowAddForm(false);

      // Refresh reminders
      await refreshReminders();

      setLoadingStates((prev) => ({ ...prev, addReminder: false }));
    } catch (error) {
      console.error("Error adding reminder:", error);
      setLoadingStates((prev) => ({ ...prev, addReminder: false }));
      alert(`Error adding reminder: ${error.message}`);
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

  // Determine if date is today, tomorrow, or in next week
  const getDateStatus = (dateString) => {
    if (!dateString) return "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate.getTime() === today.getTime()) return "today";
    if (dueDate.getTime() === tomorrow.getTime()) return "tomorrow";
    if (dueDate < nextWeek) return "upcoming";
    return "";
  };

  // Check if we have any reminders
  const noReminders = !upcomingReminders || upcomingReminders.length === 0;

  return (
    <div className="reminders-glass-card">
      <div className="reminders-header">
        <h2 className="reminders-title">Upcoming Reminders</h2>
        <p className="reminders-desc">Don't forget important dates and tasks</p>
        <button
          className="add-reminder-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Cancel" : "Add Reminder"}
        </button>
      </div>

      {showAddForm && (
        <form className="add-reminder-form" onSubmit={handleAddReminder}>
          <div className="form-row">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={newReminder.title}
              onChange={(e) =>
                setNewReminder((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={newReminder.description}
              onChange={(e) =>
                setNewReminder((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>
          <div className="form-row">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={newReminder.dueDate}
              onChange={(e) =>
                setNewReminder((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              required
            />
          </div>
          <button
            type="submit"
            className="submit-reminder-btn"
            disabled={loadingStates.addReminder}
          >
            {loadingStates.addReminder ? (
              <FaSpinner className="spinner" />
            ) : (
              "Add Reminder"
            )}
          </button>
        </form>
      )}

      {noReminders ? (
        <div className="no-reminders">
          No upcoming reminders. Add some to stay organized!
        </div>
      ) : (
        <div className="reminders-list">
          {upcomingReminders.map((reminder) => (
            <div className="reminder-card" key={reminder.id}>
              <div className="reminder-header-row">
                <div className="reminder-header-left">
                  <FaBell className="reminder-icon" />
                  <span className="reminder-title">{reminder.title}</span>
                  {getDateStatus(reminder.dueDate) === "today" && (
                    <span className="reminder-badge today">Today</span>
                  )}
                  {getDateStatus(reminder.dueDate) === "tomorrow" && (
                    <span className="reminder-badge tomorrow">Tomorrow</span>
                  )}
                </div>
                <div className="reminder-actions-top">
                  <button
                    className="reminder-action-btn small dismiss"
                    onClick={() => handleMarkDismissed(reminder.id)}
                    disabled={loadingStates[`dismiss_${reminder.id}`]}
                  >
                    {loadingStates[`dismiss_${reminder.id}`] ? (
                      <FaSpinner className="spinner" />
                    ) : (
                      <>
                        <FaCheck /> Dismiss
                      </>
                    )}
                  </button>
                  <button
                    className="reminder-action-btn small delete"
                    onClick={() => handleDelete(reminder.id)}
                    disabled={loadingStates[`delete_${reminder.id}`]}
                  >
                    {loadingStates[`delete_${reminder.id}`] ? (
                      <FaSpinner className="spinner" />
                    ) : (
                      <>
                        <FaTrash /> Delete
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="reminder-content-row">
                <div className="reminder-details">
                  {reminder.description && (
                    <div className="reminder-description">
                      {reminder.description}
                    </div>
                  )}
                </div>
                <div className="reminder-date-container">
                  <div className="reminder-date-label">
                    <FaRegClock className="date-icon" /> Due:
                  </div>
                  <div
                    className={`reminder-date-value ${getDateStatus(
                      reminder.dueDate
                    )}`}
                  >
                    {formatDate(reminder.dueDate)}
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

export default RemindersCard;
