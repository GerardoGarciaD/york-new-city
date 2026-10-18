import { useCallback, useRef, useState } from "react";
import { SESSION_STORAGE_KEY } from "../config/auth";
import { PLAYER_KEYS } from "../config/people";
import { apiRequest, UnauthorizedError } from "../services/api";
import { readStorage, removeStorage, writeStorage } from "../utils/safeStorage";

function readSavedSession() {
  try {
    const savedSession = JSON.parse(readStorage(SESSION_STORAGE_KEY));
    return PLAYER_KEYS.includes(savedSession?.player) && savedSession.token ? savedSession : null;
  } catch {
    return null;
  }
}

/** Who is using the page, plus the token the API asked for. Remembered in this browser. */
export function useSession() {
  const [session, setSession] = useState(readSavedSession);
  const pendingTokenRef = useRef(null);

  /**
   * Asks the server if the password is right. Returns true or false; throws if the server can't be reached.
   * Does not log in yet, so the gate can animate out first.
   */
  const checkPassword = useCallback(async (typedPassword, playerKey) => {
    try {
      const { token } = await apiRequest("/login", { method: "POST", body: { player: playerKey, password: typedPassword } });
      pendingTokenRef.current = token;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedError) return false;
      throw error;
    }
  }, []);

  const logIn = useCallback((playerKey) => {
    const newSession = { player: playerKey, token: pendingTokenRef.current };
    pendingTokenRef.current = null;
    writeStorage(SESSION_STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }, []);

  const logOut = useCallback(() => {
    removeStorage(SESSION_STORAGE_KEY);
    setSession(null);
  }, []);

  return { currentPlayer: session?.player ?? null, token: session?.token ?? null, checkPassword, logIn, logOut };
}
