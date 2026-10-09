import { useState } from 'react';
import type { TabKey } from '@/types';
import { BottomNav } from '@/components/BottomNav';
import { PremiumModal } from '@/components/PremiumModal';
import { LearnScreen } from '@/screens/LearnScreen';
import { QuizzesScreen } from '@/screens/QuizzesScreen';
import { VideosScreen } from '@/screens/VideosScreen';
import { PodcastsScreen } from '@/screens/PodcastsScreen';
import { TutorScreen } from '@/screens/TutorScreen';

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('learn');
  const [showPremium, setShowPremium] = useState(false);

  return (
    <div className="min-h-screen bg-ink-900 max-w-md mx-auto relative">
      {activeTab === 'learn' && <LearnScreen onPremiumClick={() => setShowPremium(true)} />}
      {activeTab === 'quizzes' && <QuizzesScreen />}
      {activeTab === 'videos' && <VideosScreen />}
      {activeTab === 'podcasts' && <PodcastsScreen />}
      {activeTab === 'tutor' && <TutorScreen onPremiumClick={() => setShowPremium(true)} />}

      <BottomNav active={activeTab} onChange={setActiveTab} />

      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}
    </div>
  );
}

export default App;
