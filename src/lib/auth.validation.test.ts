import { describe, expect, it } from 'vitest';

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
