import type { Unit, SubLessonType } from '@/types';

import type { VoiceProfile } from '@/types';

export const DEFAULT_LESSON_VOICE: VoiceProfile = {
  lang: 'en-US',
  gender: 'female',
  rate: 0.95,
  pitch: 1.05,
  volume: 1,
};

const SUB_LESSON_TEMPLATES: { type: SubLessonType; title: string; duration: string; desc: string }[] = [
  { type: 'video', title: 'Intro Video', duration: '4 min', desc: 'Watch a guided intro to the unit topic with live captions.' },
  { type: 'reading', title: 'Reading Exercise', duration: '6 min', desc: 'Read a short passage and answer comprehension questions.' },
  { type: 'grammar', title: 'Grammar Builder', duration: '5 min', desc: 'Learn the core grammar rule with examples and practice.' },
  { type: 'pronunciation', title: 'Pronunciation Practice', duration: '7 min', desc: 'Speak aloud and get instant feedback on your pronunciation.' },
];

const UNIT_DATA: { title: string; subtitle: string; icon: string }[] = [
  { title: 'First Words', subtitle: 'Greetings & self-introduction', icon: '👋' },
  { title: 'Daily Routines', subtitle: 'Talking about your day', icon: '☀️' },
  { title: 'At the Cafe', subtitle: 'Ordering food & drinks', icon: '☕' },
  { title: 'Getting Around', subtitle: 'Directions & transport', icon: '🧭' },
  { title: 'Family Ties', subtitle: 'Describing relationships', icon: '👨‍👩‍👧' },
  { title: 'Shopping Spree', subtitle: 'Prices & negotiations', icon: '🛍️' },
  { title: 'Work & Office', subtitle: 'Professional conversations', icon: '💼' },
  { title: 'Health & Body', subtitle: 'Doctor visits & symptoms', icon: '🩺' },
  { title: 'Weather Talk', subtitle: 'Seasons & forecasts', icon: '🌤️' },
  { title: 'Hobbies & Fun', subtitle: 'Discussing interests', icon: '🎨' },
  { title: 'On the Phone', subtitle: 'Telephone etiquette', icon: '📞' },
  { title: 'At the Airport', subtitle: 'Travel & check-in', icon: '✈️' },
  { title: 'Dining Out', subtitle: 'Restaurant conversations', icon: '🍽️' },
  { title: 'Making Plans', subtitle: 'Future tense in action', icon: '📅' },
  { title: 'Past Stories', subtitle: 'Narrating experiences', icon: '📖' },
  { title: 'Asking Questions', subtitle: 'Wh-words & intonation', icon: '❓' },
  { title: 'Expressing Opinions', subtitle: 'Agreeing & disagreeing', icon: '💬' },
  { title: 'Feelings & Emotions', subtitle: 'Describing moods', icon: '😊' },
  { title: 'At the Hotel', subtitle: 'Booking & complaints', icon: '🏨' },
  { title: 'Money Matters', subtitle: 'Banking & budgeting', icon: '💳' },
  { title: 'Technology Talk', subtitle: 'Apps, gadgets & internet', icon: '📱' },
  { title: 'Education & Learning', subtitle: 'School & studying', icon: '🎓' },
  { title: 'Sports & Fitness', subtitle: 'Games & exercise', icon: '⚽' },
  { title: 'Music & Movies', subtitle: 'Entertainment chatter', icon: '🎬' },
  { title: 'Festivals & Culture', subtitle: 'Celebrations worldwide', icon: '🎉' },
  { title: 'Environment & Nature', subtitle: 'Climate & wildlife', icon: '🌍' },
  { title: 'Job Interviews', subtitle: 'Interview skills', icon: '🤝' },
  { title: 'Networking Events', subtitle: 'Small talk mastery', icon: '联谊' },
  { title: 'Debating Skills', subtitle: 'Structured arguments', icon: '⚖️' },
  { title: 'Storytelling', subtitle: 'Engaging narratives', icon: '📜' },
  { title: 'Public Speaking', subtitle: 'Speeches & presentations', icon: '🎤' },
  { title: 'Idioms & Phrases', subtitle: 'Natural expressions', icon: '🧩' },
  { title: 'Phrasal Verbs', subtitle: 'Everyday verb combos', icon: '🔗' },
  { title: 'Conditionals', subtitle: 'If-then scenarios', icon: '🔀' },
  { title: 'Reported Speech', subtitle: 'Indirect statements', icon: '🔁' },
  { title: 'Passive Voice', subtitle: 'Shifting focus', icon: '🔇' },
  { title: 'Advanced Vocabulary', subtitle: 'Power words', icon: '📚' },
  { title: 'Business English', subtitle: 'Meetings & emails', icon: '📊' },
  { title: 'Customer Service', subtitle: 'Handling complaints', icon: '🎧' },
  { title: 'Negotiation', subtitle: 'Persuasive language', icon: '🤝' },
  { title: 'Cultural Nuances', subtitle: 'Politeness & tone', icon: '🎭' },
  { title: 'Slang & Colloquial', subtitle: 'Street-smart English', icon: '😎' },
  { title: 'Humor & Wit', subtitle: 'Jokes & wordplay', icon: '😄' },
  { title: 'Accent Training', subtitle: 'Clarity & rhythm', icon: '🎯' },
  { title: 'Fluency Drills', subtitle: 'Speed & smoothness', icon: '⚡' },
  { title: 'Complex Discussions', subtitle: 'Abstract topics', icon: '🧠' },
  { title: 'Presentation Skills', subtitle: 'Slide talks & demos', icon: '📽️' },
  { title: 'Leadership Language', subtitle: 'Inspiring others', icon: '👑' },
  { title: 'Master Conversation', subtitle: 'Any topic, any time', icon: '🏆' },
  { title: 'Fluency Mastery', subtitle: 'Think in English', icon: '💎' },
];

