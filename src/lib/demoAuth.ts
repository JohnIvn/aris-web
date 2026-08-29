export const DEMO_EMAIL = 'professor@aris.edu.ph';
export const DEMO_PASSWORD = 'Professor123';

export const DEMO_ACCOUNTS = [
  {
    id: 'professor-demo-001',
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    role: 'Professor',
    name: 'Dr. Amelia Torres',
    fullName: 'Dr. Amelia Torres',
    position: 'Professor',
    department: 'Computer Science',
    photoUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'staff-checker-001',
    email: 'checker@aris.edu.ph',
    password: 'Checker123',
    role: 'Checker',
    name: 'Ms. Karen Reyes',
    fullName: 'Ms. Karen Reyes',
    position: 'Checker',
    department: 'Academic Records',
    photoUrl:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'staff-secretary-001',
    email: 'secretary@aris.edu.ph',
    password: 'Secretary123',
    role: 'Secretary',
    name: 'Ms. Grace Navarro',
    fullName: 'Ms. Grace Navarro',
    position: 'Secretary',
    department: 'College Secretariat',
    photoUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'staff-hr-001',
    email: 'hr@aris.edu.ph',
    password: 'HR12345',
    role: 'HR',
    name: 'Ms. Patricia Gomez',
    fullName: 'Ms. Patricia Gomez',
    position: 'Human Resources',
    department: 'Human Resources Office',
    photoUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: 'staff-accounting-001',
    email: 'accounting@aris.edu.ph',
    password: 'Accounting123',
    role: 'Accounting',
    name: 'Mr. Daniel Cruz',
    fullName: 'Mr. Daniel Cruz',
    position: 'Accounting',
    department: 'Finance & Accounting',
    photoUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
  },
] as const;

export const DEMO_USER = DEMO_ACCOUNTS[0];

export function validateLogin(email: string, password: string, role?: 'professor' | 'staff') {
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

  const matchedAccount = DEMO_ACCOUNTS.find(
    (account) => account.email.toLowerCase() === normalizedEmail.toLowerCase(),
  );

  if (!matchedAccount) {
    return role === 'staff'
      ? 'Staff account not found. Try checker@aris.edu.ph or secretary@aris.edu.ph.'
      : 'Professor account not found.';
  }

  if (matchedAccount.password !== trimmedPassword) {
    return 'The password is incorrect for this account.';
  }

  return null;
}

export function isDemoCredentials(email: string, password: string) {
  return DEMO_ACCOUNTS.some(
    (account) =>
      account.email.trim().toLowerCase() === email.trim().toLowerCase() &&
      account.password === password,
  );
}

export function buildGoogleAuthUrl() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return null;
  }

  const redirectUri =
    import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
    `${window.location.origin}/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
