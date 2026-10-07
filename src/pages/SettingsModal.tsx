import React from 'react';
import { X, Settings, Volume2, VolumeX, Gauge, Palette, Eye, Activity } from 'lucide-react';
import {
  useSettingsStore,
  AnimationSpeedOption,
  CameraSensitivityOption,
} from '../store/settingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const animationSpeed = useSettingsStore((s) => s.animationSpeed);
  const setAnimationSpeed = useSettingsStore((s) => s.setAnimationSpeed);
  const sound = useSettingsStore((s) => s.sound);
  const setSound = useSettingsStore((s) => s.setSound);
  const cameraSensitivity = useSettingsStore((s) => s.cameraSensitivity);
  const setCameraSensitivity = useSettingsStore((s) => s.setCameraSensitivity);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const setReducedMotion = useSettingsStore((s) => s.setReducedMotion);

  if (!isOpen) return null;

  const isLight = theme === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div
        className={`border rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl relative transition-colors duration-300 ${
          isLight
            ? 'bg-white text-slate-900 border-slate-200 shadow-2xl'
            : 'bg-slate-900 text-white border-white/10'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between pb-4 border-b ${
            isLight ? 'border-slate-200' : 'border-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-500" />
            <h3 className="text-lg font-bold">Settings</h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight
                ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings List */}
        <div className="flex flex-col gap-4 pt-4 text-xs">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-2 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              <Palette className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-sm">Theme</span>
            </div>
            <div
              className={`flex items-center p-1 rounded-xl border ${
                isLight
                  ? 'bg-slate-100 border-slate-200'
                  : 'bg-slate-950 border-white/5'
              }`}
            >
              {(['dark', 'light'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`px-3 py-1 font-bold rounded-lg capitalize transition-all ${
                    theme === t
                      ? 'bg-cyan-400 text-slate-950 shadow-sm font-black'
                      : isLight
                      ? 'text-slate-500 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Animation Speed */}
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-2 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              <Gauge className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-sm">Animation Speed</span>
            </div>
            <div
              className={`flex items-center p-1 rounded-xl border ${
                isLight
                  ? 'bg-slate-100 border-slate-200'
                  : 'bg-slate-950 border-white/5'
              }`}
            >
              {(['slow', 'normal', 'fast'] as AnimationSpeedOption[]).map((spd) => (
                <button
                  key={spd}
                  onClick={() => setAnimationSpeed(spd)}
                  className={`px-2.5 py-1 font-bold rounded-lg capitalize transition-all ${
                    animationSpeed === spd
                      ? 'bg-cyan-400 text-slate-950 shadow-sm font-black'
                      : isLight
                      ? 'text-slate-500 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}
                </button>
              ))}
            </div>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-2 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              {sound ? (
                <Volume2 className="w-4 h-4 text-slate-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span className="font-semibold text-sm">Sound Effects</span>
            </div>
            <div
              className={`flex items-center p-1 rounded-xl border ${
                isLight
                  ? 'bg-slate-100 border-slate-200'
                  : 'bg-slate-950 border-white/5'
              }`}
            >
              <button
                onClick={() => setSound(true)}
                className={`px-3 py-1 font-bold rounded-lg transition-all ${
                  sound
                    ? 'bg-cyan-400 text-slate-950 shadow-sm font-black'
                    : isLight
                    ? 'text-slate-500 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                On
              </button>
              <button
                onClick={() => setSound(false)}
                className={`px-3 py-1 font-bold rounded-lg transition-all ${
                  !sound
                    ? 'bg-cyan-400 text-slate-950 shadow-sm font-black'
                    : isLight
                    ? 'text-slate-500 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Off
              </button>
            </div>
          </div>

          {/* Camera Sensitivity */}
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-2 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-sm">Camera Sensitivity</span>
            </div>
            <div
              className={`flex items-center p-1 rounded-xl border ${
                isLight
                  ? 'bg-slate-100 border-slate-200'
                  : 'bg-slate-950 border-white/5'
              }`}
            >
              {(['low', 'normal', 'high'] as CameraSensitivityOption[]).map((sens) => (
                <button
                  key={sens}
                  onClick={() => setCameraSensitivity(sens)}
                  className={`px-2.5 py-1 font-bold rounded-lg capitalize transition-all ${
                    cameraSensitivity === sens
                      ? 'bg-cyan-400 text-slate-950 shadow-sm font-black'
                      : isLight
                      ? 'text-slate-500 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sens}
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div
              className={`flex items-center gap-2 ${
                isLight ? 'text-slate-700' : 'text-slate-300'
              }`}
            >
              <Activity className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-sm">Reduced Motion</span>
            </div>
            <div
              className={`flex items-center p-1 rounded-xl border ${
                isLight
                  ? 'bg-slate-100 border-slate-200'
                  : 'bg-slate-950 border-white/5'
              }`}
            >
              <button
                onClick={() => setReducedMotion(true)}
                className={`px-3 py-1 font-bold rounded-lg transition-all ${
                  reducedMotion
                    ? 'bg-cyan-400 text-slate-950 shadow-sm font-black'
                    : isLight
                    ? 'text-slate-500 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                On
              </button>
              <button
                onClick={() => setReducedMotion(false)}
                className={`px-3 py-1 font-bold rounded-lg transition-all ${
                  !reducedMotion
                    ? 'bg-cyan-400 text-slate-950 shadow-sm font-black'
                    : isLight
                    ? 'text-slate-500 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Off
              </button>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <div
          className={`pt-5 mt-3 border-t flex justify-end ${
            isLight ? 'border-slate-200' : 'border-white/10'
          }`}
        >
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 active:scale-98 text-slate-950 font-black text-sm rounded-xl transition-all shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
