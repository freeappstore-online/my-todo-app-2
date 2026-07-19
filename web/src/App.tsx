import { useState, useEffect, useCallback } from "react";
import Shell from "./components/Shell";

type Priority = "low" | "medium" | "high";
type Filter = "all" | "active" | "completed";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  category: string;
  createdAt: number;
}

const STORAGE_KEY = "todoapp_todos";
const CATEGORIES_KEY = "todoapp_categories";

const DEFAULT_CATEGORIES = ["Personal", "Work", "Shopping", "Health"];

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "var(--muted)",
  medium: "#f59e0b",
  high: "#ef4444",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CATEGORIES_KEY) || JSON.stringify(DEFAULT_CATEGORIES));
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [filter, setFilter] = useState<Filter>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [inputText, setInputText] = useState("");
  const [inputPriority, setInputPriority] = useState<Priority>("medium");
  const [inputCategory, setInputCategory] = useState("Personal");
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [activeView, setActiveView] = useState<"tasks" | "categories">("tasks");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  const addTodo = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    const todo: Todo = {
      id: generateId(),
      text,
      completed: false,
      priority: inputPriority,
      category: inputCategory,
      createdAt: Date.now(),
    };
    setTodos((prev) => [todo, ...prev]);
    setInputText("");
  }, [inputText, inputPriority, inputCategory]);

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id: string) => {
    const text = editText.trim();
    if (!text) return;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
    setEditingId(null);
    setEditText("");
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  const addCategory = () => {
    const cat = newCategory.trim();
    if (!cat || categories.includes(cat)) return;
    setCategories((prev) => [...prev, cat]);
    setNewCategory("");
    setShowAddCategory(false);
  };

  const deleteCategory = (cat: string) => {
    setCategories((prev) => prev.filter((c) => c !== cat));
    setTodos((prev) =>
      prev.map((t) => (t.category === cat ? { ...t, category: "Personal" } : t))
    );
    if (selectedCategory === cat) setSelectedCategory("All");
  };

  const filteredTodos = todos.filter((t) => {
    const matchesFilter =
      filter === "all" || (filter === "active" ? !t.completed : t.completed);
    const matchesCategory =
      selectedCategory === "All" || t.category === selectedCategory;
    return matchesFilter && matchesCategory;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  const navItems = [
    {
      id: "tasks",
      label: "Tasks",
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      onClick: () => setActiveView("tasks"),
    },
    {
      id: "categories",
      label: "Categories",
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      onClick: () => setActiveView("categories"),
    },
  ];

  return (
    <Shell
      appName="Todo"
      navItems={navItems}
      activeNavId={activeView}
    >
      {activeView === "tasks" && (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full px-4 py-6">
          {/* Header */}
          <div>
            <h1 className="font-display text-3xl font-bold" style={{ color: "var(--ink)" }}>
              My Tasks
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {activeCount} remaining · {completedCount} done
            </p>
          </div>

          {/* Add Todo */}
          <div
            className="rounded-[1.25rem] p-4 flex flex-col gap-3"
            style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
          >
            <input
              type="text"
              placeholder="What needs to be done?"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              className="w-full bg-transparent outline-none text-base placeholder:opacity-50"
              style={{ color: "var(--ink)" }}
            />
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {/* Priority */}
                <select
                  value={inputPriority}
                  onChange={(e) => setInputPriority(e.target.value as Priority)}
                  className="text-xs px-3 py-1.5 rounded-[0.75rem] outline-none cursor-pointer"
                  style={{
                    background: "var(--paper)",
                    border: "1px solid var(--line)",
                    color: "var(--ink)",
                  }}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
                {/* Category */}
                <select
                  value={inputCategory}
                  onChange={(e) => setInputCategory(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-[0.75rem] outline-none cursor-pointer"
                  style={{
                    background: "var(--paper)",
                    border: "1px solid var(--line)",
                    color: "var(--ink)",
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={addTodo}
                disabled={!inputText.trim()}
                className="px-4 py-1.5 rounded-[0.75rem] text-sm font-semibold transition-opacity disabled:opacity-40"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Add Task
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap items-center">
            {/* Status filter */}
            <div
              className="flex rounded-[0.75rem] overflow-hidden"
              style={{ border: "1px solid var(--line)" }}
            >
              {(["all", "active", "completed"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-1.5 text-xs font-medium capitalize transition-colors"
                  style={{
                    background: filter === f ? "var(--accent)" : "var(--panel)",
                    color: filter === f ? "#fff" : "var(--muted)",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Category filter */}
            <div className="flex gap-1.5 flex-wrap">
              {["All", ...categories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-3 py-1.5 text-xs rounded-[0.75rem] font-medium transition-colors"
                  style={{
                    background: selectedCategory === cat ? "var(--ink)" : "var(--panel)",
                    color: selectedCategory === cat ? "var(--paper)" : "var(--muted)",
                    border: "1px solid var(--line)",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Todo List */}
          <div className="flex flex-col gap-2">
            {filteredTodos.length === 0 ? (
              <div
                className="rounded-[1.25rem] p-10 text-center"
                style={{ border: "1px dashed var(--line)", color: "var(--muted)" }}
              >
                <div className="text-4xl mb-3">✅</div>
                <p className="font-medium">No tasks here!</p>
                <p className="text-sm mt-1 opacity-70">
                  {filter === "completed" ? "Complete some tasks first." : "Add a task above to get started."}
                </p>
              </div>
            ) : (
              filteredTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="rounded-[1.25rem] p-4 flex items-start gap-3 group transition-opacity"
                  style={{
                    background: "var(--panel)",
                    border: "1px solid var(--line)",
                    opacity: todo.completed ? 0.65 : 1,
                  }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors"
                    style={{
                      borderColor: todo.completed ? "var(--accent)" : "var(--line)",
                      background: todo.completed ? "var(--accent)" : "transparent",
                    }}
                  >
                    {todo.completed && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {editingId === todo.id ? (
                      <input
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(todo.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onBlur={() => saveEdit(todo.id)}
                        className="w-full bg-transparent outline-none text-sm font-medium"
                        style={{ color: "var(--ink)" }}
                      />
                    ) : (
                      <p
                        className="text-sm font-medium break-words"
                        style={{
                          color: "var(--ink)",
                          textDecoration: todo.completed ? "line-through" : "none",
                        }}
                      >
                        {todo.text}
                      </p>
                    )}
                    <div className="flex gap-2 mt-1.5 items-center flex-wrap">
                      <span
                        className="text-xs font-medium"
                        style={{ color: PRIORITY_COLORS[todo.priority] }}
                      >
                        ● {PRIORITY_LABELS[todo.priority]}
                      </span>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        {todo.category}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!todo.completed && (
                      <button
                        onClick={() => startEdit(todo)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "var(--muted)" }}
                        title="Edit"
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: "var(--muted)" }}
                      title="Delete"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Clear completed */}
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="text-sm self-center px-4 py-2 rounded-[0.75rem] transition-colors"
              style={{ color: "var(--muted)", border: "1px solid var(--line)" }}
            >
              Clear {completedCount} completed
            </button>
          )}
        </div>
      )}

      {activeView === "categories" && (
        <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full px-4 py-6">
          <div>
            <h1 className="font-display text-3xl font-bold" style={{ color: "var(--ink)" }}>
              Categories
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Organise your tasks into groups
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {categories.map((cat) => {
              const count = todos.filter((t) => t.category === cat).length;
              const done = todos.filter((t) => t.category === cat && t.completed).length;
              return (
                <div
                  key={cat}
                  className="rounded-[1.25rem] p-4 flex items-center justify-between group"
                  style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
                >
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "var(--ink)" }}>{cat}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                      {count} task{count !== 1 ? "s" : ""} · {done} done
                    </p>
                  </div>
                  {!DEFAULT_CATEGORIES.includes(cat) && (
                    <button
                      onClick={() => deleteCategory(cat)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-opacity"
                      style={{ color: "#ef4444" }}
                      title="Delete category"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {showAddCategory ? (
            <div
              className="rounded-[1.25rem] p-4 flex gap-2"
              style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
            >
              <input
                autoFocus
                type="text"
                placeholder="Category name..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCategory();
                  if (e.key === "Escape") setShowAddCategory(false);
                }}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: "var(--ink)" }}
              />
              <button
                onClick={addCategory}
                className="px-3 py-1 rounded-[0.75rem] text-sm font-semibold"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Add
              </button>
              <button
                onClick={() => setShowAddCategory(false)}
                className="px-3 py-1 rounded-[0.75rem] text-sm"
                style={{ color: "var(--muted)", border: "1px solid var(--line)" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddCategory(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-[1.25rem] text-sm font-medium transition-colors self-start"
              style={{ border: "1.5px dashed var(--line)", color: "var(--muted)" }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Category
            </button>
          )}
        </div>
      )}
    </Shell>
  );
}
