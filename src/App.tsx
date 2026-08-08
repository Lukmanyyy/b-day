/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { AuthScreen } from './components/AuthScreen';
import { MainScreen } from './components/MainScreen';
import { GameScreen } from './components/GameScreen';
import { CONFIG } from './config';
import { getDriveAudioLink } from './utils';

export default function App() {
  const [step, setStep] = useState<'loading' | 'auth' | 'main' | 'game'>('loading');
  const audioUrl = getDriveAudioLink(CONFIG.AUDIO_URL);
  const isGoogleDrive = audioUrl.includes('drive.usercontent.google.com') || audioUrl.includes('docs.google.com');

  return (
    <div className="font-sans antialiased text-gray-900 min-h-screen bg-[#0B132B] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <audio id="bg-music" src={audioUrl} crossOrigin={isGoogleDrive ? "anonymous" : undefined} loop />
      {step === 'loading' && <LoadingScreen onComplete={() => setStep('auth')} />}
      {step === 'auth' && <AuthScreen onAccessGranted={() => setStep('main')} />}
      {step === 'main' && <MainScreen onPlay={() => setStep('game')} />}
      {step === 'game' && <GameScreen onBack={() => setStep('main')} />}
    </div>
  );
}
