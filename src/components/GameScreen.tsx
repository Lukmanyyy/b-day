import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Trophy, Play, RotateCcw, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

const SCORE_TARGET = 50;
const PLAYER_SPEED = 4;

type Obstacle = {
  id: number;
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
};

type Tree = {
  x: number;
  y: number;
  size: number;
};

const Joystick = ({ onMove, onRelease, disabled }: { onMove: (x: number, y: number) => void, onRelease: () => void, disabled?: boolean }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (disabled && isActive) {
      setIsActive(false);
      setPosition({ x: 0, y: 0 });
      onRelease();
    }
  }, [disabled, isActive, onRelease]);

  const updatePosition = (e: React.PointerEvent) => {
    if (!baseRef.current || disabled) return;
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const maxDist = rect.width / 2 - 24; 
    
    let dx = e.clientX - centerX;
    let dy = e.clientY - centerY;
    
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxDist) {
      dx = (dx / dist) * maxDist;
      dy = (dy / dist) * maxDist;
    }
    
    setPosition({ x: dx, y: dy });
    onMove(dx / maxDist, dy / maxDist);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsActive(true);
    updatePosition(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isActive) {
      updatePosition(e);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setIsActive(false);
    setPosition({ x: 0, y: 0 });
    onRelease();
  };

  return (
    <div 
      className="w-24 h-24 bg-black/40 rounded-full border border-white/20 flex items-center justify-center shadow-inner relative"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      ref={baseRef}
    >
      <div 
        className={`w-12 h-12 bg-white/80 rounded-full shadow-lg pointer-events-none transition-transform duration-75 ${disabled ? 'opacity-50' : ''}`}
        style={{ transform: `transform(${position.x}px, ${position.y}px)` }}
      />
    </div>
  );
};

