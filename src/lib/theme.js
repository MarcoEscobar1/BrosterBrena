export const THEME_STORAGE_KEY = 'brena_theme'

export function resolveTheme(preference, prefersDark = false) {
  return preference === 'light' || preference === 'dark'
    ? preference
    : prefersDark ? 'dark' : 'light'
}

export function readThemePreference() {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}
