import type { ReactNode } from "react";

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

interface ShellProps {
  children: ReactNode;
  appName?: string;
  navItems?: NavItem[];
  activeNavId?: string;
}

export default function Shell({ children, appName = "App", navItems = [], activeNavId }: ShellProps) {
  return (
    <>
      {/* Desktop layout */}
      <div className="hidden md:flex h-screen" style={{ background: "var(--paper)" }}>
        <aside
          className="flex flex-col border-r h-full shrink-0"
          style={{ width: "17rem", borderColor: "var(--line)", background: "var(--panel)" }}
        >
          <div className="p-6">
            <span
              className="font-bold text-xl"
              style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}
            >
              {appName}
            </span>
          </div>
          <nav className="flex-1 px-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[0.75rem] text-sm font-medium w-full text-left transition-colors"
                style={{
                  background: activeNavId === item.id ? "var(--accent)" : "transparent",
                  color: activeNavId === item.id ? "#fff" : "var(--muted)",
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 text-xs" style={{ color: "var(--muted)" }}>
            <a
              href="https://freeappstore.online"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--muted)" }}
            >
              Part of FreeAppStore — free forever
            </a>
          </div>
        </aside>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Mobile layout */}
      <div className="flex flex-col h-screen md:hidden" style={{ background: "var(--paper)" }}>
        <header
          className="flex items-center px-4 h-14 border-b shrink-0"
          style={{ borderColor: "var(--line)", background: "var(--panel)" }}
        >
          <span
            className="font-bold text-lg"
            style={{ fontFamily: "Fraunces, serif", color: "var(--ink)" }}
          >
            {appName}
          </span>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
        {navItems.length > 0 && (
          <nav
            className="flex items-center justify-around h-16 border-t shrink-0"
            style={{ borderColor: "var(--line)", background: "var(--dock)" }}
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.onClick}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-[0.75rem] transition-colors"
                style={{
                  color: activeNavId === item.id ? "var(--accent)" : "var(--muted)",
                }}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
