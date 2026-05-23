import React from 'react';

const MEAL_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

const formatNumber = (value) => {
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 1 });
};

const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString('en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

export default function MealSection({ mealKey, mealItems, onRemoveItem }) {
  const subtotal = mealItems.reduce(
    (totals, item) => {
      totals.calories += item.calories;
      totals.protein += item.protein;
      totals.carbs += item.carbs;
      totals.fats += item.fats;
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  return (
    <section className="card meal-card">
      <div className="meal-header">
        <div>
          <h3 className="meal-title">{MEAL_LABELS[mealKey]}</h3>
          <p className="summary-text">
            {mealItems.length} item{mealItems.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="summary-value">
          <span>Calories</span>
          <strong>{formatNumber(subtotal.calories)}</strong>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="nutrition-table">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Qty</th>
              <th scope="col">Serving</th>
              <th scope="col">Logged</th>
              <th scope="col">Cal</th>
              <th scope="col">Protein</th>
              <th scope="col">Carbs</th>
              <th scope="col">Fats</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {mealItems.map((item) => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.quantity}</td>
                <td>{item.serving}</td>
                <td>{formatTimestamp(item.timestamp)}</td>
                <td>{formatNumber(item.calories)}</td>
                <td>{formatNumber(item.protein)}</td>
                <td>{formatNumber(item.carbs)}</td>
                <td>{formatNumber(item.fats)}</td>
                <td>
                  <button
                    type="button"
                    className="delete-button"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="subtotal-row">
              <td>Subtotal</td>
              <td></td>
              <td></td>
              <td></td>
              <td>{formatNumber(subtotal.calories)}</td>
              <td>{formatNumber(subtotal.protein)}</td>
              <td>{formatNumber(subtotal.carbs)}</td>
              <td>{formatNumber(subtotal.fats)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