const UNIT_VIDEO_IDS: string[] = [
  'UnEmEbWytI8', 'RI_rRwRefHo', 'tw25CM1MXlU', 'B0NR8O2V0lU', 'hDw5iYnBSbE',
  '7oOX48NOyTQ', 'UnEmEbWytI8', 'RI_rRwRefHo', 'tw25CM1MXlU', 'B0NR8O2V0lU',
  'hDw5iYnBSbE', '7oOX48NOyTQ', 'UnEmEbWytI8', 'RI_rRwRefHo', 'tw25CM1MXlU',
  'B0NR8O2V0lU', 'hDw5iYnBSbE', '7oOX48NOyTQ', 'UnEmEbWytI8', 'RI_rRwRefHo',
  'tw25CM1MXlU', 'B0NR8O2V0lU', 'hDw5iYnBSbE', '7oOX48NOyTQ', 'UnEmEbWytI8',
  'RI_rRwRefHo', 'tw25CM1MXlU', 'B0NR8O2V0lU', 'hDw5iYnBSbE', '7oOX48NOyTQ',
  'UnEmEbWytI8', 'RI_rRwRefHo', 'tw25CM1MXlU', 'B0NR8O2V0lU', 'hDw5iYnBSbE',
  '7oOX48NOyTQ', 'UnEmEbWytI8', 'RI_rRwRefHo', 'tw25CM1MXlU', 'B0NR8O2V0lU',
  'hDw5iYnBSbE', '7oOX48NOyTQ', 'UnEmEbWytI8', 'RI_rRwRefHo', 'tw25CM1MXlU',
  'B0NR8O2V0lU', 'hDw5iYnBSbE', '7oOX48NOyTQ', 'UnEmEbWytI8', 'RI_rRwRefHo',
];

export const UNITS: Unit[] = UNIT_DATA.map((u, i) => {
  const unitNum = i + 1;
  const subCount = i % 2 === 0 ? 4 : 3;
  const subs = SUB_LESSON_TEMPLATES.slice(0, subCount);
  return {
    id: unitNum,
    title: `Unit ${unitNum}: ${u.title}`,
    subtitle: u.subtitle,
    icon: u.icon,
    subLessons: subs.map((s, si) => ({
      id: `u${unitNum}-s${si + 1}`,
      title: s.title,
      type: s.type,
      duration: s.duration,
      description: s.desc,
      youtubeId: s.type === 'video' ? UNIT_VIDEO_IDS[i] : undefined,
    })),
  };
});
