const foodForm = document.getElementById('food-form');
const foodNameInput = document.getElementById('food-name');
const foodSuggestions = document.getElementById('food-suggestions');
const mealTypeSelect = document.getElementById('meal-type');
const quantityInput = document.getElementById('quantity');
const servingSizeInput = document.getElementById('serving-size');
const caloriesInput = document.getElementById('calories');
const proteinInput = document.getElementById('protein');
const carbsInput = document.getElementById('carbs');
const fatsInput = document.getElementById('fats');
const customDateInput = document.getElementById('custom-date');
const recallButtons = document.querySelectorAll('.recall-button');
const recallSummary = document.getElementById('recall-summary');
const mealList = document.getElementById('meal-list');
const dailyCalories = document.getElementById('daily-calories');
const dailyProtein = document.getElementById('daily-protein');
const dailyCarbs = document.getElementById('daily-carbs');
const dailyFats = document.getElementById('daily-fats');

const STORAGE_KEY = 'calorie-tracker-items';
const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

const DATE_FILTERS = {
  all: 'all',
  today: 'today',
  yesterday: 'yesterday',
  custom: 'custom',
};

let items = loadItems();
let activeDateFilter = DATE_FILTERS.all;
let customFilterDate = '';

function loadItems() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    return rawData ? JSON.parse(rawData) : [];
  } catch (error) {
    console.error('Failed to load saved items', error);
    return [];
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function updateSuggestions() {
  const uniqueNames = [...new Map(items.map((item) => [item.name.toLowerCase(), item.name])).values()];
  foodSuggestions.innerHTML = uniqueNames
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `<option value="${name}"></option>`)
    .join('');
}

function formatNumber(value) {
  return Number(value).toLocaleString('en-US', { maximumFractionDigits: 1 });
}

function toLocalDateString(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US');
}

