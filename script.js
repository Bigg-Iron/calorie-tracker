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
const loginButton = document.getElementById('login-button');
const logoutButton = document.getElementById('logout-button');
const userInfo = document.getElementById('user-info');
const fabButton = document.getElementById('fab-add');

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

let currentUser = null;
let touchStartX = 0;
let touchStartY = 0;
let isPullingToRefresh = false;

async function loadItems() {
  if (!currentUser) return [];
  try {
    const q = window.firebaseFunctions.query(window.firebaseFunctions.collection(window.firebaseDb, 'items'), window.firebaseFunctions.where('userId', '==', currentUser.uid));
    const querySnapshot = await window.firebaseFunctions.getDocs(q);
    const loadedItems = [];
    querySnapshot.forEach((doc) => {
      loadedItems.push({ id: doc.id, ...doc.data() });
    });
    return loadedItems;
  } catch (error) {
    console.error('Failed to load saved items', error);
    return [];
  }
}

async function saveItems() {
  // Items are saved individually in addItem and removeItem
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

  // Track date filter usage
  if (typeof gtag !== 'undefined') {
    gtag('event', 'date_filter_changed', {
      event_category: 'navigation',
      event_label: filter
    });
  }
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

async function addItem(event) {
  event.preventDefault();

  if (!currentUser) {
    alert('Please sign in to add items.');
    return;
  }

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

  const newItem = {
    userId: currentUser.uid,
    name,
    meal,
    quantity,
    serving,
    timestamp: Date.now(),
    calories,
    protein,
    carbs,
    fats,
  };

  try {
    await window.firebaseFunctions.addDoc(window.firebaseFunctions.collection(window.firebaseDb, 'items'), newItem);
    // Real-time listener will update items
    foodForm.reset();
    foodNameInput.focus();

    // Track item addition in Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', 'add_food_item', {
        event_category: 'engagement',
        event_label: meal,
        value: calories
      });
    }
  } catch (error) {
    console.error('Failed to add item', error);
    alert(`Failed to add item: ${error.message}`);
  }
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

  // Track autocomplete usage
  if (typeof gtag !== 'undefined') {
    gtag('event', 'autocomplete_used', {
      event_category: 'engagement',
      event_label: name
    });
  }
}

async function removeItem(itemId) {
  try {
    await window.firebaseFunctions.deleteDoc(window.firebaseFunctions.doc(window.firebaseDb, 'items', itemId));
    // Real-time listener will update items

    // Track item deletion
    if (typeof gtag !== 'undefined') {
      gtag('event', 'delete_food_item', {
        event_category: 'engagement'
      });
    }
  } catch (error) {
    console.error('Failed to remove item', error);
  }
}

async function signIn(email, password) {
  try {
    await window.firebaseFunctions.signInWithEmailAndPassword(window.firebaseAuth, email, password);
    // Track sign in
    if (typeof gtag !== 'undefined') {
      gtag('event', 'login', {
        method: 'email'
      });
    }
  } catch (error) {
    alert('Sign in failed: ' + error.message);
  }
}

async function signUp(email, password) {
  try {
    await window.firebaseFunctions.createUserWithEmailAndPassword(window.firebaseAuth, email, password);
    // Track sign up
    if (typeof gtag !== 'undefined') {
      gtag('event', 'sign_up', {
        method: 'email'
      });
    }
  } catch (error) {
    alert('Sign up failed: ' + error.message);
  }
}

async function signOutUser() {
  try {
    await window.firebaseFunctions.signOut(window.firebaseAuth);
    // Track sign out
    if (typeof gtag !== 'undefined') {
      gtag('event', 'logout');
    }
  } catch (error) {
    console.error('Sign out failed', error);
  }
}

function showAuthPrompt() {
  const email = prompt('Enter your email:');
  if (!email) return;
  const password = prompt('Enter your password:');
  if (!password) return;
  const isSignUp = confirm('New user? Click OK to sign up, Cancel to sign in.');
  if (isSignUp) {
    signUp(email, password);
  } else {
    signIn(email, password);
  }
}

function updateAuthUI(user) {
  if (user) {
    loginButton.style.display = 'none';
    logoutButton.style.display = 'inline-block';
    userInfo.style.display = 'block';
    userInfo.textContent = `Signed in as ${user.email}`;
  } else {
    loginButton.style.display = 'inline-block';
    logoutButton.style.display = 'none';
    userInfo.style.display = 'none';
    items = [];
    renderItems();
  }
}

let unsubscribeItems = null;

async function waitForFirebaseReady() {
  if (window.firebaseReady) {
    await window.firebaseReady;
    return;
  }

  let retries = 0;
  while (!window.firebaseFunctions && retries < 40) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    retries += 1;
  }

  if (!window.firebaseFunctions) {
    throw new Error('Firebase initialization failed: window.firebaseFunctions not available.');
  }
}

