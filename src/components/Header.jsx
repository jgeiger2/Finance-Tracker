import React, { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaBell, FaPlus } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs";
import "../styles/Header.css";
import { useFirebase } from "../context/FirebaseContext";
import {
  markReminderAsDismissed,
  deleteReminder,
  addReminder,
} from "../firebase/reminderService";

const Header = ({ onLogout }) => {
  const [isLightMode, setIsLightMode] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const { upcomingReminders, refreshReminders } = useFirebase();
  const reminderDropdownRef = useRef(null);

  const toggleTheme = () => {
    document.body.classList.toggle("light");
    setIsLightMode(!isLightMode);
  };

  const toggleReminders = () => {
    setShowReminders(!showReminders);
    setShowAddForm(false);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      setLoadingStates((prev) => ({ ...prev, [`delete_${id}`]: true }));
      await deleteReminder(id);
      await refreshReminders();
      setLoadingStates((prev) => ({ ...prev, [`delete_${id}`]: false }));
    } catch (error) {
      console.error("Error deleting reminder:", error);
      setLoadingStates((prev) => ({ ...prev, [`delete_${id}`]: false }));
      alert(`Error deleting reminder: ${error.message}`);
    }
  };

  const handleDismiss = async (id, e) => {
    e.stopPropagation();
    try {
      setLoadingStates((prev) => ({ ...prev, [`dismiss_${id}`]: true }));
      await markReminderAsDismissed(id);
      await refreshReminders();
      setLoadingStates((prev) => ({ ...prev, [`dismiss_${id}`]: false }));
    } catch (error) {
      console.error("Error dismissing reminder:", error);
      setLoadingStates((prev) => ({ ...prev, [`dismiss_${id}`]: false }));
      alert(`Error dismissing reminder: ${error.message}`);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    try {
      setLoadingStates((prev) => ({ ...prev, addReminder: true }));

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

  const handleClickOutside = (event) => {
    if (
      reminderDropdownRef.current &&
      !reminderDropdownRef.current.contains(event.target)
    ) {
      setShowReminders(false);
      setShowAddForm(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format date for reminders
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  // Determine if date is today or tomorrow
  const getDateStatus = (dateString) => {
    if (!dateString) return "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate.getTime() === today.getTime()) return "Today";
    if (dueDate.getTime() === tomorrow.getTime()) return "Tomorrow";
    return formatDate(dateString);
  };

  const todayRemindersCount = upcomingReminders
    ? upcomingReminders.filter((r) => {
        if (!r.dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(r.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      }).length
    : 0;

  return (
    <header className="header">
      <div className="header-left">
        <FaUserCircle className="user-icon" />
      </div>
      <div className="header-center">
        <h1 className="app-title">Finance Tracker</h1>
      </div>
      <div className="header-right">
        <div className="notification-container" ref={reminderDropdownRef}>
          <button
            className="notification-button"
            aria-label="Notifications"
            onClick={toggleReminders}
          >
            <FaBell className="notification-icon" />
            {upcomingReminders && upcomingReminders.length > 0 && (
              <span className="notification-badge">
                {upcomingReminders.length}
              </span>
            )}
          </button>

          {showReminders && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Reminders</h3>
                <div className="notification-actions-top">
                  <button
                    className="add-notification-btn"
                    onClick={() => setShowAddForm(!showAddForm)}
                    aria-label="Add new reminder"
                  >
                    <FaPlus />
                  </button>
                  {upcomingReminders && upcomingReminders.length > 0 ? (
                    <span className="reminder-count">
                      {todayRemindersCount > 0
                        ? `${todayRemindersCount} today`
                        : "None today"}
                    </span>
                  ) : null}
                </div>
              </div>

              {showAddForm ? (
                <div className="add-notification-form-container">
                  <form
                    className="add-notification-form"
                    onSubmit={handleAddReminder}
                  >
                    <div className="notification-form-row">
                      <label htmlFor="title">Title</label>
                      <input
                        type="text"
                        id="title"
                        value={newReminder.title}
                        onChange={(e) =>
                          setNewReminder((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="notification-form-row">
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
                    <div className="notification-form-row">
                      <label htmlFor="dueDate">Due Date</label>
                      <input
                        type="date"
                        id="dueDate"
                        value={newReminder.dueDate}
                        onChange={(e) =>
                          setNewReminder((prev) => ({
                            ...prev,
                            dueDate: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="notification-form-actions">
                      <button
                        type="button"
                        className="cancel-notification-btn"
                        onClick={() => setShowAddForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="submit-notification-btn"
                        disabled={loadingStates.addReminder}
                      >
                        {loadingStates.addReminder
                          ? "Adding..."
                          : "Add Reminder"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="notification-content">
                  {!upcomingReminders || upcomingReminders.length === 0 ? (
                    <div className="no-notifications">No reminders</div>
                  ) : (
                    <ul className="notification-list">
                      {upcomingReminders.map((reminder) => (
                        <li key={reminder.id} className="notification-item">
                          <div className="notification-info">
                            <div className="notification-title">
                              {reminder.title}
                            </div>
                            {reminder.description && (
                              <div className="notification-description">
                                {reminder.description}
                              </div>
                            )}
                            <div className="notification-date">
                              <span
                                className={`date-badge ${getDateStatus(
                                  reminder.dueDate
                                ).toLowerCase()}`}
                              >
                                {getDateStatus(reminder.dueDate)}
                              </span>
                            </div>
                          </div>
                          <div className="notification-actions">
                            <button
                              className="notification-action dismiss"
                              onClick={(e) => handleDismiss(reminder.id, e)}
                              disabled={loadingStates[`dismiss_${reminder.id}`]}
                            >
                              Dismiss
                            </button>
                            <button
                              className="notification-action delete"
                              onClick={(e) => handleDelete(reminder.id, e)}
                              disabled={loadingStates[`delete_${reminder.id}`]}
                            >
                              Delete
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {!showAddForm && (
                <div className="notification-footer">
                  <a
                    href="#add-reminder"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAddForm(true);
                    }}
                  >
                    Add a new reminder
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          className="toggle-theme-button"
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          {isLightMode ? (
            <BsMoonStarsFill className="theme-icon" />
          ) : (
            <BsSunFill className="theme-icon" />
          )}
        </button>

        {onLogout && (
          <button
            className="logout-button"
            aria-label="Log out"
            onClick={onLogout}
          >
            <FiLogOut className="logout-icon" />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
