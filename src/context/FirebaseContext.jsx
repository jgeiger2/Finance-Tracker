import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, onAuthStateChange } from "../firebase/authService";
import { getTransactions } from "../firebase/transactionService";
import { getRecurringBills } from "../firebase/recurringBillService";
import {
  getReminders,
  getUpcomingReminders,
} from "../firebase/reminderService";

// Create context
const FirebaseContext = createContext();

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [recurringBills, setRecurringBills] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [upcomingReminders, setUpcomingReminders] = useState([]);
  const [filterType, setFilterType] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Function to refresh transactions
  const refreshTransactions = async (specificFilterType = null) => {
    if (!currentUser) return;

    try {
      // Use specific filter type if provided, otherwise use the state
      const filterToUse =
        specificFilterType !== undefined ? specificFilterType : filterType;
      console.log(
        `Refreshing transactions with filter: ${filterToUse || "All"}`
      );

      const transactionsData = await getTransactions(filterToUse);
      console.log(`Retrieved ${transactionsData.length} transactions`);

      setTransactions(transactionsData);
      return transactionsData;
    } catch (error) {
      console.error("Error refreshing transactions:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack,
      });
    }
  };

  // Custom function to set filter type and refresh immediately
  const setFilterAndRefresh = async (newFilterType) => {
    setFilterType(newFilterType);
    return await refreshTransactions(newFilterType);
  };

  // Function to refresh recurring bills
  const refreshRecurringBills = async () => {
    if (!currentUser) return;

    try {
      const billsData = await getRecurringBills();
      setRecurringBills(billsData);
    } catch (error) {
      console.error("Error refreshing recurring bills:", error);
    }
  };

  // Function to refresh reminders
  const refreshReminders = async () => {
    if (!currentUser) return;

    try {
      const remindersData = await getReminders();
      setReminders(remindersData);

      // Also refresh upcoming reminders
      const upcoming = await getUpcomingReminders(7); // Get reminders for next 7 days
      setUpcomingReminders(upcoming);
    } catch (error) {
      console.error("Error refreshing reminders:", error);
    }
  };

  // Fetch transactions when user changes or filter changes
  useEffect(() => {
    console.log(`Filter changed in context to: ${filterType || "All"}`);
    refreshTransactions();
  }, [currentUser, filterType]);

  // Fetch recurring bills when user changes
  useEffect(() => {
    refreshRecurringBills();
  }, [currentUser]);

  // Fetch reminders when user changes
  useEffect(() => {
    refreshReminders();
  }, [currentUser]);

  // Calculate summary data
  const calculateSummary = () => {
    if (!transactions.length) return { income: 0, expenses: 0 };

    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.income += parseFloat(transaction.amount);
        } else {
          acc.expenses += parseFloat(transaction.amount);
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );
  };

  const summary = calculateSummary();

  // Context value
  const value = {
    currentUser,
    loading,
    transactions,
    recurringBills,
    reminders,
    upcomingReminders,
    summary,
    filterType,
    setFilterType,
    setFilterAndRefresh,
    refreshTransactions,
    refreshRecurringBills,
    refreshReminders,
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
};