const Typewriter = ({ paragraphs, onComplete }: { paragraphs: string[], onComplete?: () => void }) => {
  const [displayedParagraphs, setDisplayedParagraphs] = useState<string[]>(paragraphs.map(() => ''));
  const [currentPIndex, setCurrentPIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentPIndex >= paragraphs.length) {
      if (onComplete) onComplete();
      return;
    }

    const currentText = paragraphs[currentPIndex];
    if (currentCharIndex < currentText.length) {
      const timeout = setTimeout(() => {
        setDisplayedParagraphs(prev => {
          const next = [...prev];
          next[currentPIndex] = currentText.substring(0, currentCharIndex + 1);
          return next;
        });
        setCurrentCharIndex(prev => prev + 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setCurrentPIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentPIndex, currentCharIndex, paragraphs, onComplete]);

  return (
    <div className="text-slate-300 space-y-4 text-left leading-relaxed text-sm md:text-base min-h-[16rem] md:min-h-[14rem]">
      {displayedParagraphs.map((p, i) => (
        p ? <p key={i}>{p}</p> : <div key={i} className="hidden" />
      ))}
    </div>
  );
};

export const GameScreen = ({ onBack }: { onBack: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('mountain_climber_hs') || '0'));
  
  const [won, setWon] = useState(false);
  const [modalStep, setModalStep] = useState<'hidden' | 'wish' | 'message'>('hidden');

  const [showMainLagi, setShowMainLagi] = useState(false);

  const joystickRef = useRef({ x: 0, y: 0 });

  const gameState = useRef({
    player: { x: 0, y: 0 },
    rocks: [] as Obstacle[],
    trees: [] as Tree[],
    lastRockTime: 0,
    hasWon: false
  });

  const getMountainBounds = (y: number, canvas: HTMLCanvasElement) => {
    const cx = canvas.width / 2;
    const peakY = 150;
    const baseW = canvas.width * 1.5; 
    const bottomY = canvas.height;
    
    if (y <= peakY) return { minX: cx, maxX: cx };
    
    const ratio = (y - peakY) / (bottomY - peakY);
    const currentW = baseW * ratio;
    
    return {
      minX: cx - currentW / 2,
      maxX: cx + currentW / 2
    };
  };

  const drawMountain = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const cx = width / 2;
    const peakY = 150;
    const baseW = width * 1.5;
    const bottomY = height;
    
    // Sky
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#87CEEB'); 
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  
    // Sun
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(width - 60, 80, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(width - 60, 80, 50, 0, Math.PI * 2);
    ctx.fill();
  
    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    const drawCloud = (cx: number, cy: number, scale: number) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 20 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 25 * scale, cy - 10 * scale, 25 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 50 * scale, cy, 20 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 25 * scale, cy + 10 * scale, 20 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCloud(50, 100, 0.8);
    drawCloud(width - 120, 170, 0.6);
    drawCloud(80, 220, 0.5);
  
    // Mountain Base
    ctx.fillStyle = '#4A5568';
    ctx.beginPath();
    ctx.moveTo(cx, peakY);
    ctx.lineTo(cx - baseW / 2, bottomY);
    ctx.lineTo(cx + baseW / 2, bottomY);
    ctx.fill();
  
    // Snow Cap
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(cx, peakY);
    ctx.lineTo(cx - baseW * 0.12, peakY + 100);
    ctx.lineTo(cx - baseW * 0.05, peakY + 80);
    ctx.lineTo(cx, peakY + 120);
    ctx.lineTo(cx + baseW * 0.05, peakY + 70);
    ctx.lineTo(cx + baseW * 0.12, peakY + 100);
    ctx.fill();
  
    // PUNCAK Text
    ctx.fillStyle = '#059669'; 
    ctx.font = '900 24px "Arial Black", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PUNCAK', cx, peakY - 20);
  };

  const startGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const newTrees: Tree[] = [];
    for (let i = 0; i < 5; i++) {
      const y = 250 + Math.random() * (canvas.height - 350);
      const bounds = getMountainBounds(y, canvas);
      const x = bounds.minX + 30 + Math.random() * (bounds.maxX - bounds.minX - 60);
      newTrees.push({ x, y, size: 30 + Math.random() * 20 });
    }
    
    gameState.current = {
      player: { x: canvas.width / 2, y: canvas.height - 50 },
      rocks: [],
      trees: newTrees,
      lastRockTime: Date.now(),
      hasWon: false
    };
    joystickRef.current = { x: 0, y: 0 };
    
    setScore(0);
    setIsGameOver(false);
    setWon(false);
    setModalStep('hidden');
    setIsPlaying(true);
  };

  const update = useCallback(() => {
    if (!isPlaying || isGameOver || won) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const state = gameState.current;
    
    const startY = canvas.height - 50;
    const peakY = 160;
    
    // Player movement
    state.player.x += joystickRef.current.x * PLAYER_SPEED;
    state.player.y += joystickRef.current.y * PLAYER_SPEED;
    
    // Constrain Y
    state.player.y = Math.max(peakY, Math.min(startY, state.player.y));
    
    // Constrain X
    const bounds = getMountainBounds(state.player.y, canvas);
    state.player.x = Math.max(bounds.minX + 20, Math.min(bounds.maxX - 20, state.player.x));
    
    // Score based on height
    const currentScore = Math.max(0, Math.floor(SCORE_TARGET * (startY - state.player.y) / (startY - peakY)));
    setScore(currentScore);
    
    if (currentScore >= SCORE_TARGET && !state.hasWon) {
      state.hasWon = true;
      setWon(true);
      setIsPlaying(false);
      setModalStep('wish');
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#ef4444', '#f97316', '#eab308']
      });
      
      if (currentScore > highScore) {
        setHighScore(currentScore);
        localStorage.setItem('mountain_climber_hs', currentScore.toString());
      }
      return; 
    }
    
    // Spawn Rocks (Removed as requested)
    
    // Move Rocks (Removed as requested)
    
    // Collision Detection
    const playerRadius = 15;
    
    const checkCollision = (cx: number, cy: number, radius: number) => {
      const dx = state.player.x - cx;
      const dy = state.player.y - cy;
      return Math.sqrt(dx * dx + dy * dy) < playerRadius + radius - 8; // Forgiving hitbox
    };

    let hit = false;
    for (const tree of state.trees) {
      if (checkCollision(tree.x, tree.y, tree.size / 2)) {
        hit = true; break;
      }
    }
    
    if (hit) {
      setIsGameOver(true);
      setIsPlaying(false);
      if (currentScore > highScore) {
        setHighScore(currentScore);
        localStorage.setItem('mountain_climber_hs', currentScore.toString());
      }
      return;
    }
    
    // Render
    drawMountain(ctx, canvas.width, canvas.height);
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    state.trees.forEach(tree => {
      ctx.font = `${tree.size}px Arial`;
      ctx.fillText('🌲', tree.x, tree.y);
    });
    
    ctx.font = '35px Arial';
    ctx.fillText('🧗', state.player.x, state.player.y);

    requestRef.current = requestAnimationFrame(update);
  }, [isPlaying, isGameOver, won, highScore]);

  useEffect(() => {
    if (isPlaying && !isGameOver && !won) {
      requestRef.current = requestAnimationFrame(update);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isGameOver, won, update]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const parent = canvas?.parentElement;
      if (canvas && parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        if (!isPlaying) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawMountain(ctx, canvas.width, canvas.height);
            ctx.font = '35px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🧗', canvas.width / 2, canvas.height - 50);
          }
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isPlaying]);

  return (
    <div className="fixed inset-0 bg-[#0B132B] flex flex-col select-none overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 text-white pointer-events-none">
        <button 
          onClick={(e) => { e.stopPropagation(); onBack(); }}
          className="p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors backdrop-blur-sm pointer-events-auto"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex gap-4">
          <div className="bg-black/20 px-4 py-2 rounded-full font-mono text-xl backdrop-blur-sm flex items-center gap-2 border border-white/10 shadow-lg">
            <Trophy className="w-5 h-5 text-yellow-400" />
            {highScore}
          </div>
          <div className="bg-black/20 px-4 py-2 rounded-full font-mono text-xl backdrop-blur-sm border border-white/10 shadow-lg">
            {score.toString().padStart(4, '0')} / {SCORE_TARGET}
          </div>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="flex-1 w-full relative">
        <canvas 
          ref={canvasRef}
          className="w-full h-full block"
        />
      </div>

      {/* Start / Game Over UI */}
      {(!isPlaying || isGameOver) && !won && (
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center backdrop-blur-sm z-30">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-black text-gray-800 mb-2 uppercase tracking-wide">
              {isGameOver ? 'Game Over' : 'Mendaki Puncak'}
            </h2>
            {isGameOver && (
              <div className="text-xl text-gray-600 mb-6">
                Skor Anda: <span className="font-bold text-rose-500">{score}</span>
              </div>
            )}
            {!isGameOver && (
              <div className="text-gray-500 mb-6">
                Gunakan analog di bawah untuk memanjat sampai ke Puncak!
              </div>
            )}
            
            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 px-8 rounded-full font-bold text-xl shadow-lg shadow-teal-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isGameOver ? <RotateCcw className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              {isGameOver ? 'Coba Lagi' : 'Mulai Mendaki'}
            </button>
          </motion.div>
        </div>
      )}

      {/* Bottom Joystick Area */}
      <div className="h-32 bg-[#090F24] relative flex items-center justify-center shrink-0 border-t border-white/5 z-20">
        <Joystick 
          disabled={!isPlaying || isGameOver || won}
          onMove={(x, y) => { joystickRef.current = { x, y }; }}
          onRelease={() => { joystickRef.current = { x: 0, y: 0 }; }}
        />
      </div>

      {/* Win Modal / Wish Maker */}
      <AnimatePresence>
        {won && modalStep !== 'hidden' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto p-4 sm:p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center justify-center min-h-full w-full py-8">
              {modalStep === 'wish' && (
                <motion.div
                key="wish"
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: -20, opacity: 0 }}
                className="bg-[#1C2539] border border-slate-700/50 rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center relative overflow-hidden"
              >
                
                <div className="text-center mb-8">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.05, 1],
                      y: [0, -8, 0]
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut"
                    }}
                    className="relative inline-flex items-center justify-center mb-6"
                  >
                    <svg viewBox="0 0 120 120" className="w-32 h-32 relative z-10 drop-shadow-2xl overflow-visible">
                      {/* Soft glowing aura behind */}
                      <circle cx="60" cy="65" r="40" fill="#2DD4BF" opacity="0.15" filter="blur(15px)"/>
                      
                      {/* Backpack */}
                      <rect x="30" y="55" width="20" height="35" rx="6" fill="#475569" />
                      
                      {/* Body/Jacket */}
                      <path d="M 35 65 C 35 50, 85 50, 85 65 L 90 95 C 90 102, 30 102, 30 95 Z" fill="#14B8A6" />
                      
                      {/* Collar/Scarf */}
                      <path d="M 32 55 Q 60 70 88 55 L 85 62 Q 60 75 35 62 Z" fill="#F8FAFC" />
                      
                      {/* Head */}
                      <circle cx="60" cy="42" r="20" fill="#FFE4C4" />
                      
                      {/* Hair (little bangs) */}
                      <path d="M 40 42 C 40 30, 80 30, 80 42 C 75 35, 60 30, 40 42 Z" fill="#78350F" />
                      
                      {/* Beanie/Winter Hat */}
                      <path d="M 39 35 C 39 5, 81 5, 81 35 Z" fill="#F43F5E" />
                      {/* Hat brim */}
                      <rect x="36" y="32" width="48" height="8" rx="4" fill="#E11D48" />
                      {/* Pom pom */}
                      <circle cx="60" cy="8" r="12" fill="#F8FAFC" />
                      
                      {/* Closed Eyes (Cute curved) */}
                      <path d="M 49 43 Q 52 46 55 43" fill="none" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 65 43 Q 68 46 71 43" fill="none" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" />
                      
                      {/* Blush */}
                      <ellipse cx="46" cy="48" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.9" />
                      <ellipse cx="74" cy="48" rx="4" ry="2.5" fill="#FDA4AF" opacity="0.9" />
                      
                      {/* Tiny cute mouth */}
                      <path d="M 58 51 Q 60 53 62 51" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" />
                      
                      {/* Praying Hands */}
                      <ellipse cx="56" cy="72" rx="5" ry="7" fill="#FFE4C4" transform="rotate(20 56 72)" />
                      <ellipse cx="64" cy="72" rx="5" ry="7" fill="#FFE4C4" transform="rotate(-20 64 72)" />
                    </svg>
                    
                    {/* Floating sparkles */}
                    <motion.div 
                      animate={{ opacity: [0.2, 1, 0.2], y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                      className="text-2xl absolute -right-4 top-4"
                    >
                      ✨
                    </motion.div>
                    <motion.div 
                      animate={{ opacity: [0.2, 1, 0.2], y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                      className="text-xl absolute -left-4 top-12"
                    >
                      ✨
                    </motion.div>
                  </motion.div>
                  
                  <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300 mb-4">Selamat Sudah sampai puncak</h2>
                  <p className="text-slate-300 leading-relaxed">
                    Sekarang, Pejamkan mata sejenak. Pikirkan satu hal yang paling kamu inginkan di tahun tahun kedepan. Simpan baik-baik, dan semoga segera menjadi nyata
                  </p>
                </div>

                <button
                  onClick={() => {
                    setModalStep('message');
                    setShowMainLagi(false);
                  }}
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-900/50 hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Sudah, Lanjut
                </button>
              </motion.div>
              )}

              {modalStep === 'message' && (
                <motion.div
                  key="message"
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  className="bg-[#1C2539] border border-slate-700/50 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl text-center relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-teal-900/20 to-transparent -z-10" />
                  
                  <div className="flex-1 pb-4">
                    <motion.div 
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200, 
                      damping: 15,
                      delay: 0.2 
                    }}
                    className="flex justify-center mb-6 mt-4"
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    >
                      <svg viewBox="0 0 200 200" className="w-40 h-40 drop-shadow-2xl overflow-visible">
                        {/* Background clouds */}
                        <path d="M 30 110 Q 30 80 55 90 Q 70 60 90 80 Q 95 90 85 110 Z" fill="#F1F5F9" opacity="0.6" />
                        <path d="M 170 120 Q 170 90 145 100 Q 130 70 110 90 Q 105 100 115 120 Z" fill="#F1F5F9" opacity="0.6" />
                        
                        {/* Base Grass */}
                        <ellipse cx="100" cy="170" rx="85" ry="20" fill="#A3E635" />
                        <ellipse cx="50" cy="175" rx="45" ry="15" fill="#84CC16" />
                        <ellipse cx="150" cy="175" rx="45" ry="15" fill="#84CC16" />
                        
                        {/* Left small mountain */}
                        <path d="M 10 170 L 50 120 L 90 170 Z" fill="#D97706" />
                        <path d="M 50 120 L 90 170 L 70 170 L 50 145 Z" fill="#B45309" />
                        
                        {/* Right small mountain */}
                        <path d="M 110 170 L 150 110 L 190 170 Z" fill="#D97706" />
                        <path d="M 150 110 L 190 170 L 170 170 L 150 140 Z" fill="#B45309" />
                        
                        {/* Main Mountain Base shape */}
                        <path d="M 10 160 Q 100 -20 190 160 Q 100 185 10 160" fill="#38BDF8" />
                        
                        {/* Main Mountain Shadow */}
                        <path d="M 100 24 Q 145 92 190 160 Q 100 185 100 160 Z" fill="#0EA5E9" />
                        
                        {/* Snow Cap */}
                        <path d="M 100 24 Q 115 50 135 55 Q 120 75 100 65 Q 80 75 65 55 Q 85 50 100 24" fill="#FFFFFF" />
                        <circle cx="70" cy="70" r="4" fill="#FFFFFF" />
                        <circle cx="130" cy="70" r="4" fill="#FFFFFF" />
                        <circle cx="100" cy="85" r="5" fill="#FFFFFF" />
                        <circle cx="85" cy="80" r="3" fill="#FFFFFF" />
                        <circle cx="115" cy="80" r="3" fill="#FFFFFF" />
                        
                        {/* Eyes */}
                        <circle cx="75" cy="115" r="10" fill="#0F172A" />
                        <circle cx="78" cy="112" r="3.5" fill="#FFFFFF" />
                        
                        <circle cx="125" cy="115" r="10" fill="#0F172A" />
                        <circle cx="128" cy="112" r="3.5" fill="#FFFFFF" />
                        
                        {/* Mouth */}
                        <path d="M 90 125 Q 100 145 110 125 Z" fill="#F43F5E" />
                        <path d="M 90 125 Q 100 130 110 125" fill="none" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M 95 132 Q 100 140 105 132 Z" fill="#FDA4AF" />
                        
                        {/* Eyebrows */}
                        <path d="M 68 100 Q 75 95 82 100" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
                        <path d="M 118 100 Q 125 95 132 100" fill="none" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
                        
                        {/* Blush */}
                        <ellipse cx="58" cy="125" rx="8" ry="4" fill="#FCA5A5" opacity="0.8" />
                        <ellipse cx="142" cy="125" rx="8" ry="4" fill="#FCA5A5" opacity="0.8" />
                        
                        {/* Bushes decoration */}
                        <circle cx="35" cy="165" r="12" fill="#15803D" />
                        <circle cx="48" cy="172" r="10" fill="#166534" />
                        <circle cx="22" cy="175" r="9" fill="#22C55E" />
                        
                        <circle cx="165" cy="165" r="12" fill="#15803D" />
                        <circle cx="152" cy="172" r="10" fill="#166534" />
                        <circle cx="178" cy="175" r="9" fill="#22C55E" />
                      </svg>
                    </motion.div>
                  </motion.div>
                  
                  <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300 mb-4">
                    Pesan Untukmu 💌
                  </h2>
                  <Typewriter 
                    paragraphs={[
                      "Mungkin Sekian dari saya, maaf belum bisa berbuat banyak.",
                      "Intinya, apapun hal yang kamu doakan, yang kamu impikan, semoga semesta bekerja sama buat ngewujudin semuanya di waktu yang tepat.",
                      "Semoga kamu selalu ditemani Mereka yang bisa menghangatkan hari seperti mentari, dan juga semoga kamu terus seperti Bulan yang bersinar tiada henti.",
                      "All the best on your special day!!! Happy Weekend!!"
                    ]}
                    onComplete={() => setShowMainLagi(true)}
                  />
                
                {showMainLagi && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full mt-6 flex flex-col gap-4"
                  >
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ type: "spring", bounce: 0.5, duration: 1 }}
                      className="relative w-48 h-48 mx-auto mt-4 mb-6"
                    >
                      {/* Boneka (Doll) */}
                      <motion.div 
                        animate={{ y: [0, -5, 0], rotate: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className="absolute -left-6 -top-4 text-5xl z-10 drop-shadow-lg"
                      >
                        🧸
                      </motion.div>
                      
                      {/* Kado (Gift) */}
                      <motion.div 
                        animate={{ y: [0, 5, 0], rotate: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                        className="absolute -right-4 -bottom-4 text-5xl z-10 drop-shadow-lg"
                      >
                        🎁
                      </motion.div>

                      {/* Foto berbingkai putih */}
                      <div className="w-full h-full bg-white p-2 pb-8 rounded-lg shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <img 
                          // GANTI LINK FOTO DI BAWAH INI (src="...")
                          src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=400" 
                          alt="Kenangan" 
                          className="w-full h-full object-cover rounded bg-slate-200" 
                        />
                      </div>
                    </motion.div>

                    <button
                      onClick={() => {
                        setModalStep('hidden');
                        setWon(false);
                        onBack();
                      }}
                      className="w-full py-4 shrink-0 bg-emerald-600 text-white rounded-2xl font-bold text-lg hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/50"
                    >
                      Kembali ke Basecamp
                    </button>
                  </motion.div>
                )}
                </div>
              </motion.div>
            )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

