/**
 * Interview Arcade — Full-Stack API Client
 * Connects frontend game chambers to the FastAPI backend.
 * Provides JWT token management, automatic session header injection,
 * and seamless fallback to client-side storage if running statically.
 */

function resolveApiBase() {
  if (typeof window === 'undefined' || !window.location) return '/api';
  // If running on backend origin directly (port 8000)
  if (window.location.port === '8000') {
    return '/api';
  }
  // If running from file:// or a different local dev port (Live Server 5500, Vite 5173, etc.)
  const hostname = window.location.hostname || '';
  const isLocal = !hostname ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.') ||
    window.location.protocol === 'file:';

  if (isLocal) {
    return 'http://127.0.0.1:8000/api';
  }
  return '/api';
}

const API_BASE = resolveApiBase();
const TOKEN_KEY = 'ia_auth_token_session';

class ApiClient {
  constructor() {
    this.token = null;
    this.currentUser = null;
    this._loadStoredToken();
  }

  _loadStoredToken() {
    try {
      if (typeof sessionStorage !== 'undefined') {
        this.token = sessionStorage.getItem(TOKEN_KEY) || null;
      } else {
        this.token = null;
      }
    } catch (e) {
      this.token = null;
    }
  }

  setToken(token) {
    this.token = token;
    try {
      if (typeof sessionStorage !== 'undefined') {
        if (token) {
          sessionStorage.setItem(TOKEN_KEY, token);
        } else {
          sessionStorage.removeItem(TOKEN_KEY);
        }
      }
    } catch (e) {}
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
      });

      if (response.status === 401) {
        this.setToken(null);
        this.currentUser = null;
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.detail || `API request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return data;
    } catch (err) {
      throw err;
    }
  }

  async checkHealth() {
    try {
      const res = await this.request('/health');
      return res?.status === 'healthy';
    } catch (e) {
      return false;
    }
  }

  async register(username, email, password, target_role = 'backend') {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: (username || '').trim(),
        email: (email || '').trim().toLowerCase(),
        password,
        target_role
      })
    });
    this.setToken(data.access_token);
    this.currentUser = data.user;
    return data;
  }

  async login(identifier, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: identifier,
        username: identifier,
        identifier: identifier,
        password
      })
    });
    this.setToken(data.access_token);
    this.currentUser = data.user;
    return data;
  }

  async getCurrentUser() {
    if (!this.token) return null;
    try {
      const user = await this.request('/auth/me');
      this.currentUser = user;
      return user;
    } catch (e) {
      this.setToken(null);
      this.currentUser = null;
      return null;
    }
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (e) {}
    this.setToken(null);
    this.currentUser = null;
  }

  async submitChallenge(gameId, difficulty, answers, durationSeconds) {
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return await this.request('/games/submit', {
      method: 'POST',
      body: JSON.stringify({
        game_id: gameId,
        difficulty,
        answers,
        duration_seconds: durationSeconds,
        idempotency_key: idempotencyKey
      })
    });
  }

  async getDashboardStats() {
    return await this.request('/dashboard/stats');
  }

  async getLearningPath() {
    return await this.request('/learning/path');
  }

  async updateTargetRole(targetRole) {
    return await this.request('/learning/target-role', {
      method: 'PUT',
      body: JSON.stringify({ target_role: targetRole })
    });
  }

  async getRecommendation() {
    return await this.request('/learning/recommendations');
  }

  async evaluateResponse(evaluationPayload) {
    return await this.request('/ai/evaluate', {
      method: 'POST',
      body: JSON.stringify(evaluationPayload)
    });
  }

  async getExemplar(scenarioId) {
    return await this.request(`/ai/exemplar/${scenarioId}`);
  }

  async generateQuestions(payload) {
    return await this.request('/questions/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getQuestionHistory(gameId = null) {
    const query = gameId ? `?game_id=${encodeURIComponent(gameId)}` : '';
    return await this.request(`/questions/history${query}`);
  }
}

export const api = new ApiClient();
