import { useState } from 'react';
import { X, Crown, Check, Sparkles, Zap, Infinity as InfinityIcon } from 'lucide-react';

interface PremiumModalProps {
  onClose: () => void;
}

export function PremiumModal({ onClose }: PremiumModalProps) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');

  const features = [
    'Unlock all 50 units instantly',
    'Unlimited AI tutor conversations',
    'Voice & video call with tutors',
    'Personalized lesson plans',
    'Offline mode for all content',
    'Priority pronunciation feedback',
  ];

  const price = billing === 'monthly' ? '₹99' : '₹799';
  const period = billing === 'monthly' ? '/month' : '/year';
  const savings = billing === 'annual' ? 'Save 33%' : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto no-scrollbar bg-ink-800 sm:rounded-3xl rounded-t-3xl border border-gold-400/20 animate-slide-up">
        {/* Hero */}
        <div className="relative h-32 bg-gradient-to-br from-gold-400/15 to-ink-800 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-gold-400/0 via-gold-400/40 to-gold-400/0 animate-shimmer" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-ink-700/80 backdrop-blur-sm flex items-center justify-center"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl gold-gradient flex items-center justify-center mb-2 gold-glow-strong">
              <Crown className="w-7 h-7 text-ink-900" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest gold-text">DuoFlix Premium</p>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-bold text-white text-center font-serif">Unlock Everything</h2>
          <p className="text-sm text-gray-500 text-center mt-1">Master English faster with full access.</p>

          {/* Features */}
          <div className="mt-5 space-y-2.5">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="shrink-0 w-5 h-5 rounded-full bg-gold-400/15 flex items-center justify-center">
                  <Check className="w-3 h-3 text-gold-400" />
                </div>
                <span className="text-sm text-gray-300">{f}</span>
              </div>
            ))}
          </div>

          {/* Billing toggle */}
          <div className="mt-6 rounded-2xl bg-ink-700/50 border border-ink-600 p-1.5 flex">
            <button
              onClick={() => setBilling('monthly')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                billing === 'monthly' ? 'bg-ink-600 text-white' : 'text-gray-500'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                billing === 'annual' ? 'bg-ink-600 text-white' : 'text-gray-500'
              }`}
            >
              Annual
              {savings && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full gold-gradient text-[9px] font-bold text-ink-900 whitespace-nowrap">
                  {savings}
                </span>
              )}
            </button>
          </div>

          {/* Price */}
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-3xl font-bold gold-text font-serif">{price}</span>
              <span className="text-sm text-gray-500">{period}</span>
            </div>
            {billing === 'annual' && (
              <p className="text-xs text-gray-500 mt-1">Just ₹66/month, billed annually</p>
            )}
          </div>

          {/* CTA */}
          <button className="w-full mt-5 py-3.5 rounded-xl gold-gradient text-ink-900 font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 gold-glow">
            <Zap className="w-4 h-4" />
            Start Free Trial
          </button>

          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-600">
            <span className="flex items-center gap-1"><Check className="w-3 h-3" /> 7-day free trial</span>
            <span className="flex items-center gap-1"><InfinityIcon className="w-3 h-3" /> Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}
