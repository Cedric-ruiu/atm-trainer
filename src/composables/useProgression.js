const STORAGE_KEY = "atm-trainer-users";

export function useProgression() {
  function loadUsers() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveUser(user) {
    const users = loadUsers();
    const index = users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  function recordSession(userId, success) {
    const users = loadUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    user.sessions.push({ date: new Date().toISOString(), success });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  function getStats(userId) {
    const users = loadUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return { total: 0, successes: 0, failures: 0, currentStreak: 0 };

    const sessions = user.sessions;
    const total = sessions.length;
    const successes = sessions.filter((s) => s.success).length;
    const failures = total - successes;

    let currentStreak = 0;
    for (let i = sessions.length - 1; i >= 0; i--) {
      if (sessions[i].success) {
        currentStreak++;
      } else {
        break;
      }
    }

    return { total, successes, failures, currentStreak };
  }

  function generatePin() {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join(
      "",
    );
  }

  return {
    loadUsers,
    saveUser,
    recordSession,
    getStats,
    generatePin,
  };
}
