import React, { useState, useEffect } from "react";
import "./App.css";
import Header from "./components/Header";
import SummaryCard from "./components/SummaryCard";
import RecurringBillsCard from "./components/RecurringBillsCard";
import TransactionsCard from "./components/TransactionsCard";
import Footer from "./components/Footer";
import LoginForm from "./components/LoginForm";
import { useFirebase } from "./context/FirebaseContext";
import { signOutUser } from "./firebase/authService";

function App() {
  const { currentUser, loading } = useFirebase();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // For testing without auth, comment this out:
  // return (
  //   <div className="app-container">
  //     <Header />
  //     <SummaryCard />
  //     <main className="main-content">
  //       {/* Rest of your app */}
  //       ...
  //     </main>
  //     <Footer />
  //   </div>
  // );

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isLoggedIn) {
    return <LoginForm onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app-container">
      <Header onLogout={handleLogout} />
      <div className="user-welcome">
        Welcome, {currentUser?.displayName || "User"}!
      </div>
      <SummaryCard />
      <main className="main-content">
        <div className="dashboard-container">
          {/* Summary cards will go here */}
          <div className="summary-cards">
            {/* Placeholder for summary cards */}
          </div>

          {/* Dashboard Layout Grid */}
          <div className="dashboard-layout">
            <RecurringBillsCard />
            <TransactionsCard />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
