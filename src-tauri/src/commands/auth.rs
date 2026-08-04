use keyring::{Entry};

const SERVICE: &str = "aris";

#[tauri::command]
pub async fn save_refresh_token(user: String, token: String) -> Result<(), String> {


    let entry = Entry::new(SERVICE, &user)
        .map_err(|e| e.to_string())?;

    entry
        .set_password(&token)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_refresh_token(user: String) -> Result<Option<String>, String> {
    let entry = Entry::new(SERVICE, &user)
        .map_err(|e| e.to_string())?;

    match entry.get_password() {
        Ok(token) => Ok(Some(token)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}
#[tauri::command]
pub async fn delete_refresh_token(user: String) -> Result<(), String> {
    let entry = Entry::new(SERVICE, &user)
        .map_err(|e| e.to_string())?;

    match entry.delete_credential() {
        Ok(_) | Err(keyring::Error::NoEntry) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}