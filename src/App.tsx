/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { AuthScreen } from './components/AuthScreen';
import { MainScreen } from './components/MainScreen';
import { GameScreen } from './components/GameScreen';

export default function App() {
  const [step, setStep] = useState<'loading' | 'auth' | 'main' | 'game'>('loading');

  return (
    <div className="font-sans antialiased text-gray-900 min-h-screen bg-[#0B132B] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <audio id="bg-music" src="https://drive.google.com/file/d/1BPFNdE9-1nA9Xm-TNCbaKRRtAboD4XRX/view?usp=sharing" loop />
      {step === 'loading' && <LoadingScreen onComplete={() => setStep('auth')} />}
      {step === 'auth' && <AuthScreen onAccessGranted={() => setStep('main')} />}
      {step === 'main' && <MainScreen onPlay={() => setStep('game')} />}
      {step === 'game' && <GameScreen onBack={() => setStep('main')} />}
    </div>
  );
}
