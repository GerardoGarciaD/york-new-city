/**
 * localStorage can throw (private mode, blocked storage). These helpers never throw.
 */
export function readStorage(storageKey) {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

export function writeStorage(storageKey, value) {
  try {
    localStorage.setItem(storageKey, value);
  } catch {
    // Storage unavailable: the app keeps working for this visit only.
  }
}

export function removeStorage(storageKey) {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // Nothing to clean up.
  }
}
