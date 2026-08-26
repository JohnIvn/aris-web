let currentToken = "";

export function getAccessToken(): string {
  return currentToken;
}

export function setAccessToken(token: string): void {
  currentToken = token;
}
