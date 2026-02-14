import { persistentAtom } from '@nanostores/persistent';
import { atom, computed } from 'nanostores';

const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';

/**
 * @typedef {Object} User
 * @property {string} email
 * @property {string} name
 * @property {string} picture
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} user
 * @property {string|null} token - JWT token
 */

/** @type {import('nanostores').WritableAtom<AuthState>} */
export const authState = persistentAtom('admin_auth', { user: null, token: null }, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

/** @type {import('nanostores').WritableAtom<boolean>} */
export const isAuthLoading = atom(false);

/** @type {import('nanostores').WritableAtom<string|null>} */
export const authError = atom(null);

export const authUser = computed(authState, (state) => state.user);
export const authToken = computed(authState, (state) => state.token);
export const isAuthenticated = computed(authState, (state) => state.user !== null && state.token !== null);

/**
 * Authenticates with the server using Google credential.
 * @param {string} credential - Google ID token
 * @returns {Promise<boolean>} - True if authentication was successful
 */
export async function authenticateWithGoogle(credential) {
  isAuthLoading.set(true);
  authError.set(null);

  try {
    const response = await fetch(`${API_URL}/api/admin/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credential }),
    });

    const data = await response.json();

    if (!response.ok) {
      authError.set(data.message || 'Error de autenticacion');
      return false;
    }

    authState.set({
      user: data.user,
      token: data.token,
    });

    return true;
  } catch (error) {
    console.error('Authentication error:', error);
    authError.set('Error de conexion con el servidor');
    return false;
  } finally {
    isAuthLoading.set(false);
  }
}

/**
 * Verifies if the current token is still valid.
 * @returns {Promise<boolean>}
 */
export async function verifyToken() {
  const state = authState.get();
  if (!state.token) return false;

  try {
    const response = await fetch(`${API_URL}/api/admin/auth/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${state.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      logout();
      return false;
    }

    return true;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

/**
 * Gets the authorization header for API requests.
 * @returns {Record<string, string>}
 */
export function getAuthHeaders() {
  const state = authState.get();
  if (!state.token) return {};
  return {
    'Authorization': `Bearer ${state.token}`,
  };
}

/**
 * Clears the authenticated user (logout).
 */
export function logout() {
  authState.set({ user: null, token: null });
  authError.set(null);
}

/**
 * Wrapper around fetch that adds auth headers and handles 401 responses.
 * On 401, it logs out the user forcing a re-login.
 * @param {string} url
 * @param {RequestInit} [options]
 * @returns {Promise<Response>}
 */
export async function adminFetch(url, options = {}) {
  const headers = { ...getAuthHeaders(), ...options.headers };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    logout();
    throw new Error('Sesion expirada. Inicia sesion nuevamente.');
  }
  return res;
}

/**
 * Sets the loading state.
 * @param {boolean} loading
 */
export function setAuthLoading(loading) {
  isAuthLoading.set(loading);
}

// Legacy exports for backwards compatibility
export const setUser = (user) => {
  const state = authState.get();
  authState.set({ ...state, user });
};