function formatTimestamp(timestamp) {
  return new Date(timestamp).toLocaleString('en-US', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function createTableRow(item) {
  const row = document.createElement('tr');

  row.innerHTML = `
    <td>${item.name}</td>
    <td>${item.quantity}</td>
    <td>${item.serving}</td>
    <td>${formatTimestamp(item.timestamp)}</td>
    <td>${formatNumber(item.calories)}</td>
    <td>${formatNumber(item.protein)}</td>
    <td>${formatNumber(item.carbs)}</td>
    <td>${formatNumber(item.fats)}</td>
    <td><button type="button" class="delete-button" data-id="${item.id}">Delete</button></td>
  `;

  const deleteButton = row.querySelector('.delete-button');
  deleteButton.addEventListener('click', () => removeItem(item.id));

  return row;
}

function createMealSection(mealKey, mealItems) {
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

  const mealCard = document.createElement('section');
  mealCard.className = 'card meal-card';
  mealCard.innerHTML = `
    <div class="meal-header">
      <div>
        <h3 class="meal-title">${MEAL_LABELS[mealKey]}</h3>
        <p class="summary-text">${mealItems.length} item${mealItems.length === 1 ? '' : 's'}</p>
      </div>
      <div class="summary-value">
        <span>Calories</span>
        <strong>${formatNumber(subtotal.calories)}</strong>
      </div>
    </div>
    <div class="table-wrapper">
      <table class="nutrition-table">
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
        <tbody></tbody>
        <tfoot>
          <tr class="subtotal-row">
            <td>Subtotal</td>
            <td></td>
            <td></td>
            <td></td>
            <td>${formatNumber(subtotal.calories)}</td>
            <td>${formatNumber(subtotal.protein)}</td>
            <td>${formatNumber(subtotal.carbs)}</td>
            <td>${formatNumber(subtotal.fats)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;

  const tbody = mealCard.querySelector('tbody');
  mealItems.forEach((item) => tbody.appendChild(createTableRow(item)));

  return mealCard;
}

function getFilteredItems() {
  if (activeDateFilter === DATE_FILTERS.today) {
    const today = new Date().toLocaleDateString('en-US');
    return items.filter((item) => toLocalDateString(item.timestamp) === today);
  }

  if (activeDateFilter === DATE_FILTERS.yesterday) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toLocaleDateString('en-US');
    return items.filter((item) => toLocalDateString(item.timestamp) === yesterdayString);
  }

  if (activeDateFilter === DATE_FILTERS.custom && customFilterDate) {
    return items.filter((item) => toLocalDateString(item.timestamp) === new Date(customFilterDate).toLocaleDateString('en-US'));
  }

  return items;
}

function updateRecallSummary() {
  if (activeDateFilter === DATE_FILTERS.today) {
    recallSummary.textContent = 'Showing entries logged today.';
    return;
  }

  if (activeDateFilter === DATE_FILTERS.yesterday) {
    recallSummary.textContent = 'Showing entries logged yesterday.';
    return;
  }

  if (activeDateFilter === DATE_FILTERS.custom && customFilterDate) {
    recallSummary.textContent = `Showing entries logged on ${new Date(customFilterDate).toLocaleDateString('en-US')}.`;
    return;
  }

  recallSummary.textContent = 'Showing all logged entries.';
}

function setActiveDateFilter(filter) {
  activeDateFilter = filter;
  recallButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.date === filter);
  });

  if (filter !== DATE_FILTERS.custom) {
    customDateInput.value = '';
    customFilterDate = '';
  }

  updateRecallSummary();
  renderItems();
}

function renderItems() {
  mealList.innerHTML = '';

  const visibleItems = getFilteredItems();
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

  dailyCalories.textContent = formatNumber(totals.calories);
  dailyProtein.textContent = `${formatNumber(totals.protein)} g`;
  dailyCarbs.textContent = `${formatNumber(totals.carbs)} g`;
  dailyFats.textContent = `${formatNumber(totals.fats)} g`;

  if (visibleItems.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'No entries match the selected date. Add or choose a different date.';
    mealList.appendChild(emptyState);
    return;
  }

  MEAL_ORDER.forEach((mealKey) => {
    const mealItems = visibleItems.filter((item) => item.meal === mealKey);
    if (mealItems.length > 0) {
      mealList.appendChild(createMealSection(mealKey, mealItems));
    }
  });
}

function validateNumber(value, isInteger = false) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return false;
  }

  if (isInteger) {
    return Number.isInteger(number) && number > 0;
  }

  return number >= 0;
}

function addItem(event) {
  event.preventDefault();

  const name = foodNameInput.value.trim();
  const meal = mealTypeSelect.value;
  const quantity = Number(quantityInput.value);
  const serving = servingSizeInput.value.trim();
  const calories = Number(caloriesInput.value);
  const protein = Number(proteinInput.value);
  const carbs = Number(carbsInput.value);
  const fats = Number(fatsInput.value);

  if (
    !name ||
    !serving ||
    !validateNumber(quantity, true) ||
    !validateNumber(calories) ||
    !validateNumber(protein) ||
    !validateNumber(carbs) ||
    !validateNumber(fats)
  ) {
    foodNameInput.focus();
    return;
  }

  items.push({
    id: Date.now().toString(),
    name,
    meal,
    quantity,
    serving,
    timestamp: Date.now(),
    calories,
    protein,
    carbs,
    fats,
  });

  saveItems();
  updateSuggestions();
  renderItems();
  foodForm.reset();
  foodNameInput.focus();
}

function fillNutritionFromFood(name) {
  const item = items.find((entry) => entry.name.toLowerCase() === name.toLowerCase());
  if (!item) {
    return;
  }

  quantityInput.value = item.quantity;
  servingSizeInput.value = item.serving;
  caloriesInput.value = item.calories;
  proteinInput.value = item.protein;
  carbsInput.value = item.carbs;
  fatsInput.value = item.fats;
  mealTypeSelect.value = item.meal;
}

function removeItem(itemId) {
  items = items.filter((item) => item.id !== itemId);
  saveItems();
  updateSuggestions();
  renderItems();
}

foodForm.addEventListener('submit', addItem);
foodNameInput.addEventListener('input', (event) => {
  const currentValue = event.target.value.trim();
  if (currentValue.length >= 2) {
    fillNutritionFromFood(currentValue);
  }
});
recallButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveDateFilter(button.dataset.date);
  });
});
customDateInput.addEventListener('change', (event) => {
  const value = event.target.value;
  if (value) {
    customFilterDate = value;
    setActiveDateFilter(DATE_FILTERS.custom);
  }
});

setActiveDateFilter(DATE_FILTERS.all);
updateSuggestions();
