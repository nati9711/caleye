import { type ReactNode, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface MainLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  /** Compact webcam + coach card shown inline on mobile above dashboard */
  mobileTopCard?: ReactNode;
}

export default function MainLayout({ children, sidebar, mobileTopCard }: MainLayoutProps) {
  const [mobileTab, setMobileTab] = useState<'dash' | 'camera' | 'workout' | 'profile'>('dash');
  const prevTab = useRef(mobileTab);

  // Determine slide direction based on tab order
  const tabOrder = ['dash', 'camera', 'workout', 'profile'] as const;
  const direction = tabOrder.indexOf(mobileTab) >= tabOrder.indexOf(prevTab.current) ? 1 : -1;

  const handleTabChange = (tab: typeof mobileTab) => {
    prevTab.current = mobileTab;
    setMobileTab(tab);
  };

  return (
    <div className="min-h-screen pt-14 sm:pt-16 pb-16 md:pb-0" style={{ background: '#0a0a0f' }}>
      {/* Desktop: grid with main + sidebar */}
      <div className="md:grid md:grid-cols-[1fr_320px] max-w-[1440px] mx-auto">
        {/* Main scrollable area */}
        <main className="p-3 md:p-6 overflow-y-auto">
          {/* Mobile: show webcam card inline above dashboard */}
          {mobileTopCard && mobileTab === 'dash' && (
            <div className="md:hidden mb-3">
              {mobileTopCard}
            </div>
          )}

          {/* Tab content with slide animation */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mobileTab}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              {mobileTab === 'dash' && children}
              {mobileTab === 'camera' && (
                <div className="md:hidden">
                  {sidebar}
                </div>
              )}
              {mobileTab === 'workout' && (
                <div className="md:hidden">
                  <div className="glass-card p-4 text-center">
                    <span className="text-4xl block mb-3">🏋️</span>
                    <p className="text-text-primary font-semibold">אימונים</p>
                    <p className="text-text-secondary text-body-sm mt-1">בקרוב...</p>
                  </div>
                </div>
              )}
              {mobileTab === 'profile' && (
                <div className="md:hidden">
                  <div className="glass-card p-4 text-center">
                    <span className="text-4xl block mb-3">⚙️</span>
                    <p className="text-text-primary font-semibold">הגדרות</p>
                    <p className="text-text-secondary text-body-sm mt-1">בקרוב...</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Sidebar — hidden on mobile, sticky on desktop */}
        {sidebar && (
          <aside className="hidden md:block p-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto border-s border-white/[0.06]">
            {sidebar}
          </aside>
        )}
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 h-14 flex items-center justify-around z-50"
        style={{ background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <TabButton icon="📊" label="דשבורד" active={mobileTab === 'dash'} onClick={() => handleTabChange('dash')} />
        <TabButton icon="📷" label="מצלמה" active={mobileTab === 'camera'} onClick={() => handleTabChange('camera')} />
        <TabButton icon="🏋️" label="אימון" active={mobileTab === 'workout'} onClick={() => handleTabChange('workout')} />
        <TabButton icon="⚙️" label="הגדרות" active={mobileTab === 'profile'} onClick={() => handleTabChange('profile')} />
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
      className={`flex flex-col items-center justify-center gap-[2px] min-w-[44px] min-h-[44px] px-3 py-1 rounded-lg transition-all duration-200
        ${active ? 'text-[#22D97F]' : 'text-gray-500 hover:text-gray-300'}`}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  );
}
