import { invoke } from "@tauri-apps/api/core";

export async function persistRefreshToken(
  last_user_key: string,
  user: string,
  token: string,
) {
  await invoke("save_refresh_token", { user, token });
  localStorage.setItem(last_user_key, user);
}

export async function clearPersistedRefreshToken(
  last_user_key: string,
  user: string | null,
) {
  if (user) {
    try {
      await invoke("delete_refresh_token", { user });
    } catch (error) {
      console.error("Failed to delete refresh token:", error);
    }
  }
  localStorage.removeItem(last_user_key);
}
