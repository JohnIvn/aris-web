export const AUTH_SESSION_COOKIE = 'aris_auth_session';
export const AUTH_STATE_CHANGE_KEY = 'aris_auth_state_change';

export type AuthStateChangeType = 'signed-in' | 'signed-out';

export function notifyAuthStateChange(type: AuthStateChangeType, user?: { email?: string | null; role?: string | null }) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const payload = JSON.stringify({
    type,
    email: user?.email ?? null,
    role: user?.role ?? null,
    timestamp: Date.now(),
  });

  localStorage.setItem(AUTH_STATE_CHANGE_KEY, payload);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('aris-auth-state-change', { detail: { type, email: user?.email ?? null, role: user?.role ?? null } }));
  }
}

export async function persistRefreshToken(
  lastUserKey: string,
  user: string,
  token: string,
) {
  localStorage.setItem(`auth:refresh-token:${user}`, token);
  localStorage.setItem(lastUserKey, user);
}

export async function clearPersistedRefreshToken(
  lastUserKey: string,
  user: string | null,
) {
  if (user) {
    localStorage.removeItem(`auth:refresh-token:${user}`);
  }
  localStorage.removeItem(lastUserKey);
}

export function getPersistedRefreshToken(user: string): string | null {
  return localStorage.getItem(`auth:refresh-token:${user}`);
}

export function setSessionCookie(user: { email: string; role?: string | null }) {
  if (typeof document === 'undefined') {
    return;
  }

  const payload = JSON.stringify({
    email: user.email,
    role: user.role ?? null,
  });

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${AUTH_SESSION_COOKIE}=${encodeURIComponent(payload)}; path=/; expires=${expires}; SameSite=Lax`;
}

export function getSessionCookie(): { email: string; role?: string | null } | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split('; ').reduce<Record<string, string>>((acc, cookie) => {
    const [name, ...rest] = cookie.split('=');
    if (name && rest.length) {
      acc[name] = rest.join('=');
    }
    return acc;
  }, {});

  const rawValue = cookies[AUTH_SESSION_COOKIE];
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(rawValue)) as { email: string; role?: string | null };
  } catch {
    return null;
  }
}

export function clearSessionCookie() {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${AUTH_SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function getDashboardRouteForUser(user?: { role?: string | null }) {
  if (!user?.role) {
    return '/';
  }

  return user.role.toLowerCase().includes('professor') ? '/user/dashboard' : '/staff';
}

export function hasActiveSession() {
  if (typeof document === 'undefined') {
    return false;
  }

  const session = getSessionCookie();
  if (session?.email) {
    return true;
  }

  if (typeof localStorage === 'undefined') {
    return false;
  }

  const rawState = localStorage.getItem(AUTH_STATE_CHANGE_KEY);
  if (!rawState) {
    return false;
  }

  try {
    const parsed = JSON.parse(rawState) as { type?: string; email?: string | null };
    return parsed.type === 'signed-in' && !!parsed.email;
  } catch {
    return false;
  }
}
