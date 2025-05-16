import React from "react";
import RecurringBillCard from "./RecurringBillCard";
import "../App.css";

const RecurringBillsCard = () => {
  return (
    <div className="recurring-bills-glass-card">
      <div className="recurring-bills-header">
        <h2 className="recurring-bills-title">Upcoming Recurring Bills</h2>
        <p className="recurring-bills-desc">
          Keep track of your regular payments
        </p>
      </div>
      <div className="recurring-bills-list">
        <RecurringBillCard />
        <RecurringBillCard
          title="Spotify Premium"
          amount="$9.99"
          paid={false}
          dueDate="6/10/2025"
          nextDue="7/10/2025"
          status="Due soon"
          category="Music"
          frequency="Monthly"
        />
        <RecurringBillCard
          title="Notion"
          amount="$0.00"
          paid={false}
          dueDate="6/20/2025"
          nextDue="7/20/2025"
          status="Trial"
          category="Productivity"
          frequency="Monthly"
        />
      </div>
    </div>
  );
};

export default RecurringBillsCard;
