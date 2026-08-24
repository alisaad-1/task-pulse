import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // After 1.6s start fading out, then call onFinish at 2.0s
    const fadeTimer = setTimeout(() => setFadeOut(true), 1600);
    const finishTimer = setTimeout(() => onFinish(), 2050);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '18px',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.45s ease',
        paddingTop: 'env(safe-area-inset-top, 0px)'
      }}
    >
      {/* Logo Icon */}
      <div
        style={{
          width: '88px',
          height: '88px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #6366f1, #38bdf8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 12px 40px rgba(99, 102, 241, 0.35)',
          animation: 'splashPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}
      >
        <Sparkles size={44} color="#ffffff" />
      </div>

      {/* App Name */}
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 900,
            letterSpacing: '-1px',
            color: '#1e1b4b',
            margin: 0,
            fontFamily: 'Inter, system-ui, sans-serif'
          }}
        >
          TaskPulse
        </h1>
        <p
          style={{
            fontSize: '0.9rem',
            color: '#6b7280',
            margin: '4px 0 0',
            fontWeight: 500
          }}
        >
          Stay focused. Get it done.
        </p>
      </div>

      {/* Small loading dots */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: '#6366f1',
              opacity: 0.4,
              animation: `splashDot 1s ease-in-out ${i * 0.18}s infinite`
            }}
          />
        ))}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes splashPop {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes splashDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.3; }
          40%           { transform: scale(1.1); opacity: 1;   }
        }
      `}</style>
    </div>
  );
};
