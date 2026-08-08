import { motion } from 'motion/react';
import { triggerFireworks, triggerSimpleConfetti } from '../utils/fireworks';
import { Compass, Map, PartyPopper } from 'lucide-react';
import { useEffect } from 'react';

export const MainScreen = ({ onPlay }: { onPlay: () => void }) => {

  useEffect(() => {
    // Initial tiny pop when they enter
    setTimeout(triggerSimpleConfetti, 500);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0B132B] via-[#1C2541] to-[#3A506B] overflow-hidden flex flex-col items-center justify-center px-4 text-center">
      
      {/* Stars */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.8 + 0.2,
              animationDuration: (Math.random() * 3 + 2) + 's',
              animationDelay: (Math.random() * 2) + 's'
            }}
          />
        ))}
      </div>

      {/* Mountain Silhouettes Layered Background (SVG) */}
      <div className="absolute bottom-0 left-0 w-full z-0 pointer-events-none">
        <svg viewBox="0 0 1440 320" className="w-full h-auto drop-shadow-2xl">
          {/* Back mountains */}
          <path fill="#2E4057" fillOpacity="1" d="M0,160L48,170.7C96,181,192,203,288,186.7C384,171,480,117,576,96C672,75,768,85,864,112C960,139,1056,181,1152,192C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          {/* Mid mountains */}
          <path fill="#1A2838" fillOpacity="1" d="M0,256L60,245.3C120,235,240,213,360,202.7C480,192,600,192,720,213.3C840,235,960,277,1080,266.7C1200,256,1320,192,1380,160L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
          {/* Front ground */}
          <path fill="#0B132B" fillOpacity="1" d="M0,320L1440,250L1440,320L0,320Z"></path>
        </svg>
      </div>

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative z-10 max-w-2xl w-full mx-auto p-6 md:p-12 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.3)] mb-20"
      >
        <div className="flex justify-center mb-6 gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <Compass className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="w-12 h-12 bg-sky-500/20 rounded-full flex items-center justify-center">
            <Map className="w-6 h-6 text-sky-400" />
          </div>
        </div>

        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-300 mb-6"
        >
          Selamat Ulang Tahun!
        </motion.h1>

        {/* Photo Container */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.6 }}
          className="relative mx-auto w-32 h-32 md:w-40 md:h-40 mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-400 to-sky-400 rounded-full animate-spin" style={{ animationDuration: '4s' }} />
          <div className="absolute inset-[4px] bg-[#1C2541] rounded-full overflow-hidden z-10 flex items-center justify-center">
            {/* 
              TIPS: Ganti URL src ini dengan foto teman kamu! 
              Upload file ke panel kiri (file explorer), lalu panggil nama filenya misal: src="/foto-teman.jpg"
            */}
            <img 
              src="https://drive.google.com/file/d/1Ad8lM0bgxcQY_R8C_cf1I8xn_G6UFRkt/view?usp=sharing" 
              alt="Foto Teman" 
              className="w-full h-full object-cover"
            />
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: 'spring' }}
            className="absolute -bottom-2 -right-2 bg-[#1C2541] rounded-full p-1.5 z-20"
          >
             <div className="bg-emerald-500 rounded-full p-2">
               <Compass className="w-5 h-5 text-white" />
             </div>
          </motion.div>
        </motion.div>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-lg md:text-xl text-indigo-100 mb-8 leading-relaxed font-light"
        >
          Semoga di usia yang baru ini, setiap langkahmu menuju cita citamu selalu diiringi kebahagiaan. Teruslah mendaki impianmu, jangan takut lelah, karena pemandangan terindah selalu ada bersama orang-orang baik seperti anda. Untuk itu mari rayakan atas semua pencapaian yang telah kamu dapatkan
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            triggerFireworks();
            setTimeout(onPlay, 500);
          }}
          className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg overflow-hidden"
        >
          {/* Button glow effect */}
          <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-in-out -skew-x-12 -translate-x-full" />
          <PartyPopper className="w-6 h-6" />
          Rayakan di Puncak!
        </motion.button>
      </motion.div>
    </div>
  );
};
