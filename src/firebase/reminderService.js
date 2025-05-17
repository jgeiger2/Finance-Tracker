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

const remindersCollection = collection(db, "reminders");

// Add a new reminder
export const addReminder = async (reminder) => {
  try {
    // Get current user
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("You must be logged in to add a reminder");
    }

    // Prepare the reminder object
    const reminderData = {
      ...reminder,
      userId: user.uid,
      dueDate: reminder.dueDate
        ? Timestamp.fromDate(new Date(reminder.dueDate))
        : null,
      createdAt: Timestamp.now(),
      isRead: false,
      status: "pending", // pending, triggered, dismissed
    };

    const docRef = await addDoc(remindersCollection, reminderData);

    return {
      id: docRef.id,
      ...reminder,
      dueDate: reminder.dueDate,
    };
  } catch (error) {
    console.error("Error adding reminder: ", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Get all reminders
export const getReminders = async () => {
  try {
    // Get current user
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      return []; // Return empty array if no user is logged in
    }

    // Get all user reminders
    const q = query(remindersCollection, where("userId", "==", user.uid));

    const querySnapshot = await getDocs(q);

    // Get all user reminders
    const allReminders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate
        ? doc.data().dueDate.toDate().toISOString().split("T")[0]
        : null,
    }));

    // Sort by due date ascending (closest due date first)
    allReminders.sort((a, b) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return allReminders;
  } catch (error) {
    console.error("Error getting reminders: ", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Delete a reminder
export const deleteReminder = async (id) => {
  try {
    // Get current user
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("You must be logged in to delete a reminder");
    }

    // Get reminder reference
    const reminderRef = doc(db, "reminders", id);

    // Verify that this reminder belongs to the current user before deleting
    const docSnapshot = await getDoc(reminderRef);

    if (!docSnapshot.exists()) {
      throw new Error("Reminder not found");
    }

    const reminderData = docSnapshot.data();

    // Check if current user owns this reminder
    if (reminderData.userId !== user.uid) {
      throw new Error("You don't have permission to delete this reminder");
    }

    // Delete the reminder
    await deleteDoc(reminderRef);
    return id;
  } catch (error) {
    console.error("Error deleting reminder: ", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Update a reminder
export const updateReminder = async (id, updatedData) => {
  try {
    // Get current user
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("You must be logged in to update a reminder");
    }

    const reminderRef = doc(db, "reminders", id);

    // Verify that this reminder belongs to the current user
    const docSnapshot = await getDoc(reminderRef);

    if (!docSnapshot.exists()) {
      throw new Error("Reminder not found");
    }

    const reminderData = docSnapshot.data();

    // Check if current user owns this reminder
    if (reminderData.userId !== user.uid) {
      throw new Error("You don't have permission to update this reminder");
    }

    // If dueDate is included, convert it to Timestamp
    if (updatedData.dueDate) {
      updatedData.dueDate = Timestamp.fromDate(new Date(updatedData.dueDate));
    }

    await updateDoc(reminderRef, updatedData);
    return { id, ...updatedData };
  } catch (error) {
    console.error("Error updating reminder: ", error);
    throw error;
  }
};

// Get upcoming reminders
export const getUpcomingReminders = async (daysAhead = 7) => {
  try {
    // Get all reminders
    const allReminders = await getReminders();

    // Calculate the date range
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + daysAhead);

    // Filter reminders within the date range and status is pending
    return allReminders.filter((reminder) => {
      if (!reminder.dueDate || reminder.status !== "pending") return false;

      const dueDate = new Date(reminder.dueDate);
      return dueDate >= today && dueDate <= endDate;
    });
  } catch (error) {
    console.error("Error getting upcoming reminders:", error);
    throw error;
  }
};

// Mark a reminder as read
export const markReminderAsRead = async (id) => {
  return updateReminder(id, { isRead: true });
};

// Mark a reminder as triggered
export const markReminderAsTriggered = async (id) => {
  return updateReminder(id, { status: "triggered" });
};

// Mark a reminder as dismissed
export const markReminderAsDismissed = async (id) => {
  return updateReminder(id, { status: "dismissed" });
};
