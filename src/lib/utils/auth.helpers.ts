export const AUTH_SESSION_COOKIE = 'aris_auth_session';

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
