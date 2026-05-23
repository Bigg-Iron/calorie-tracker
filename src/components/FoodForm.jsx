import React, { useState, useEffect } from 'react';

export default function FoodForm({ onAddItem, items, formRef, foodNameInputRef }) {
  const [name, setName] = useState('');
  const [meal, setMeal] = useState('breakfast');
  const [quantity, setQuantity] = useState('');
  const [serving, setServing] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  // Extract unique historical names for suggestions
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!items || items.length === 0) {
      setSuggestions([]);
      return;
    }
    const unique = [...new Map(items.map((item) => [item.name.toLowerCase(), item.name])).values()];
    setSuggestions(unique.sort((a, b) => a.localeCompare(b)));
  }, [items]);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);

    // Smart autofill if we find an exact match in our history
    if (val.trim().length >= 2) {
      const match = items.find((entry) => entry.name.toLowerCase() === val.trim().toLowerCase());
      if (match) {
        setQuantity(match.quantity);
        setServing(match.serving);
        setCalories(match.calories);
        setProtein(match.protein);
        setCarbs(match.carbs);
        setFats(match.fats);
        setMeal(match.meal);

        if (typeof window.gtag !== 'undefined') {
          window.gtag('event', 'autocomplete_used', {
            event_category: 'engagement',
            event_label: match.name,
          });
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanQuantity = Number(quantity);
    const cleanCalories = Number(calories);
    const cleanProtein = Number(protein);
    const cleanCarbs = Number(carbs);
    const cleanFats = Number(fats);

    if (
      !name.trim() ||
      !serving.trim() ||
      isNaN(cleanQuantity) || cleanQuantity <= 0 ||
      isNaN(cleanCalories) || cleanCalories < 0 ||
      isNaN(cleanProtein) || cleanProtein < 0 ||
      isNaN(cleanCarbs) || cleanCarbs < 0 ||
      isNaN(cleanFats) || cleanFats < 0
    ) {
      return;
    }

    onAddItem({
      name: name.trim(),
      meal,
      quantity: cleanQuantity,
      serving: serving.trim(),
      calories: cleanCalories,
      protein: cleanProtein,
      carbs: cleanCarbs,
      fats: cleanFats,
    });

    // Reset Form
    setName('');
    setMeal('breakfast');
    setQuantity('');
    setServing('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');

    // Focus name input again
    if (foodNameInputRef && foodNameInputRef.current) {
      foodNameInputRef.current.focus();
    }
  };

  return (
    <section className="card entry-card" ref={formRef}>
      <h2>Log a food item</h2>
      <form onSubmit={handleSubmit} className="food-form" aria-label="Add a food item">
        <div className="field-group">
          <label htmlFor="food-name">Food</label>
          <input
            id="food-name"
            ref={foodNameInputRef}
            type="text"
            list="food-suggestions"
            autoComplete="off"
            placeholder="Chicken breast"
            value={name}
            onChange={handleNameChange}
            required
          />
          <datalist id="food-suggestions">
            {suggestions.map((sug) => (
              <option key={sug} value={sug} />
            ))}
          </datalist>
        </div>

        <div className="field-group">
          <label htmlFor="meal-type">Meal</label>
          <select id="meal-type" value={meal} onChange={(e) => setMeal(e.target.value)} required>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        <div className="field-grid">
          <div className="field-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              min="1"
              step="1"
              placeholder="2"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
          <div className="field-group">
            <label htmlFor="serving-size">Serving size</label>
            <input
              id="serving-size"
              type="text"
              placeholder="Large"
              value={serving}
              onChange={(e) => setServing(e.target.value)}
              required
            />
          </div>
          <div className="field-group">
            <label htmlFor="calories">Calories</label>
            <input
              id="calories"
              type="number"
              min="0"
              step="1"
              placeholder="120"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              required
            />
          </div>
          <div className="field-group">
            <label htmlFor="protein">Protein (g)</label>
            <input
              id="protein"
              type="number"
              min="0"
              step="0.1"
              placeholder="25"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              required
            />
          </div>
          <div className="field-group">
            <label htmlFor="carbs">Carbs (g)</label>
            <input
              id="carbs"
              type="number"
              min="0"
              step="0.1"
              placeholder="0"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              required
            />
          </div>
          <div className="field-group">
            <label htmlFor="fats">Fats (g)</label>
            <input
              id="fats"
              type="number"
              min="0"
              step="0.1"
              placeholder="3"
              value={fats}
              onChange={(e) => setFats(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="primary-button">
          Add Item
        </button>
      </form>
    </section>
  );
}
