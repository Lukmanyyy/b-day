import { motion } from 'motion/react';
import React, { useState } from 'react';
import { ArrowRight, Play, Pause } from 'lucide-react';

export const AuthScreen = ({ onAccessGranted }: { onAccessGranted: () => void }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleAudio = () => {
    const audio = document.getElementById('bg-music') as HTMLAudioElement;
    if (audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    }
  };

  const checkCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Normalize input: remove spaces, punctuation, lowercase
    const normalized = code.toLowerCase().replace(/[^a-z0-9]/g, '');
    const validCodes = ['08082008', '8082008', '8agustus2008', '08agustus2008'];
    
    if (validCodes.includes(normalized)) {
      setError(false);
      onAccessGranted();
    } else {
      setError(true);
      // reset error animation after a bit
      setTimeout(() => setError(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0B132B] px-6 z-40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full bg-[#1C2541]/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-indigo-900/50 flex flex-col items-center text-center"
      >
        <motion.div 
          animate={{ y: [0, -8, 0] }} 
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="mb-6 flex justify-center"
        >
          <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-2xl overflow-visible">
            {/* Mountain */}
            <path d="M 10 85 L 50 20 L 90 85 Z" fill="#38BDF8" />
            {/* Snow cap */}
            <path d="M 34 46 L 50 20 L 66 46 Q 58 55 50 45 Q 42 55 34 46" fill="#FFFFFF" />
            {/* Eyes */}
            <circle cx="42" cy="60" r="4" fill="#0F172A" />
            <circle cx="43" cy="59" r="1.5" fill="#FFFFFF" />
            <circle cx="58" cy="60" r="4" fill="#0F172A" />
            <circle cx="59" cy="59" r="1.5" fill="#FFFFFF" />
            {/* Smile */}
            <path d="M 46 65 Q 50 70 54 65 Z" fill="#F43F5E" />
            <path d="M 48 68 Q 50 72 52 68 Z" fill="#FDA4AF" />
            {/* Blush */}
            <ellipse cx="34" cy="63" rx="4" ry="2" fill="#FCA5A5" opacity="0.8" />
            <ellipse cx="66" cy="63" rx="4" ry="2" fill="#FCA5A5" opacity="0.8" />
            {/* Flag pole */}
            <rect x="49" y="5" width="3" height="30" fill="#CBD5E1" />
            {/* Flag */}
            <path d="M 52 5 L 75 13 L 52 21 Z" fill="#EF4444" />
            {/* Ground */}
            <ellipse cx="50" cy="85" rx="45" ry="10" fill="#4ADE80" />
            <ellipse cx="30" cy="85" r="8" fill="#16A34A" />
            <ellipse cx="70" cy="85" r="8" fill="#16A34A" />
          </svg>
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Pos 1</h2>
        <p className="text-indigo-200 mb-8 text-sm">
          Sebelum melangkah lebih jauh, ada satu hal yang perlu dipastikan.
          Tanggal berapa perjalananmu di dunia ini dimulai?
        </p>

        <form onSubmit={checkCode} className="w-full relative">
          <motion.div animate={error ? { x: [-10, 10, -10, 10, 0] } : {}} transition={{ duration: 0.4 }}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={`w-full bg-[#0B132B] text-white px-5 py-4 rounded-xl outline-none focus:ring-2 transition-all ${
                error ? 'ring-2 ring-red-500 border-red-500' : 'focus:ring-indigo-500 border border-indigo-900/50'
              }`}
            />
            {error && (
              <p className="text-red-400 text-xs absolute -bottom-6 left-0 w-full text-center">
                Kode salah. Coba lagi ya!
              </p>
            )}
          </motion.div>

          <button
            type="submit"
            className="w-full mt-10 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            Lanjut
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center">
          <p className="text-indigo-200 text-sm mb-3">Mau pake lagu?</p>
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full flex items-center justify-center transition-colors shadow-lg ${isPlaying ? 'bg-indigo-500 text-white' : 'bg-[#0B132B] text-indigo-300 hover:text-white border border-indigo-900/50 hover:border-indigo-500'}`}
          >
            {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5" fill="currentColor" />}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
