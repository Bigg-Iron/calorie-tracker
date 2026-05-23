import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';

import AuthModal from './components/AuthModal';
import FoodForm from './components/FoodForm';
import FilterCard from './components/FilterCard';
import SummaryCard from './components/SummaryCard';
import MealSection from './components/MealSection';

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [customDate, setCustomDate] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pullRefreshIndicator, setPullRefreshIndicator] = useState(false);

  // References for FAB scrolling
  const foodFormRef = useRef(null);
  const foodNameInputRef = useRef(null);

  // 1. Listen for Authentication changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
      if (!user) {
        setItems([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Load and listen to Firestore items in real-time when user is authenticated
  useEffect(() => {
    if (!currentUser) {
      setItems([]);
      return;
    }

    const q = query(collection(db, 'items'), where('userId', '==', currentUser.uid));
    
    // Initial fetch to load items immediately
    getDocs(q).then((querySnapshot) => {
      const loaded = [];
      querySnapshot.forEach((docSnap) => {
        loaded.push({ id: docSnap.id, ...docSnap.data() });
      });
      setItems(loaded);
    }).catch(err => {
      console.error('Error fetching initial logs:', err);
    });

    // Realtime Listener
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const updated = [];
      querySnapshot.forEach((docSnap) => {
        updated.push({ id: docSnap.id, ...docSnap.data() });
      });
      setItems(updated);
    }, (err) => {
      console.error('Realtime listener error:', err);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // 3. Document-level Swipe / Pull-to-refresh listener for mobile
  useEffect(() => {
    let startY = 0;
    let isPulling = false;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (window.scrollY === 0 && !isPulling) {
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        if (diff > 80) {
          isPulling = true;
          setPullRefreshIndicator(true);

          if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'pull_to_refresh', {
              event_category: 'mobile_interaction'
            });
          }
        }
      }
    };

    const handleTouchEnd = () => {
      if (isPulling) {
        // Perform simulated refresh
        if (currentUser) {
          const q = query(collection(db, 'items'), where('userId', '==', currentUser.uid));
          getDocs(q).then((querySnapshot) => {
            const loaded = [];
            querySnapshot.forEach((docSnap) => {
              loaded.push({ id: docSnap.id, ...docSnap.data() });
            });
            setItems(loaded);
          }).finally(() => {
            setPullRefreshIndicator(false);
            isPulling = false;
          });
        } else {
          setPullRefreshIndicator(false);
          isPulling = false;
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentUser]);

  // 4. Firestore operations
  const handleAddItem = async (newItemData) => {
    if (!currentUser) return;
    try {
      const docData = {
        userId: currentUser.uid,
        timestamp: Date.now(),
        ...newItemData
      };
      await addDoc(collection(db, 'items'), docData);

      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'add_food_item', {
          event_category: 'engagement',
          event_label: newItemData.meal,
          value: newItemData.calories
        });
      }
    } catch (err) {
      console.error('Failed to save item:', err);
      alert('Failed to log food: ' + err.message);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await deleteDoc(doc(db, 'items', itemId));
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'delete_food_item', {
          event_category: 'engagement'
        });
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item: ' + err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'logout');
      }
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  // 5. Date filtering logic
  const getFilteredItems = () => {
    const toLocalDateString = (ts) => new Date(ts).toLocaleDateString('en-US');

    if (activeFilter === 'today') {
      const todayString = new Date().toLocaleDateString('en-US');
      return items.filter((item) => toLocalDateString(item.timestamp) === todayString);
    }

    if (activeFilter === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toLocaleDateString('en-US');
      return items.filter((item) => toLocalDateString(item.timestamp) === yesterdayString);
    }

    if (activeFilter === 'custom' && customDate) {
      const selectedString = new Date(customDate).toLocaleDateString('en-US');
      return items.filter((item) => toLocalDateString(item.timestamp) === selectedString);
    }

    return items;
  };

  const visibleItems = getFilteredItems();

  // 6. FAB behavior
  const handleFabClick = () => {
    if (foodFormRef.current) {
      foodFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (foodNameInputRef.current) {
      foodNameInputRef.current.focus();
    }

    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'fab_used', {
        event_category: 'mobile_interaction'
      });
    }
  };

  return (
    <main className="app-shell">
      {/* Pull to refresh visual indicator */}
      {pullRefreshIndicator && (
        <div id="pull-indicator">
          🔄 Pulling to refresh...
        </div>
      )}

      {/* App Header */}
      <header className="hero">
        <div>
          <p className="eyebrow">Nutrition tracker</p>
          <h1>Calorie Tracker</h1>
          <p className="subtitle">
            Add food items, view nutrition information, and track meal and daily totals.
          </p>
        </div>
        <div id="auth-section" className="auth-section">
          {loadingAuth ? (
            <p className="loading-text">Loading authentication...</p>
          ) : currentUser ? (
            <>
              <p id="user-info">Signed in as {currentUser.email}</p>
              <button id="logout-button" className="secondary-button" onClick={handleSignOut}>
                Sign Out
              </button>
            </>
          ) : (
            <button id="login-button" className="secondary-button" onClick={() => setAuthModalOpen(true)}>
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main content body */}
      {currentUser ? (
        <>
          <FoodForm
            onAddItem={handleAddItem}
            items={items}
            formRef={foodFormRef}
            foodNameInputRef={foodNameInputRef}
          />

          <FilterCard
            activeFilter={activeFilter}
            customDate={customDate}
            onChangeFilter={(filter, date) => {
              setActiveFilter(filter);
              setCustomDate(date);
              if (typeof window.gtag !== 'undefined') {
                window.gtag('event', 'date_filter_changed', {
                  event_category: 'navigation',
                  event_label: filter
                });
              }
            }}
          />

          <SummaryCard visibleItems={visibleItems} />

          {/* Render grouped meals list */}
          <div className="meal-list">
            {visibleItems.length === 0 ? (
              <p className="empty-state">
                No entries match the selected date. Add items above or choose a different date filter.
              </p>
            ) : (
              MEAL_ORDER.map((mealKey) => {
                const mealItems = visibleItems.filter((item) => item.meal === mealKey);
                if (mealItems.length === 0) return null;
                return (
                  <MealSection
                    key={mealKey}
                    mealKey={mealKey}
                    mealItems={mealItems}
                    onRemoveItem={handleRemoveItem}
                  />
                );
              })
            )}
          </div>
        </>
      ) : (
        <section className="card welcome-card">
          <h2>Welcome to Calorie Tracker</h2>
          <p className="welcome-text">
            To start logging your daily calorie intake, track food macros, and recall historical log files, please sign in.
          </p>
          <button className="primary-button center-btn" onClick={() => setAuthModalOpen(true)}>
            Sign In Now
          </button>
        </section>
      )}

      {/* Floating Action Button for Mobile */}
      {currentUser && (
        <button id="fab-add" className="fab-button" onClick={handleFabClick} aria-label="Quick add food item">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      )}

      {/* Authentication Modal Dialog */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </main>
  );
}
