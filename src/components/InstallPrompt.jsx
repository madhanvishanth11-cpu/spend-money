import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { Logo } from './Logo';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const dismissed = sessionStorage.getItem('spendwise_install_dismissed');
    if (!dismissed) {
      setShowPrompt(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem('spendwise_install_dismissed')) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    const openListener = () => {
      setShowInstructions(true);
    };
    window.addEventListener('spendwise_open_install', openListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('spendwise_open_install', openListener);
    };
  }, []);

  const [showInstructions, setShowInstructions] = useState(false);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('spendwise_install_dismissed', 'true');
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl shadow-slate-900/15 flex items-center justify-between gap-3 animate-fadeIn">
        <div className="flex items-center gap-3 min-w-0">
          <Logo size="sm" showText={false} />
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">
              Install <span className="text-[#FF6A00]">SpendWise</span> App
            </p>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              Add to home screen for full-screen experience
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-[#FF6A00] hover:bg-[#e05d00] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Manual installation guide modal if Chrome didn't auto-popup */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Logo size="sm" showText={false} />
                <h3 className="font-bold text-slate-900 text-sm">
                  Install <span className="text-[#FF6A00]">SpendWise</span>
                </h3>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p className="font-medium text-slate-800">
                To install SpendWise on your Android phone:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">1</span>
                  <span>Tap the Chrome <strong>menu icon (⋮)</strong> in the top-right corner.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">2</span>
                  <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">3</span>
                  <span>Tap <strong>Install</strong> to add it to your home screen.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
