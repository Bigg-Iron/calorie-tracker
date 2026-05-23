import React from 'react';

const formatNumber = (value) => {
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 1 });
};

export default function SummaryCard({ visibleItems }) {
  const totals = visibleItems.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fats += item.fats;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return (
    <section className="summary-grid">
      <article className="card summary-card">
        <h3>Daily totals</h3>
        <div className="summary-value">
          <span>Calories</span>
          <strong>{formatNumber(totals.calories)}</strong>
        </div>
        <div className="summary-value">
          <span>Protein</span>
          <strong>{formatNumber(totals.protein)} g</strong>
        </div>
        <div className="summary-value">
          <span>Carbs</span>
          <strong>{formatNumber(totals.carbs)} g</strong>
        </div>
        <div className="summary-value">
          <span>Fats</span>
          <strong>{formatNumber(totals.fats)} g</strong>
        </div>
      </article>

      <article className="card summary-card highlight-card">
        <h3>Today's meals</h3>
        <p className="summary-text">
          Log your meals and review nutrition subtotals by meal category. Use the date filters above to recall previous log files.
        </p>
      </article>
    </section>
  );
}
