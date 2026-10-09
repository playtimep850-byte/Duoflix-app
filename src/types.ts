export type SubLessonType = 'video' | 'reading' | 'grammar' | 'pronunciation';

export interface SubLesson {
  id: string;
  title: string;
  type: SubLessonType;
  duration: string;
  description: string;
  youtubeId?: string;
}

export interface Unit {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  subLessons: SubLesson[];
}

export interface VoiceProfile {
  lang: string;
  gender: 'female' | 'male';
  rate: number;
  pitch: number;
  volume: number;
}

export interface Tutor {
  id: string;
  name: string;
  role: string;
  accent: string;
  bio: string;
  avatarGradient: string;
  initial: string;
  topics: string[];
  online: boolean;
  voice: VoiceProfile;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizSet {
  id: string;
  title: string;
  description: string;
  level: string;
  questions: QuizQuestion[];
}

export interface VideoItem {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
  description: string;
  level: string;
  youtubeId?: string;
}

export interface PodcastItem {
  id: string;
  title: string;
  host: string;
  duration: string;
  topic: string;
  description: string;
}

export type TabKey = 'learn' | 'quizzes' | 'videos' | 'podcasts' | 'tutor';
