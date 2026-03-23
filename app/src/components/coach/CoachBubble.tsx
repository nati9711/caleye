import { useEffect, useState } from 'react';
import type { CoachMessage } from '../../types';

interface CoachBubbleProps {
  messages: CoachMessage[];
  /** If true, animate the latest message with a typing effect */
  animateLatest?: boolean;
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

function SingleBubble({
  message,
  animate,
}: {
  message: CoachMessage;
  animate: boolean;
}) {
  const [displayText, setDisplayText] = useState(animate ? '' : message.text);
  const [isTyping, setIsTyping] = useState(animate);

  useEffect(() => {
    if (!animate) {
      setDisplayText(message.text);
      setIsTyping(false);
      return;
    }

    setDisplayText('');
    setIsTyping(true);
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setDisplayText(message.text.slice(0, idx));
      if (idx >= message.text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [message.text, animate]);

  return (
    <div className="coach-bubble-enter mb-3">
      {/* Coach label */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">🤖</span>
        <span className="text-xs font-bold text-emerald-400">גל</span>
        <span className="text-[10px] text-white/30 mr-auto">
          {formatTime(message.timestamp)}
        </span>
      </div>

      {/* Bubble */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl
        rounded-tr-md px-4 py-3 max-w-[90%] mr-0 ml-auto">
        <p className="text-sm text-white/85 leading-relaxed" dir="rtl">
          {displayText}
          {isTyping && <span className="typing-cursor">|</span>}
        </p>
      </div>
    </div>
  );
}

export default function CoachBubble({ messages, animateLatest = true }: CoachBubbleProps) {
  if (messages.length === 0) return null;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4" dir="rtl">
      {/* Title */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
        <span className="text-lg">🤖</span>
        <span className="text-sm font-bold text-emerald-400">גל — המאמן שלך</span>
      </div>

      {/* Message feed */}
      <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-hide">
        {messages.map((msg, i) => (
          <SingleBubble
            key={msg.id}
            message={msg}
            animate={animateLatest && i === messages.length - 1}
          />
        ))}
      </div>

      <style>{`
        .coach-bubble-enter {
          animation: bubble-fade-in 0.4s ease-out;
        }
        @keyframes bubble-fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .typing-cursor {
          animation: cursor-blink 0.6s step-end infinite;
          color: rgba(52, 211, 153, 0.6);
          font-weight: bold;
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