async function initApp() {
  try {
    await waitForFirebaseReady();
  } catch (error) {
    console.error(error);
    alert('Firebase failed to initialize. Refresh the page and try again.');
    return;
  }

  window.firebaseFunctions.onAuthStateChanged(window.firebaseAuth, async (user) => {
    currentUser = user;
    updateAuthUI(user);
    if (user) {
      items = await loadItems();
      updateSuggestions();
      renderItems();
      if (unsubscribeItems) unsubscribeItems();

      const q = window.firebaseFunctions.query(
        window.firebaseFunctions.collection(window.firebaseDb, 'items'),
        window.firebaseFunctions.where('userId', '==', currentUser.uid)
      );

      unsubscribeItems = window.firebaseFunctions.onSnapshot
        ? window.firebaseFunctions.onSnapshot(q, (querySnapshot) => {
            items = [];
            querySnapshot.forEach((doc) => {
              items.push({ id: doc.id, ...doc.data() });
            });
            updateSuggestions();
            renderItems();
          })
        : null;
    } else {
      if (unsubscribeItems) {
        unsubscribeItems();
        unsubscribeItems = null;
      }
    }
  });

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

  loginButton.addEventListener('click', showAuthPrompt);
  logoutButton.addEventListener('click', signOutUser);

// Mobile-specific functionality
function initMobileFeatures() {
  // FAB functionality
  if (fabButton) {
    fabButton.addEventListener('click', () => {
      foodForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      foodNameInput.focus();

      // Track FAB usage
      if (typeof gtag !== 'undefined') {
        gtag('event', 'fab_used', {
          event_category: 'mobile_interaction'
        });
      }
    });
  }

  // Swipe gestures for date filters
  const filterCard = document.querySelector('.filter-card');
  if (filterCard) {
    filterCard.addEventListener('touchstart', handleTouchStart, { passive: false });
    filterCard.addEventListener('touchmove', handleTouchMove, { passive: false });
    filterCard.addEventListener('touchend', handleTouchEnd, { passive: false });
  }

  // Pull-to-refresh functionality
  let startY = 0;
  let refreshThreshold = 80;

  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (window.scrollY === 0 && !isPullingToRefresh) {
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY;

      if (diff > 50) {
        e.preventDefault();
        isPullingToRefresh = true;
        showPullIndicator();
      }
    }
  }, { passive: false });

  document.addEventListener('touchend', async () => {
    if (isPullingToRefresh) {
      hidePullIndicator();
      await refreshData();
      isPullingToRefresh = false;
    }
  });
}

function handleTouchStart(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function handleTouchMove(e) {
  if (!touchStartX || !touchStartY) return;

  const touchEndX = e.touches[0].clientX;
  const touchEndY = e.touches[0].clientY;
  const diffX = touchStartX - touchEndX;
  const diffY = touchStartY - touchEndY;

  // Only handle horizontal swipes (more significant than vertical)
  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
    e.preventDefault();

    if (diffX > 0) {
      // Swipe left - next filter
      cycleDateFilter('next');
    } else {
      // Swipe right - previous filter
      cycleDateFilter('prev');
    }

    touchStartX = 0;
    touchStartY = 0;
  }
}

function handleTouchEnd() {
  touchStartX = 0;
  touchStartY = 0;
}

function cycleDateFilter(direction) {
  const filters = [DATE_FILTERS.all, DATE_FILTERS.today, DATE_FILTERS.yesterday];
  let currentIndex = filters.indexOf(activeDateFilter);

  if (direction === 'next') {
    currentIndex = (currentIndex + 1) % filters.length;
  } else {
    currentIndex = currentIndex <= 0 ? filters.length - 1 : currentIndex - 1;
  }

  setActiveDateFilter(filters[currentIndex]);

  // Track swipe usage
  if (typeof gtag !== 'undefined') {
    gtag('event', 'swipe_navigation', {
      event_category: 'mobile_interaction',
      event_label: direction
    });
  }
}

function showPullIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'pull-indicator';
  indicator.textContent = '🔄 Pull to refresh';
  indicator.style.cssText = `
    position: fixed;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--primary);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    font-size: 0.9rem;
    z-index: 1001;
    pointer-events: none;
  `;
  document.body.appendChild(indicator);
}

function hidePullIndicator() {
  const indicator = document.getElementById('pull-indicator');
  if (indicator) {
    indicator.remove();
  }
}

async function refreshData() {
  if (currentUser) {
    items = await loadItems();
    updateSuggestions();
    renderItems();

    // Track refresh usage
    if (typeof gtag !== 'undefined') {
      gtag('event', 'pull_to_refresh', {
        event_category: 'mobile_interaction'
      });
    }
  }
}

setActiveDateFilter(DATE_FILTERS.all);
updateSuggestions();

// Initialize mobile features after Firebase is ready
initApp().then(() => {
  initMobileFeatures();
});
}

initApp();
