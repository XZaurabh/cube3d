/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCubeStore } from './store/cubeStore';
import { useSettingsStore } from './store/settingsStore';
import { TopHeader } from './components/UI/TopHeader';
import { Home } from './pages/Home';
import { Play } from './pages/Play';
import { SolverPage } from './pages/SolverPage';
import { SettingsModal } from './pages/SettingsModal';
import { KeyboardHelpModal } from './components/UI/KeyboardHelpModal';

export default function App() {
  const activePage = useCubeStore((s) => s.activePage);
  const theme = useSettingsStore((s) => s.theme);
  const isLight = theme === 'light';

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isKeyboardHelpOpen, setIsKeyboardHelpOpen] = useState(false);

  return (
    <div
      className={`relative w-full h-[100dvh] flex flex-col overflow-hidden font-sans select-none transition-colors duration-300 ${
        isLight ? 'bg-[#f1f5f9] text-slate-900' : 'bg-[#080c14] text-white'
      }`}
    >
      {/* Top Header shown on Play and Solver pages */}
      {activePage !== 'home' && (
        <TopHeader
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenKeyboardHelp={() => setIsKeyboardHelpOpen(true)}
        />
      )}

      {/* Main Pages */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {activePage === 'home' && (
          <Home
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenKeyboardHelp={() => setIsKeyboardHelpOpen(true)}
          />
        )}
        {activePage === 'play' && (
          <Play
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenKeyboardHelp={() => setIsKeyboardHelpOpen(true)}
          />
        )}
        {activePage === 'solver' && <SolverPage />}
      </main>

      {/* Global Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <KeyboardHelpModal
        isOpen={isKeyboardHelpOpen}
        onClose={() => setIsKeyboardHelpOpen(false)}
      />
    </div>
  );
}
