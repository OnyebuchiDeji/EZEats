// productViewToggle.js - Grid/List View Toggle Functionality

class ProductViewToggle {
  constructor() {
    this.productList = document.querySelector('.product-list');
    this.gridBtn = document.getElementById('view-grid-btn');
    this.listBtn = document.getElementById('view-list-btn');
    this.currentView = 'grid'; // default view
    
    this.init();
  }

  init() {
    // Load saved preference from localStorage
    this.loadViewPreference();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Apply initial view
    this.applyView(this.currentView);
  }

  setupEventListeners() {
    // Grid view button
    if (this.gridBtn) {
      this.gridBtn.addEventListener('click', () => {
        this.switchToView('grid');
      });
    }

    // List view button
    if (this.listBtn) {
      this.listBtn.addEventListener('click', () => {
        this.switchToView('list');
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Press 'G' for grid view
      if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey) {
        const target = e.target;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          this.switchToView('grid');
        }
      }
      // Press 'L' for list view
      if (e.key.toLowerCase() === 'l' && !e.ctrlKey && !e.metaKey) {
        const target = e.target;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          this.switchToView('list');
        }
      }
    });

    // Handle window resize for responsive view switching
    window.addEventListener('resize', () => {
      this.handleResponsiveView();
    });
  }

  switchToView(view) {
    if (this.currentView === view) return;

    this.currentView = view;
    this.applyView(view);
    this.saveViewPreference(view);
    this.animateTransition();
  }

  applyView(view) {
    if (!this.productList) return;

    // Remove all view classes
    this.productList.classList.remove('grid-view', 'list-view');

    // Add appropriate class
    if (view === 'list') {
      this.productList.classList.add('list-view');
    } else {
      this.productList.classList.add('grid-view');
    }

    // Update button states
    this.updateButtonStates(view);

    // Trigger custom event for other components to listen to
    this.dispatchViewChangeEvent(view);

    // Update ARIA labels for accessibility
    this.updateAriaLabels(view);
  }

  updateButtonStates(view) {
    if (this.gridBtn && this.listBtn) {
      if (view === 'grid') {
        this.gridBtn.classList.add('active');
        this.listBtn.classList.remove('active');
        this.gridBtn.setAttribute('aria-pressed', 'true');
        this.listBtn.setAttribute('aria-pressed', 'false');
      } else {
        this.listBtn.classList.add('active');
        this.gridBtn.classList.remove('active');
        this.listBtn.setAttribute('aria-pressed', 'true');
        this.gridBtn.setAttribute('aria-pressed', 'false');
      }
    }
  }

  animateTransition() {
    // Add animation class to product cards
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9)';
      
      setTimeout(() => {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'scale(1)';
      }, index * 30); // Stagger animation
    });

    // Clean up after animation
    setTimeout(() => {
      cards.forEach(card => {
        card.style.transition = '';
      });
    }, cards.length * 30 + 300);
  }

  saveViewPreference(view) {
    try {
      localStorage.setItem('productViewPreference', view);
    } catch (e) {
      console.warn('Could not save view preference to localStorage:', e);
    }
  }

  loadViewPreference() {
    try {
      const savedView = localStorage.getItem('productViewPreference');
      if (savedView && (savedView === 'grid' || savedView === 'list')) {
        this.currentView = savedView;
      }
    } catch (e) {
      console.warn('Could not load view preference from localStorage:', e);
    }
  }

  handleResponsiveView() {
    const width = window.innerWidth;
    
    // On mobile screens, force grid view for better UX
    if (width < 768 && this.currentView === 'list') {
      this.switchToView('grid');
      this.showNotification('Switched to grid view for better mobile experience');
    }
  }

  dispatchViewChangeEvent(view) {
    const event = new CustomEvent('productViewChanged', {
      detail: { view: view },
      bubbles: true
    });
    document.dispatchEvent(event);
  }

  updateAriaLabels(view) {
    if (this.productList) {
      this.productList.setAttribute('aria-label', 
        `Product list in ${view} view`
      );
    }
  }

  showNotification(message) {
    // Simple notification (you can enhance this)
    const notification = document.createElement('div');
    notification.className = 'view-toggle-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: linear-gradient(135deg, var(--primary-purple), var(--secondary-purple));
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      animation: slideInUp 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutDown 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 2000);
  }

  // Public method to get current view
  getCurrentView() {
    return this.currentView;
  }

  // Public method to programmatically switch view
  setView(view) {
    if (view === 'grid' || view === 'list') {
      this.switchToView(view);
    }
  }
}

// Initialize when DOM is ready
//  Only works when script is not a module!
document.addEventListener('DOMContentLoaded', () => {
    //  Using the SetTimeout allows enough time for the scripts
    //  that load-in the html for the product-list, view-grid, and view-list
    //  elements to finish loading.
    setTimeout(()=>{
        window.productViewToggle = new ProductViewToggle();
    }, 1200);
});

// Example usage in other parts of your code:
// Listen for view changes
// document.addEventListener('productViewChanged', (e) => {
  // console.log('View changed to:', e.detail.view);
  // Perform additional actions when view changes
  // e.g., update analytics, adjust layout, etc.
// });

// Programmatically change view
// window.productViewToggle.setView('list');

// Get current view
// const currentView = window.productViewToggle.getCurrentView();