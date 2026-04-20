const STORAGE_KEY = "atm-trainer-session";

export function useProgression() {
  function loadUser() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function saveUser(user) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  function recordSession(success) {
    const user = loadUser();
    if (!user) return;
    user.sessions.push({ date: new Date().toISOString(), success });
    if (success) {
      user.streak++;
      if (user.streak > user.bestStreak) user.bestStreak = user.streak;
      if (user.streak === user.objectif) {
        window.dispatchEvent(new CustomEvent("atm-objectif-atteint"));
      }
    } else {
      user.streak = 0;
    }
    saveUser(user);
  }

  function getStats() {
    const user = loadUser();
    if (!user) return { total: 0, successes: 0, failures: 0, currentStreak: 0, bestStreak: 0, objectif: 5 };
    const sessions = user.sessions;
    const total = sessions.length;
    const successes = sessions.filter((s) => s.success).length;
    return {
      total,
      successes,
      failures: total - successes,
      currentStreak: user.streak,
      bestStreak: user.bestStreak,
      objectif: user.objectif,
    };
  }

  function generatePin() {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join("");
  }

  return { loadUser, saveUser, recordSession, getStats, generatePin };
}
