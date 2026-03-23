import { MOCK_TODAY_LOG, MOCK_PROFILE, MOCK_HOURLY_CALORIES } from '../../store/mockData';
import Header from '../layout/Header';
import MainLayout from '../layout/MainLayout';
import DailySummary from './DailySummary';
import HourlyChart from './HourlyChart';
import FoodLog from './FoodLog';

/**
 * Main dashboard page — composes all dashboard components together.
 * Layout: Header (fixed) → MainLayout (70/30 grid) →
 *   Main area: DailySummary → HourlyChart → FoodLog
 *   Sidebar: placeholder slots for webcam PiP, coach, workout, badges.
 *
 * Uses mock data for initial render. Will be replaced by Zustand store
 * once the state layer is built.
 */
export default function DashboardPage() {
  const todayLog = MOCK_TODAY_LOG;
  const profile = MOCK_PROFILE;
  const hourlyData = MOCK_HOURLY_CALORIES;

  return (
    <>
      {/* Fixed header */}
      <Header
        profile={profile}
        onSettingsClick={() => {
          /* will open settings panel */
        }}
      />

      {/* Main layout with sidebar */}
      <MainLayout
        sidebar={
          <div className="flex flex-col gap-lg">
            {/* Webcam PiP placeholder */}
            <div className="glass-card p-md flex flex-col items-center justify-center h-40">
              <span className="text-3xl mb-sm">👁️</span>
              <span className="text-text-secondary text-body-sm">מצלמה פעילה</span>
              <span className="text-accent text-caption mt-xs">מחפש...</span>
            </div>

            {/* Coach placeholder */}
            <div className="glass-card p-md">
              <div className="flex items-center gap-sm mb-sm">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-xl">🏋️</span>
                </div>
                <div>
                  <span className="text-text-primary font-semibold text-body-sm block">
                    גל — המאמן שלך
                  </span>
                  <span className="text-accent text-caption">מחובר</span>
                </div>
              </div>
              <p className="text-text-secondary text-body-sm leading-relaxed">
                &quot;יום מעולה {profile.name}! המשך ככה, אתה בדרך הנכונה
                ליעד היומי 💪&quot;
              </p>
            </div>

            {/* Workout suggestion placeholder */}
            <div className="glass-card p-md">
              <h4 className="text-body-sm font-semibold text-text-primary mb-sm">
                המלצת אימון
              </h4>
              <div className="flex items-center gap-sm">
                <span className="text-2xl">🏃</span>
                <div>
                  <span className="text-text-primary text-body-sm font-medium block">
                    ריצה קלה
                  </span>
                  <span className="text-text-secondary text-caption">
                    30 דקות — שורף ~250 קק״ל
                  </span>
                </div>
              </div>
            </div>

            {/* Badges placeholder */}
            <div className="glass-card p-md">
              <h4 className="text-body-sm font-semibold text-text-primary mb-sm">
                הישגים
              </h4>
              <div className="flex flex-wrap gap-sm">
                {['👶', '📅', '⚖️'].map((badge, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-accent-warm/10 flex items-center justify-center text-xl glow-gold"
                  >
                    {badge}
                  </div>
                ))}
                {/* Locked badges */}
                {['🐦', '🔥', '🎯'].map((badge, i) => (
                  <div
                    key={`locked-${i}`}
                    className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center text-xl grayscale opacity-30"
                  >
                    {badge}
                  </div>
                ))}
              </div>
              <span className="text-text-tertiary text-caption block mt-sm">
                3 מתוך 15 הישגים
              </span>
            </div>
          </div>
        }
      >
        {/* Main content area */}
        <div className="flex flex-col gap-lg mb-20 md:mb-0">
          {/* Daily summary card */}
          <DailySummary log={todayLog} profile={profile} />

          {/* Hourly calorie chart */}
          <HourlyChart data={hourlyData} />

          {/* Food log */}
          <FoodLog
            entries={todayLog.entries}
            onEditEntry={(entry) => {
              /* will open edit modal */
              console.log('Edit entry:', entry.id);
            }}
          />
        </div>
      </MainLayout>
    </>
  );
}
