/**
 * Interview Arcade — Client-Side Hash Router
 * Supports back/forward browser navigation and cleans up active views on unmount.
 */

class Router {
  constructor() {
    this.routes = {};
    this.currentView = null;
    this.currentRoute = '';
    this.viewContainer = null;
  }

  init(containerId) {
    this.viewContainer = document.getElementById(containerId);
    window.addEventListener('hashchange', () => this._handleRoute());
    // Initial route handling
    this._handleRoute();
  }

  register(path, handler) {
    this.routes[path] = handler;
  }

  navigate(path) {
    window.location.hash = path;
  }

  _parseHash() {
    const hash = window.location.hash.slice(1) || '/';
    const [path, queryString] = hash.split('?');
    const params = {};
    if (queryString) {
      new URLSearchParams(queryString).forEach((val, key) => {
        params[key] = val;
      });
    }
    return { path, params };
  }

  async _handleRoute() {
    const { path, params } = this._parseHash();
    this.currentRoute = path;

    // Call unmount/cleanup on previous view if it exists
    if (this.currentView && typeof this.currentView.destroy === 'function') {
      try {
        this.currentView.destroy();
      } catch (err) {
        console.error('Error during view cleanup:', err);
      }
    }
    this.currentView = null;

    // Match exact route or parameterized route (e.g., /game/:id)
    let matchedHandler = null;
    let routeParams = {};

    if (this.routes[path]) {
      matchedHandler = this.routes[path];
    } else {
      for (const routePattern in this.routes) {
        if (routePattern.includes(':')) {
          const patternParts = routePattern.split('/');
          const pathParts = path.split('/');
          if (patternParts.length === pathParts.length) {
            let match = true;
            const tempParams = {};
            for (let i = 0; i < patternParts.length; i++) {
              if (patternParts[i].startsWith(':')) {
                tempParams[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
              } else if (patternParts[i] !== pathParts[i]) {
                match = false;
                break;
              }
            }
            if (match) {
              matchedHandler = this.routes[routePattern];
              routeParams = tempParams;
              break;
            }
          }
        }
      }
    }

    // Update navigation active styles
    this._updateNavLinks(path);

    // Scroll to top on navigation
    window.scrollTo(0, 0);

    if (matchedHandler) {
      try {
        this.currentView = await matchedHandler({ ...params, ...routeParams }, this.viewContainer);
      } catch (err) {
        console.error('Failed to load view:', err);
        this._renderError('Failed to load this arcade chamber. Please return to the hub.', err);
      }
    } else {
      this._renderNotFound();
    }
  }

  _updateNavLinks(currentPath) {
    // Route label dictionary for topbar breadcrumb
    const routeTitles = {
      '/': 'Practice Problems',
      '/arcade': 'Practice Problems',
      '/dashboard': 'Dashboard & Roadmap',
      '/assessment': 'Diagnostic Assessment',
      '/interview': 'Mock Interviews',
      '/mistakes': 'Mistake Notebook',
      '/resume': 'Resume Scanner',
      '/feedback': 'Feedback & Support',
      '/about': 'About Platform',
      '/game/tictactoe': 'Interactive OOP Challenge',
      '/game/memory': 'Computer Science Terminology',
      '/game/aptitude': 'Quantitative Aptitude',
      '/game/resume': 'Resume Keyword Scanner',
      '/game/sql': 'SQL Query Challenges',
      '/game/riddles': 'Visual Logic Puzzles',
      '/game/dsa': 'Data Structures & Big-O',
      '/game/debugger': 'C++ Systems Debugger',
      '/game/interview': 'Behavioral & System Design Mock',
      '/game/assessment': 'Diagnostic Assessment',
      '/game/mistakes': 'Mistake Notebook',
      '/game/feedback': 'Feedback & Support',
      '/game/dashboard': 'Dashboard & Roadmap'
    };

    const breadcrumbElem = document.getElementById('breadcrumb-current');
    if (breadcrumbElem) {
      breadcrumbElem.textContent = routeTitles[currentPath] || 'Practice Challenge';
    }

    // Auto-close mobile drawer on navigation
    const sidebar = document.getElementById('app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('active');
    }

    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkPath = href.replace('#', '') || '/';
      if (linkPath === currentPath || (linkPath !== '/' && currentPath.startsWith(linkPath))) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  _renderNotFound() {
    if (!this.viewContainer) return;
    this.viewContainer.innerHTML = `
      <div class="content-container text-center" style="padding: var(--space-3xl) var(--space-md); text-align: center;">
        <div style="font-size: 2.5rem; margin-bottom: var(--space-sm); color: var(--color-ink-faint);">404</div>
        <h1 style="margin: var(--space-sm) 0;">Page Not Found</h1>
        <p style="max-width: 480px; margin: 0 auto var(--space-lg); color: var(--color-ink-muted);">The problem or challenge page you are looking for does not exist or has moved.</p>
        <a href="#/" class="btn btn-primary">Browse Practice Problems</a>
      </div>
    `;
  }

  _renderError(message, error) {
    if (!this.viewContainer) return;
    this.viewContainer.innerHTML = `
      <div class="content-container text-center" style="padding: var(--space-3xl) var(--space-md); text-align: center;">
        <div style="font-size: 2.5rem; margin-bottom: var(--space-sm); color: var(--color-warning);">⚠️</div>
        <h1 style="margin: var(--space-sm) 0;">System Interruption</h1>
        <p style="max-width: 480px; margin: 0 auto var(--space-md); color: var(--color-ink-muted);">${message}</p>
        <pre style="max-width: 600px; margin: 0 auto var(--space-lg); text-align: left; font-size: var(--font-size-xs); background: var(--color-bg-subtle); padding: var(--space-sm); border-radius: var(--radius-sm);">${error?.message || 'Unknown error'}</pre>
        <a href="#/" class="btn btn-primary">Return to Practice Problems</a>
      </div>
    `;
  }
}

export const router = new Router();
