import React, { useRef } from 'react';

const DATE_FILTERS = {
  all: 'all',
  today: 'today',
  yesterday: 'yesterday',
  custom: 'custom',
};

export default function FilterCard({ activeFilter, customDate, onChangeFilter }) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // Handle horizontal swipes (if more significant than vertical swipe)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
      // Prevent default scrolling only if it's clearly a horizontal swipe
      if (e.cancelable) e.preventDefault();

      if (diffX > 0) {
        // Swipe left - next filter
        cycleDateFilter('next');
      } else {
        // Swipe right - previous filter
        cycleDateFilter('prev');
      }

      touchStartX.current = 0;
      touchStartY.current = 0;
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = 0;
    touchStartY.current = 0;
  };

  const cycleDateFilter = (direction) => {
    const order = [DATE_FILTERS.all, DATE_FILTERS.today, DATE_FILTERS.yesterday];
    let currentIndex = order.indexOf(activeFilter);
    // Default to 'all' if activeFilter is custom
    if (currentIndex === -1) currentIndex = 0;

    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % order.length;
    } else {
      nextIndex = currentIndex <= 0 ? order.length - 1 : currentIndex - 1;
    }

    const nextFilter = order[nextIndex];
    onChangeFilter(nextFilter, '');

    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'swipe_navigation', {
        event_category: 'mobile_interaction',
        event_label: direction,
      });
    }
  };

  const handleFilterClick = (filter) => {
    onChangeFilter(filter, '');
  };

  const handleCustomDateChange = (e) => {
    const val = e.target.value;
    if (val) {
      onChangeFilter(DATE_FILTERS.custom, val);
    }
  };

  const getSummaryText = () => {
    if (activeFilter === DATE_FILTERS.today) {
      return 'Showing entries logged today.';
    }
    if (activeFilter === DATE_FILTERS.yesterday) {
      return 'Showing entries logged yesterday.';
    }
    if (activeFilter === DATE_FILTERS.custom && customDate) {
      return `Showing entries logged on ${new Date(customDate).toLocaleDateString('en-US')}.`;
    }
    return 'Showing all logged entries.';
  };

  return (
    <section
      className="card filter-card"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <h2>Recall entries</h2>
      <div className="recall-actions" role="group" aria-label="Recall entries by date">
        <button
          type="button"
          className={`secondary-button recall-button ${activeFilter === DATE_FILTERS.all ? 'active' : ''}`}
          onClick={() => handleFilterClick(DATE_FILTERS.all)}
        >
          All entries
        </button>
        <button
          type="button"
          className={`secondary-button recall-button ${activeFilter === DATE_FILTERS.today ? 'active' : ''}`}
          onClick={() => handleFilterClick(DATE_FILTERS.today)}
        >
          Today
        </button>
        <button
          type="button"
          className={`secondary-button recall-button ${activeFilter === DATE_FILTERS.yesterday ? 'active' : ''}`}
          onClick={() => handleFilterClick(DATE_FILTERS.yesterday)}
        >
          Yesterday
        </button>
        <input
          type="date"
          id="custom-date"
          className={`date-input ${activeFilter === DATE_FILTERS.custom ? 'active-input' : ''}`}
          aria-label="Select a date to recall entries"
          value={customDate}
          onChange={handleCustomDateChange}
        />
      </div>
      <p className="summary-text" id="recall-summary">
        {getSummaryText()}
      </p>
    </section>
  );
}
