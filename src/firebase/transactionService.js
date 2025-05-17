import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "./config";
import { getAuth } from "firebase/auth";

const transactionsCollection = collection(db, "transactions");

// Add a new transaction
export const addTransaction = async (transaction) => {
  try {
    // Get current user
    const auth = getAuth();
    const user = auth.currentUser;

    console.log("Adding transaction with user:", user ? user.uid : "No user");

    if (!user) {
      throw new Error("You must be logged in to add a transaction");
    }

    // Log before adding
    console.log("Preparing transaction for Firebase:", {
      ...transaction,
      userId: user.uid,
      date: new Date(transaction.date),
    });

    const docRef = await addDoc(transactionsCollection, {
      ...transaction,
      userId: user.uid, // Add user ID to transaction
      date: transaction.date
        ? Timestamp.fromDate(new Date(transaction.date))
        : Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    console.log("Transaction added with ID:", docRef.id);

    return { id: docRef.id, ...transaction };
  } catch (error) {
    console.error("Error adding transaction: ", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Get all transactions
export const getTransactions = async (filterType = null) => {
  try {
    // Get current user
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      return []; // Return empty array if no user is logged in
    }

    // Use a simpler query without complex indexes
    const q = query(transactionsCollection, where("userId", "==", user.uid));

    const querySnapshot = await getDocs(q);

    // Get all user transactions
    const allTransactions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate().toISOString().split("T")[0], // Convert Timestamp to YYYY-MM-DD
    }));

    // Sort by date descending (most recent first)
    allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply type filter on client side if needed
    if (filterType === "income") {
      return allTransactions.filter(
        (transaction) => transaction.type === "income"
      );
    } else if (filterType === "expense") {
      return allTransactions.filter(
        (transaction) => transaction.type === "expense"
      );
    }

    // Return all transactions if no filter
    return allTransactions;
  } catch (error) {
    console.error("Error getting transactions: ", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Delete a transaction
export const deleteTransaction = async (id) => {
  try {
    // Get current user
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("You must be logged in to delete a transaction");
    }

    // Get transaction reference
    const transactionRef = doc(db, "transactions", id);

    // Verify that this transaction belongs to the current user before deleting
    const docSnapshot = await getDoc(transactionRef);

    if (!docSnapshot.exists()) {
      throw new Error("Transaction not found");
    }

    const transactionData = docSnapshot.data();

    // Check if current user owns this transaction
    if (transactionData.userId !== user.uid) {
      throw new Error("You don't have permission to delete this transaction");
    }

    // Delete the transaction
    await deleteDoc(transactionRef);
    console.log(`Successfully deleted transaction: ${id}`);
    return id;
  } catch (error) {
    console.error("Error deleting transaction: ", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Update a transaction
export const updateTransaction = async (id, updatedData) => {
  try {
    const docRef = doc(db, "transactions", id);

    // If date is included, convert it to Timestamp
    if (updatedData.date) {
      updatedData.date = Timestamp.fromDate(new Date(updatedData.date));
    }

    await updateDoc(docRef, updatedData);
    return { id, ...updatedData };
  } catch (error) {
    console.error("Error updating transaction: ", error);
    throw error;
  }
};
