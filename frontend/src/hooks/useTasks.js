import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { taskAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function useTasks() {
  const [allTasks, setAllTasks] = useState([]);   // raw tasks from server
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");    // all | pending | completed
  const [page, setPage] = useState(1);
  const LIMIT = 8;

  const { logout } = useAuth();
  const navigate = useNavigate();

  // ── Auth error handler ─────────────────────────────────────────────────────
  const handleAuthError = useCallback(() => {
    logout();
    toast.error("Session expired. Please log in again.");
    navigate("/login");
  }, [logout, navigate]);

  // ── Fetch ALL tasks once from server ───────────────────────────────────────
  // Search & filter are done client-side so they work instantly without
  // extra API calls. We only re-fetch after mutating operations.
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all tasks for this user (large limit so we get everything)
      const res = await taskAPI.getAll({ limit: 500, page: 1 });
      setAllTasks(res.data.tasks || []);
    } catch (err) {
      if (err.response?.status === 401) {
        handleAuthError();
      } else {
        toast.error("Failed to load tasks. Is the server running?");
      }
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ── Client-side search + filter ────────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    let result = [...allTasks];

    // 1. Filter by status
    if (filter !== "all") {
      result = result.filter((t) => t.status === filter);
    }

    // 2. Search by title or description (case-insensitive, trims whitespace)
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [allTasks, search, filter]);

  // ── Client-side pagination ─────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / LIMIT));

  // If current page is out of range after filter changes, reset to 1
  const safePage = Math.min(page, totalPages);

  const tasks = useMemo(() => {
    const start = (safePage - 1) * LIMIT;
    return filteredTasks.slice(start, start + LIMIT);
  }, [filteredTasks, safePage]);

  // Reset to page 1 whenever search or filter changes
  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const addTask = async (data) => {
    try {
      const res = await taskAPI.create(data);
      setAllTasks((prev) => [res.data.task, ...prev]);
      toast.success(`Task "${res.data.task.title}" created!`);
    } catch (err) {
      if (err.response?.status === 401) { handleAuthError(); return; }
      toast.error(err.response?.data?.message || "Failed to create task.");
    }
  };

  const updateTask = async (id, data) => {
    try {
      const res = await taskAPI.update(id, data);
      setAllTasks((prev) => prev.map((t) => (t._id === id ? res.data.task : t)));
      toast.success(`Task "${res.data.task.title}" updated!`);
    } catch (err) {
      if (err.response?.status === 401) { handleAuthError(); return; }
      toast.error(err.response?.data?.message || "Failed to update task.");
    }
  };

  const deleteTask = async (id) => {
    setAllTasks((prev) => prev.filter((t) => t._id !== id)); // optimistic
    try {
      await taskAPI.delete(id);
      toast.success(`Task "${allTasks.find((t) => t._id === id)?.title}" deleted.`);
    } catch (err) {
      if (err.response?.status === 401) { handleAuthError(); return; }
      fetchTasks(); // revert
      toast.error("Failed to delete task.");
    }
  };

  const toggleTask = async (id) => {
    // Optimistic update
    setAllTasks((prev) =>
      prev.map((t) =>
        t._id === id
          ? { ...t, status: t.status === "pending" ? "completed" : "pending" }
          : t
      )
    );
    try {
      const res = await taskAPI.toggleStatus(id);
      setAllTasks((prev) => prev.map((t) => (t._id === id ? res.data.task : t)));
    } catch (err) {
      if (err.response?.status === 401) { handleAuthError(); return; }
      fetchTasks(); // revert
      toast.error(`Failed to update task "${allTasks.find((t) => t._id === id)?.title}".`);
    }
  };


  const deleteAllTasks = async () => {
  await axios.delete("/api/tasks/all");
  fetchTasks();
};

  return {
    tasks,           // paginated + filtered + searched slice
    allTasks,        // raw full list (used by StatsBar for accurate counts)
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    page: safePage,
    setPage,
    totalPages,
    filteredCount: filteredTasks.length,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
}