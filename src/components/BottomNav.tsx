import { GraduationCap, Brain, Video, Headphones, MessageCircle } from 'lucide-react';
import type { TabKey } from '@/types';

interface BottomNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const TABS: { key: TabKey; label: string; icon: typeof GraduationCap }[] = [
  { key: 'learn', label: 'Learn', icon: GraduationCap },
  { key: 'quizzes', label: 'Quizzes', icon: Brain },
  { key: 'videos', label: 'Videos', icon: Video },
  { key: 'podcasts', label: 'Podcasts', icon: Headphones },
  { key: 'tutor', label: 'AI Tutor', icon: MessageCircle },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="glass border-t border-ink-600/50 px-2 pt-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onChange(tab.key)}
                className="flex flex-col items-center gap-1 px-2 py-1.5 relative group"
              >
                <div
                  className={`relative flex items-center justify-center transition-all ${
                    isActive ? 'w-12 h-8 rounded-full gold-gradient' : 'w-8 h-8'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-ink-900' : 'text-gray-500 group-hover:text-gray-400'
                    }`}
                  />
                </div>
                <span
                  className={`text-[10px] font-semibold transition-colors ${
                    isActive ? 'text-gold-400' : 'text-gray-600'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
