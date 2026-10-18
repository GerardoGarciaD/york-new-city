import { useCallback, useState } from "react";
import { PASSWORD_HASH, SESSION_STORAGE_KEY } from "../config/auth";
import { PLAYER_KEYS } from "../config/people";
import { sha256Hex } from "../utils/hash";
import { readStorage, removeStorage, writeStorage } from "../utils/safeStorage";

function readSavedPlayer() {
  const savedPlayer = readStorage(SESSION_STORAGE_KEY);
  return PLAYER_KEYS.includes(savedPlayer) ? savedPlayer : null;
}

/** Who is using the page, remembered in this browser. */
export function useSession() {
  const [currentPlayer, setCurrentPlayer] = useState(readSavedPlayer);

  /** Returns true when the password matches. Does not log in yet, so the gate can animate out first. */
  const checkPassword = useCallback(async (typedPassword) => {
    try {
      const typedHash = await sha256Hex(typedPassword.trim().toLowerCase());
      return typedHash === PASSWORD_HASH;
    } catch {
      return false;
    }
  }, []);

  const logIn = useCallback((playerKey) => {
    writeStorage(SESSION_STORAGE_KEY, playerKey);
    setCurrentPlayer(playerKey);
  }, []);

  const logOut = useCallback(() => {
    removeStorage(SESSION_STORAGE_KEY);
    setCurrentPlayer(null);
  }, []);

  return { currentPlayer, checkPassword, logIn, logOut };
}
