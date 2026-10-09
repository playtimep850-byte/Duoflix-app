import { useState, useEffect, useRef } from 'react';
import { X, Send, Mic, Sparkles, Crown, MessageCircle, Star, Volume2, Square } from 'lucide-react';
import type { Tutor } from '@/types';
import { TUTORS } from '@/data/content';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';

interface TutorScreenProps {
  onPremiumClick: () => void;
}

interface Message {
  role: 'tutor' | 'user';
  text: string;
}

const TUTOR_GREETING = "Hi! I'm so glad you're here. What would you like to practice today?";

const TUTOR_RESPONSES = [
  "That's a great point! Let me help you say that more naturally. Try: 'I'd like to share my thoughts on this.'",
  "Excellent effort! Your sentence structure is solid. Let's refine the pronunciation — focus on the stress.",
  "I love your enthusiasm! Let's try that again with a slightly more formal tone for professional settings.",
  "Perfect! You're making real progress. Ready for a slightly more challenging phrase?",
  "Great question! In English, we often use 'would' for polite requests. For example: 'Would you mind helping me?'",
];

export function TutorScreen({ onPremiumClick }: TutorScreenProps) {
  const [activeTutor, setActiveTutor] = useState<Tutor | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState<number | null>(null);
  const speech = useSpeechSynthesis();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastSpokenRef = useRef(-1);

  const speakMessage = (text: string, idx: number) => {
    if (speech.isSpeaking && speakingMsgIdx === idx) {
      speech.stop();
      setSpeakingMsgIdx(null);
    } else {
      speech.stop();
      setSpeakingMsgIdx(idx);
      speech.speak(text, activeTutor?.voice);
    }
  };

  useEffect(() => {
    if (speech.isSpeaking) return;
    setSpeakingMsgIdx(null);
  }, [speech.isSpeaking]);

  useEffect(() => {
    if (autoSpeak && activeTutor && messages.length > 0 && lastSpokenRef.current < messages.length - 1) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'tutor') {
        lastSpokenRef.current = messages.length - 1;
        setSpeakingMsgIdx(messages.length - 1);
        speech.speak(lastMsg.text, activeTutor.voice);
      }
    }
  }, [messages, autoSpeak, activeTutor, speech]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const openTutor = (tutor: Tutor) => {
    speech.stop();
    lastSpokenRef.current = -1;
    setSpeakingMsgIdx(null);
    setActiveTutor(tutor);
    setMessages([{ role: 'tutor', text: `${TUTOR_GREETING}` }]);
    setInput('');
  };

  const closeTutor = () => {
    speech.stop();
    setActiveTutor(null);
    setMessages([]);
    setSpeakingMsgIdx(null);
    lastSpokenRef.current = -1;
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const response = TUTOR_RESPONSES[Math.floor(Math.random() * TUTOR_RESPONSES.length)];
      setMessages((prev) => [...prev, { role: 'tutor', text: response }]);
      setIsTyping(false);
    }, 1400);
  };

  if (activeTutor) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-ink-900 animate-fade-in">
        {/* Header */}
        <div className="glass border-b border-ink-600/50 px-5 py-4 flex items-center gap-3">
          <button onClick={closeTutor} className="shrink-0 w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </button>
          <div className={`shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${activeTutor.avatarGradient} flex items-center justify-center font-bold text-ink-900`}>
            {activeTutor.initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{activeTutor.name}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              {activeTutor.online ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online now
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-600" /> Away
                </>
              )}
            </p>
          </div>
          <button
            onClick={() => setAutoSpeak((v) => !v)}
            className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition-colors ${
              autoSpeak ? 'bg-gold-400/15 text-gold-300 border border-gold-400/30' : 'bg-ink-700 text-gray-500 border border-ink-600'
            }`}
            title="Toggle auto voice replies"
          >
            <Volume2 className="w-3 h-3" />
            Auto Voice
          </button>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
              {msg.role === 'tutor' && (
                <div className={`shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${activeTutor.avatarGradient} flex items-center justify-center font-bold text-xs text-ink-900 mr-2`}>
                  {activeTutor.initial}
                </div>
              )}
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'gold-gradient text-ink-900 font-medium rounded-br-md'
                    : 'bg-ink-700 text-gray-200 rounded-bl-md border border-ink-600'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="flex-1">{msg.text}</span>
                  {msg.role === 'tutor' && speech.isSupported && (
                    <button
                      onClick={() => speakMessage(msg.text, i)}
                      className={`shrink-0 mt-0.5 transition-colors ${
                        speakingMsgIdx === i && speech.isSpeaking ? 'text-gold-400' : 'text-gray-500 hover:text-gold-400'
                      }`}
                    >
                      {speakingMsgIdx === i && speech.isSpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className={`shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${activeTutor.avatarGradient} flex items-center justify-center font-bold text-xs text-ink-900 mr-2`}>
                {activeTutor.initial}
              </div>
              <div className="bg-ink-700 border border-ink-600 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-5 py-3 glass border-t border-ink-600/50">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-ink-700 border border-ink-600 rounded-full px-4 py-2.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none"
              />
            </div>
            <button className="shrink-0 w-10 h-10 rounded-full bg-ink-700 border border-ink-600 flex items-center justify-center hover:bg-ink-600 transition-colors">
              <Mic className="w-4 h-4 text-gold-400" />
            </button>
            <button
              onClick={sendMessage}
              className="shrink-0 w-10 h-10 rounded-full gold-gradient flex items-center justify-center hover:scale-105 transition-transform"
            >
              <Send className="w-4 h-4 text-ink-900" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-5 h-5 text-gold-400" />
              <h1 className="text-2xl font-bold gold-text font-serif">AI Tutor</h1>
            </div>
            <p className="text-sm text-gray-500">Chat with real-life tutor characters.</p>
          </div>
          <button
            onClick={onPremiumClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/30 text-xs font-semibold text-gold-300 hover:bg-gold-400/20 transition-colors"
          >
            <Crown className="w-3.5 h-3.5" />
            Premium
          </button>
        </div>
      </div>

      {/* Tutor cards */}
      <div className="px-5 space-y-3">
        {TUTORS.map((tutor) => (
          <button
            key={tutor.id}
            onClick={() => openTutor(tutor)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-ink-800 border border-ink-600 hover:border-gold-400/40 transition-all text-left group"
          >
            <div className="relative shrink-0">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tutor.avatarGradient} flex items-center justify-center font-bold text-lg text-ink-900`}>
                {tutor.initial}
              </div>
              {tutor.online && (
                <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-400 border-2 border-ink-800" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">{tutor.name}</p>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-gold-400/10 text-gold-400/80">{tutor.accent}</span>
              </div>
              <p className="text-xs text-gold-400/70 font-medium mt-0.5">{tutor.role}</p>
              <p className="text-xs text-gray-500 truncate mt-1">{tutor.bio}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {tutor.topics.map((topic) => (
                  <span key={topic} className="text-[10px] px-2 py-0.5 rounded-full bg-ink-700 text-gray-400">{topic}</span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Premium banner */}
      <div className="px-5 mt-5">
        <div className="rounded-2xl bg-gradient-to-br from-gold-400/10 to-ink-800 border border-gold-400/20 p-5 text-center">
          <Sparkles className="w-6 h-6 text-gold-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">Unlock Unlimited Tutoring</p>
          <p className="text-xs text-gray-400 mt-1 mb-3">Get 24/7 access to all tutors, voice calls, and personalized lesson plans.</p>
          <button
            onClick={onPremiumClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient text-ink-900 font-bold text-xs hover:opacity-90 transition-opacity"
          >
            <Crown className="w-3.5 h-3.5" />
            Go Premium
          </button>
        </div>
      </div>
    </div>
  );
}
