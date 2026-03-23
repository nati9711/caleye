import { type ReactNode, useState } from 'react';

interface MainLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
}

export default function MainLayout({ children, sidebar }: MainLayoutProps) {
  const [mobileTab, setMobileTab] = useState<'dash' | 'camera' | 'workout' | 'profile'>('dash');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  return (
    <div className="min-h-screen pt-16" style={{ background: '#0a0a0f' }}>
      {/* Desktop: grid with main + sidebar */}
      <div className="md:grid md:grid-cols-[1fr_320px] max-w-[1440px] mx-auto">
        {/* Main scrollable area */}
        <main className="p-4 md:p-6 overflow-y-auto">
          {children}
        </main>

        {/* Sidebar — hidden on mobile, sticky on desktop */}
        {sidebar && (
          <aside className="hidden md:block p-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto border-s border-white/[0.06]">
            {sidebar}
          </aside>
        )}
      </div>

      {/* Mobile: sidebar as bottom sheet */}
      {sidebar && showMobileSidebar && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setShowMobileSidebar(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="absolute bottom-14 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl p-4"
            style={{ background: '#111827', borderTop: '1px solid rgba(57,255,20,0.15)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-gray-600 mx-auto mb-4" />
            {sidebar}
          </div>
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 h-14 flex items-center justify-around z-50"
        style={{ background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <TabButton icon="📊" label="דשבורד" active={mobileTab === 'dash' && !showMobileSidebar} onClick={() => { setMobileTab('dash'); setShowMobileSidebar(false); }} />
        <TabButton icon="📷" label="מצלמה" active={showMobileSidebar && mobileTab === 'camera'} onClick={() => { setMobileTab('camera'); setShowMobileSidebar(true); }} />
        <TabButton icon="🏋️" label="אימון" active={showMobileSidebar && mobileTab === 'workout'} onClick={() => { setMobileTab('workout'); setShowMobileSidebar(true); }} />
        <TabButton icon="⚙️" label="הגדרות" active={mobileTab === 'profile'} onClick={() => { setMobileTab('profile'); setShowMobileSidebar(!showMobileSidebar); }} />
      </nav>
    </div>
  );
}

interface TabButtonProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function TabButton({ icon, label, active = false, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-[2px] px-3 py-1 rounded-lg transition-colors duration-200
        ${active ? 'text-[#22D97F]' : 'text-gray-500 hover:text-gray-300'}`}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  );
}
