import React from "react";
import "./App.css";
import Header from "./components/Header";
import SummaryCard from "./components/SummaryCard";
import RecurringBillsCard from "./components/RecurringBillsCard";
import TransactionsCard from "./components/TransactionsCard";
import { FaPlus } from "react-icons/fa";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="app-container">
      <Header />
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
