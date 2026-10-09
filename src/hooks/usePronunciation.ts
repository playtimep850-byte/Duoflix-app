import { useState, useCallback } from 'react';

export interface WordFeedback {
  word: string;
  correct: boolean;
  score: number;
}

export interface PronunciationResult {
  overallScore: number;
  words: WordFeedback[];
  feedback: string;
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function similarityScore(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;
  const dist = levenshtein(a.toLowerCase(), b.toLowerCase());
  return Math.max(0, Math.round((1 - dist / maxLen) * 100));
}

const POSITIVE_FEEDBACK = [
  'Excellent pronunciation! You sound like a native speaker.',
  'Great job! Your clarity and rhythm are impressive.',
  'Well done! Keep up this level of confidence.',
  'Fantastic! Your pronunciation is right on target.',
];

const GOOD_FEEDBACK = [
  'Good effort! A few words need slight refinement.',
  'Nice work! Try slowing down on the trickier words.',
  'Solid attempt! Focus on the highlighted words.',
  'Good progress! Practice the marked words a few more times.',
];

const NEEDS_WORK_FEEDBACK = [
  'Keep practicing! Try saying each word slowly.',
  'You are getting there! Focus on clarity over speed.',
  'Good try! Listen to the audio again and repeat carefully.',
  'Don\'t give up! Every attempt brings you closer to fluency.',
];

export function usePronunciation() {
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = useCallback((spokenText: string, targetText: string) => {
    setIsAnalyzing(true);

    setTimeout(() => {
      const targetWords = targetText.replace(/[""''.,!?]/g, '').split(/\s+/).filter((w) => w.length > 0);
      const spokenWords = spokenText.replace(/[""''.,!?]/g, '').split(/\s+/).filter((w) => w.length > 0);

      const wordFeedback: WordFeedback[] = targetWords.map((target, i) => {
        const spoken = spokenWords[i] || '';
        const score = spoken ? similarityScore(spoken, target) : 0;
        return {
          word: target,
          correct: score >= 70,
          score,
        };
      });

      const overallScore = Math.round(
        wordFeedback.reduce((sum, w) => sum + w.score, 0) / Math.max(1, wordFeedback.length),
      );

      let feedback: string;
      if (overallScore >= 85) {
        feedback = POSITIVE_FEEDBACK[Math.floor(Math.random() * POSITIVE_FEEDBACK.length)];
      } else if (overallScore >= 60) {
        feedback = GOOD_FEEDBACK[Math.floor(Math.random() * GOOD_FEEDBACK.length)];
      } else {
        feedback = NEEDS_WORK_FEEDBACK[Math.floor(Math.random() * NEEDS_WORK_FEEDBACK.length)];
      }

      setResult({ overallScore, words: wordFeedback, feedback });
      setIsAnalyzing(false);
    }, 1200);
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setIsAnalyzing(false);
  }, []);

  return { result, isAnalyzing, analyze, reset };
}
