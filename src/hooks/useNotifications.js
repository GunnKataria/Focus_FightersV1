import { useState, useCallback } from "react";

export function useNotifications() {
  const [notifs, setNotifs] = useState([]);

  const push = useCallback((msg, type = "info") => {
    const id = Date.now() + Math.random();
    setNotifs((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setNotifs((prev) => prev.filter((n) => n.id !== id)), 3200);
  }, []);

  return { notifs, push };
}