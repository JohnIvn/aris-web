import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearSessionCookie,
  getDashboardRouteForUser,
  getSessionCookie,
  hasActiveSession,
  notifyAuthStateChange,
  setSessionCookie,
} from './utils/auth.helpers';

const installCookieStub = () => {
  let cookieJar: Record<string, string> = {};
  let storage: Record<string, string> = {};

  const listeners: Record<string, Set<(event: Event) => void>> = {};

  const documentStub = {
    get cookie() {
      return Object.entries(cookieJar)
        .map(([name, value]) => `${name}=${value}`)
        .join('; ');
    },
    set cookie(value: string) {
      const [rawPair, ...rest] = value.split(';');
      const [name, ...nameParts] = rawPair.split('=');
      const cookieValue = nameParts.join('=');

      if (!name) {
        return;
      }

      if (rest.some((part) => part.trim().toLowerCase().startsWith('expires='))) {
        const expiresPart = rest.find((part) => part.trim().toLowerCase().startsWith('expires='));
        const expires = expiresPart?.split('=')[1];
        if (expires && new Date(expires).getTime() <= Date.now()) {
          delete cookieJar[name];
          return;
        }
      }

      if (cookieValue === '') {
        delete cookieJar[name];
        return;
      }

      cookieJar[name] = cookieValue;
    },
  };

  const localStorageStub = {
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(storage, key) ? storage[key] : null;
    },
    setItem(key: string, value: string) {
      storage[key] = String(value);
      for (const listener of listeners['storage'] ?? []) {
        listener(new StorageEvent('storage', { key, newValue: String(value) }));
      }
    },
    removeItem(key: string) {
      delete storage[key];
      for (const listener of listeners['storage'] ?? []) {
        listener(new StorageEvent('storage', { key, newValue: null }));
      }
    },
    clear() {
      storage = {};
      for (const listener of listeners['storage'] ?? []) {
        listener(new StorageEvent('storage', { key: null, newValue: null }));
      }
    },
  };

  const windowStub = {
    addEventListener(type: string, listener: (event: Event) => void) {
      if (!listeners[type]) {
        listeners[type] = new Set();
      }
      listeners[type].add(listener);
    },
    removeEventListener(type: string, listener: (event: Event) => void) {
      listeners[type]?.delete(listener);
    },
    dispatchEvent(event: Event) {
      for (const listener of listeners[event.type] ?? []) {
        listener(event);
      }
      return true;
    },
  };

  Object.defineProperty(globalThis, 'document', {
    value: documentStub,
    configurable: true,
    writable: true,
  });

  Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageStub,
    configurable: true,
    writable: true,
  });

  Object.defineProperty(globalThis, 'window', {
    value: windowStub,
    configurable: true,
    writable: true,
  });

  return () => {
    cookieJar = {};
    storage = {};
    for (const key of Object.keys(listeners)) {
      listeners[key].clear();
    }
  };
};

const resetCookieStub = installCookieStub();

const DEMO_EMAIL = 'rafhaelmaglunob@gmail.com';
const DEMO_PASSWORD = 'Aris#123';

export function validateLogin(email: string, password: string) {
  const normalizedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!normalizedEmail) {
    return 'Please enter your email address.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return 'Enter a valid email address.';
  }

  if (!trimmedPassword) {
    return 'Please enter your password.';
  }

  if (trimmedPassword.length < 8) {
    return 'Password must be at least 8 characters long.';
  }

  if (normalizedEmail.toLowerCase() === DEMO_EMAIL.toLowerCase() && trimmedPassword !== DEMO_PASSWORD) {
    return 'The password is incorrect for this test account.';
  }

  return null;
}

describe('login validation', () => {
  it('blocks empty email', () => {
    expect(validateLogin('', 'Aris#123')).toBe('Please enter your email address.');
  });

  it('blocks invalid email format', () => {
    expect(validateLogin('rafhael', 'Aris#123')).toBe('Enter a valid email address.');
  });

  it('blocks empty password', () => {
    expect(validateLogin('rafhaelmaglunob@gmail.com', '')).toBe('Please enter your password.');
  });

  it('allows the demo account', () => {
    expect(validateLogin(DEMO_EMAIL, DEMO_PASSWORD)).toBeNull();
  });

  it('rejects the wrong password for the demo account', () => {
    expect(validateLogin(DEMO_EMAIL, 'WrongPass1')).toBe('The password is incorrect for this test account.');
  });
});

describe('session cache', () => {
  beforeEach(() => {
    resetCookieStub();
    clearSessionCookie();
    globalThis.localStorage.clear();
  });

  it('routes professor users to the professor dashboard and staff users to staff dashboard', () => {
    expect(getDashboardRouteForUser({ role: 'Professor' } as any)).toBe('/user/dashboard');
    expect(getDashboardRouteForUser({ role: 'Checker' } as any)).toBe('/staff');
  });

  it('persists and reads a login session cookie', () => {
    setSessionCookie({ email: 'professor@aris.edu.ph', role: 'Professor' });

    expect(getSessionCookie()).toMatchObject({
      email: 'professor@aris.edu.ph',
      role: 'Professor',
    });

    clearSessionCookie();
    expect(getSessionCookie()).toBeNull();
  });

  it('detects active sessions across open auth tabs', () => {
    expect(hasActiveSession()).toBe(false);

    setSessionCookie({ email: 'checker@aris.edu.ph', role: 'Checker' });

    expect(hasActiveSession()).toBe(true);

    clearSessionCookie();
    expect(hasActiveSession()).toBe(false);
  });

  it('notifies other tabs when the auth state changes', () => {
    const listener = vi.fn();
    window.addEventListener('aris-auth-state-change', listener);

    notifyAuthStateChange('signed-out');

    expect(listener).toHaveBeenCalled();
    expect(globalThis.localStorage.getItem('aris_auth_state_change')).toContain('signed-out');

    window.removeEventListener('aris-auth-state-change', listener);
  });
});
