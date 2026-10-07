// UrbanSafe AI - Frontend Authentication Manager
import { DEMO_USERS } from './data/mockData.js';

const STORAGE_KEY = 'urbansafe_auth_session';
const REGISTERED_USERS_KEY = 'urbansafe_registered_users';

export class AuthManager {
  constructor() {
    this.initUsers();
  }

  initUsers() {
    try {
      if (typeof localStorage !== 'undefined' && !localStorage.getItem(REGISTERED_USERS_KEY)) {
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(DEMO_USERS));
      }
    } catch {}
  }

  getRegisteredUsers() {
    try {
      if (typeof localStorage !== 'undefined') {
        const data = localStorage.getItem(REGISTERED_USERS_KEY);
        return data ? JSON.parse(data) : [...DEMO_USERS];
      }
      return [...DEMO_USERS];
    } catch {
      return [...DEMO_USERS];
    }
  }

  isAuthenticated() {
    const session = this.getSession();
    return !!session && !!session.token;
  }

  getSession() {
    try {
      if (typeof localStorage !== 'undefined' && typeof sessionStorage !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
      }
      return null;
    } catch {
      return null;
    }
  }

  getCurrentUser() {
    const session = this.getSession();
    return session ? session.user : null;
  }

  /**
   * Demo Authentication Flow
   * Simulates real authentication with a safe simulated token
   */
  async login(email, password, rememberMe = true) {
    const users = this.getRegisteredUsers();
    const cleanEmail = email.trim().toLowerCase();

    // Check existing or demo user
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (user) {
      if (user.password !== password) {
        throw new Error('Incorrect password. Please verify your credentials or use demo123.');
      }
    } else {
      // Demo permissive fallback: allow any valid email/password for quick testing
      user = {
        name: cleanEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Demo Operator',
        email: cleanEmail,
        password: password,
        role: 'Analyst'
      };
      users.push(user);
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
    }

    const sessionPayload = {
      token: 'demo-jwt-' + Math.random().toString(36).substring(2) + Date.now(),
      user: {
        name: user.name,
        email: user.email,
        role: user.role || 'Analyst'
      },
      loginTime: new Date().toISOString()
    };

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionPayload));
    } else {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(sessionPayload));
    }

    return sessionPayload.user;
  }

  /**
   * Registration Flow
   */
  async register(name, email, password, role = 'Analyst') {
    const users = this.getRegisteredUsers();
    const cleanEmail = email.trim().toLowerCase();

    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const newUser = {
      name: name.trim(),
      email: cleanEmail,
      password: password,
      role: role
    };

    users.push(newUser);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));

    // Auto login after registration
    return this.login(cleanEmail, password, true);
  }

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export const auth = new AuthManager();
