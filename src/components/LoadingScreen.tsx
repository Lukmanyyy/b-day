import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [blown, setBlown] = useState(false);

  useEffect(() => {
    // Sequence: 
    // Wait 2s, blow out candle
    const timer1 = setTimeout(() => {
      setBlown(true);
    }, 2000);

    // Wait 1.5s after blowing to transition out
    const timer2 = setTimeout(() => {
      onComplete();
    }, 3800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0B132B] overflow-hidden z-50">
      {/* Stars background */}
      <div className="absolute inset-0 opacity-50">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random(),
            }}
          />
        ))}
      </div>

      <div className="relative w-64 h-64 flex items-end justify-center">
        {/* Candle body */}
        <motion.div 
          className="absolute bottom-20 w-3 h-12 bg-amber-100 rounded-sm z-10"
        >
          {/* Flame */}
          <motion.div
            animate={
              blown
                ? { scale: 0, opacity: 0, y: -10 }
                : {
                    scale: [1, 1.1, 0.9, 1.05, 1],
                    rotate: [0, 2, -2, 1, 0],
                  }
            }
            transition={
              blown 
                ? { duration: 0.3 } 
                : { repeat: Infinity, duration: 0.5, ease: 'easeInOut' }
            }
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-6 bg-orange-500 rounded-b-xl rounded-t-[50%] blur-[1px] origin-bottom shadow-[0_0_15px_#f97316]"
            style={{ filter: "drop-shadow(0 0 10px rgba(249, 115, 22, 0.8))" }}
          />
          {/* Inner flame */}
          <motion.div
            animate={
              blown
                ? { scale: 0, opacity: 0 }
                : { scale: [1, 1.2, 0.8, 1.1, 1] }
            }
            transition={
              blown 
                ? { duration: 0.2 } 
                : { repeat: Infinity, duration: 0.4, ease: 'easeInOut' }
            }
            className="absolute -top-4 left-1/2 -translate-x-1/2 w-2 h-3 bg-yellow-300 rounded-b-xl rounded-t-[50%] origin-bottom"
          />
          {/* Smoke when blown */}
          {blown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.5 }}
              animate={{ opacity: [0, 0.5, 0], y: -30, scale: 2 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-400 rounded-full blur-sm"
            />
          )}
        </motion.div>

        {/* Mountain Character */}
        <motion.svg
          animate={
            blown
              ? { scale: [1, 1.05, 1], y: [0, -5, 0] } // "Breathing" / blowing action
              : {}
          }
          transition={{ duration: 0.5 }}
          viewBox="0 0 100 100"
          className="absolute bottom-0 w-full h-40 z-20"
        >
          {/* Main mountain peak */}
          <path d="M50 20 L90 100 L10 100 Z" fill="#1C2541" />
          {/* Snow cap */}
          <path d="M50 20 L65 50 L55 45 L50 55 L45 45 L35 50 Z" fill="#F0F4EF" />
          
          {/* Eyes */}
          <circle cx="43" cy="65" r="2.5" fill="white" />
          <circle cx="57" cy="65" r="2.5" fill="white" />
          
          {/* Blinking Animation (CSS Keyframes style via Framer Motion isn't needed, we can just use static or simple scale) */}
          <motion.circle 
            animate={{ scaleY: [1, 1, 0, 1, 1] }}
            transition={{ times: [0, 0.45, 0.5, 0.55, 1], duration: 4, repeat: Infinity }}
            cx="43" cy="65" r="2.5" fill="#1C2541" className="origin-center" 
          />
          <motion.circle 
            animate={{ scaleY: [1, 1, 0, 1, 1] }}
            transition={{ times: [0, 0.45, 0.5, 0.55, 1], duration: 4, repeat: Infinity }}
            cx="57" cy="65" r="2.5" fill="#1C2541" className="origin-center" 
          />

          {/* Mouth (Blowing) */}
          {blown ? (
            <motion.ellipse cx="50" cy="73" rx="2" ry="3" fill="white" />
          ) : (
            <path d="M47 72 Q50 74 53 72" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          )}
        </motion.svg>
      </div>

      <motion.p 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mt-8 text-indigo-200 font-mono text-sm tracking-widest"
      >
        Meniup lilin...
      </motion.p>
    </div>
  );
};
