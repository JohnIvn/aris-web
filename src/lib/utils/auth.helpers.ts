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
