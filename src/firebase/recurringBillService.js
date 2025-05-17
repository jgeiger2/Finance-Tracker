import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./config";
import { getAuth } from "firebase/auth";

const recurringBillsCollection = collection(db, "recurringBills");

// Add a new recurring bill
export const addRecurringBill = async (bill) => {
  try {
    // Get current user
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("You must be logged in to add a recurring bill");
    }

    const docRef = await addDoc(recurringBillsCollection, {
      ...bill,
      userId: user.uid, // Add user ID to recurring bill
      dueDate: bill.dueDate ? Timestamp.fromDate(new Date(bill.dueDate)) : null,
      trialEndDate: bill.trialEndDate
        ? Timestamp.fromDate(new Date(bill.trialEndDate))
        : null,
      lastPaid: bill.lastPaid
        ? Timestamp.fromDate(new Date(bill.lastPaid))
        : null,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...bill };
  } catch (error) {
    console.error("Error adding recurring bill: ", error);
    throw error;
  }
};

// Get all recurring bills
export const getRecurringBills = async () => {
  try {
    // Get current user
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      return []; // Return empty array if no user is logged in
    }

    const q = query(
      recurringBillsCollection,
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();

      // Convert all Timestamp fields to date strings
      return {
        id: doc.id,
        ...data,
        dueDate: data.dueDate
          ? data.dueDate.toDate().toISOString().split("T")[0]
          : null,
        trialEndDate: data.trialEndDate
          ? data.trialEndDate.toDate().toISOString().split("T")[0]
          : null,
        lastPaid: data.lastPaid
          ? data.lastPaid.toDate().toISOString().split("T")[0]
          : null,
      };
    });
  } catch (error) {
    console.error("Error getting recurring bills: ", error);
    throw error;
  }
};

// Delete a recurring bill
export const deleteRecurringBill = async (id) => {
  try {
    await deleteDoc(doc(db, "recurringBills", id));
    return id;
  } catch (error) {
    console.error("Error deleting recurring bill: ", error);
    throw error;
  }
};

// Update a recurring bill
export const updateRecurringBill = async (id, updatedData) => {
  try {
    const docRef = doc(db, "recurringBills", id);

    // Convert date fields to Timestamp if they exist in the updated data
    if (updatedData.dueDate) {
      updatedData.dueDate = Timestamp.fromDate(new Date(updatedData.dueDate));
    }

    if (updatedData.trialEndDate) {
      updatedData.trialEndDate = Timestamp.fromDate(
        new Date(updatedData.trialEndDate)
      );
    }

    if (updatedData.lastPaid) {
      updatedData.lastPaid = Timestamp.fromDate(new Date(updatedData.lastPaid));
    }

    await updateDoc(docRef, updatedData);
    return { id, ...updatedData };
  } catch (error) {
    console.error("Error updating recurring bill: ", error);
    throw error;
  }
};
