import React from 'react';
import { useLanguage } from '../../i18n';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md backdrop-blur-md ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <div className="flex items-center gap-1.5 px-2 text-slate-400">
        <Globe className="w-3.5 h-3.5 text-cyan-400" />
      </div>

      <button
        type="button"
        onClick={() => setLanguage('vi')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
          language === 'vi'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`}
        title="Tiếng Việt (Vietnam)"
      >
        <span className="text-xs">🇻🇳</span>
        <span>VI</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
          language === 'en'
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`}
        title="English (International)"
      >
        <span className="text-xs">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
};
