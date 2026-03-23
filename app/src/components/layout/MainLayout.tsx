import type { ReactNode } from 'react';

interface MainLayoutProps {
  /** Content for the main scrollable area (dashboard, charts, food log) */
  children: ReactNode;
  /** Content for the sticky sidebar (webcam PiP, coach, workout, badges) */
  sidebar?: ReactNode;
}

/**
 * Main layout component.
 * Desktop (>=768px): 70/30 split grid — main (scrollable) + sidebar (sticky).
 * Mobile (<768px): single column with main content only (sidebar content
 * is accessed via bottom tab bar, handled externally).
 * Uses CSS Grid for the split. Accounts for fixed header (h-16 = 64px).
 */
export default function MainLayout({ children, sidebar }: MainLayoutProps) {
  return (
    <div className="min-h-screen pt-16">
      {/* Desktop: grid with main + sidebar | Mobile: single column */}
      <div className="md:grid md:grid-cols-[1fr_320px] max-w-[1440px] mx-auto">
        {/* Main scrollable area */}
        <main className="p-md md:p-lg overflow-y-auto">
          {children}
        </main>

        {/* Sidebar — hidden on mobile, sticky on desktop */}
        {sidebar && (
          <aside className="hidden md:block p-lg sticky top-16 h-[calc(100vh-64px)] overflow-y-auto border-s border-white/[0.06]">
            {sidebar}
          </aside>
        )}
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 glass-header h-14 flex items-center justify-around px-sm z-50">
        <TabButton icon="📊" label="דש" active />
        <TabButton icon="📋" label="לוג" />
        <TabButton icon="🏋️" label="אימון" />
        <TabButton icon="👤" label="פרופיל" />
      </nav>
    </div>
  );
}

// ─── Internal tab button (mobile bottom bar) ───────────────────────────

interface TabButtonProps {
  icon: string;
  label: string;
  active?: boolean;
}

function TabButton({ icon, label, active = false }: TabButtonProps) {
  return (
    <button
      className={`flex flex-col items-center gap-[2px] px-sm py-xs rounded-btn-sm transition-colors duration-200
        ${active
          ? 'text-accent'
          : 'text-text-tertiary hover:text-text-secondary'
        }`}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  );
}
