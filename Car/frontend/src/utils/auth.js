import { API_BASE } from '../config';

/**
 * Automatically logs out the specified user type and redirects to login.
 * @param {'admin' | 'user'} type 
 */
export const logout = (type) => {
  if (type === 'admin') {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_data');
    window.location.href = '/admin/login';
  } else {
    localStorage.removeItem('user_access_token');
    localStorage.removeItem('user_refresh_token');
    localStorage.removeItem('user_data');
    window.location.href = '/login';
  }
};

/**
 * Attempts to refresh the access token using the stored refresh token.
 * @param {'admin' | 'user'} type 
 * @returns {Promise<string | null>} The new access token or null if refresh failed
 */
export const refreshAuthToken = async (type) => {
  const refreshKey = type === 'admin' ? 'admin_refresh_token' : 'user_refresh_token';
  const accessKey = type === 'admin' ? 'admin_access_token' : 'user_access_token';
  const refreshToken = localStorage.getItem(refreshKey);

  if (!refreshToken) {
    logout(type);
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/users/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem(accessKey, data.access);
      // Optional: Update refresh token if rotated
      if (data.refresh) {
        localStorage.setItem(refreshKey, data.refresh);
      }
      return data.access;
    } else {
      // Refresh token is likely expired or invalid
      logout(type);
      return null;
    }
  } catch (error) {
    console.error('Network error during token refresh:', error);
    // On network error we dont necessarily logout unless repeating fails
    return null;
  }
};

/**
 * Returns authentication headers for the specified type.
 * @param {'admin' | 'user'} type 
 */
export const getAuthHeaders = (type) => {
  const token = localStorage.getItem(type === 'admin' ? 'admin_access_token' : 'user_access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};
