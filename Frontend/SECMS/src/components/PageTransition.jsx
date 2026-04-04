import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lottie from 'lottie-react';
import animationData from '../assets/Animation/data.json';
import './PageTransition.css';

// Routes that use the full Lottie splash animation
const LOTTIE_ROUTES = ['/', '/login', '/signin', '/shop'];

function PageTransition() {
  const location = useLocation();
  const [lottieActive, setLottieActive] = useState(false);
  const [barActive, setBarActive] = useState(false);   // thin progress bar
  const [fadeKey, setFadeKey] = useState(0);       // triggers re-mount fade
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    const incoming = location.pathname;
    const from = prevPath.current;

    // Don't animate on very first render (already mounted)
    if (from === incoming) return;
    prevPath.current = incoming;

    if (LOTTIE_ROUTES.includes(incoming)) {
      // ── Full Lottie splash ──────────────────────────────
      setLottieActive(true);
      const t = setTimeout(() => setLottieActive(false), 1200);
      return () => clearTimeout(t);
    } else {
      // ── Lightweight bar + fade for all other routes ─────
      setBarActive(true);
      setFadeKey(k => k + 1);           // remount the fade wrapper
      const t = setTimeout(() => setBarActive(false), 800);
      return () => clearTimeout(t);
    }
  }, [location.pathname]);

  return (
    <>
      {/* Lottie full-screen splash */}
      {lottieActive && (
        <div className="page-transition">
          <div className="page-transition__overlay">
            <Lottie
              animationData={animationData}
              loop={false}
              autoplay={true}
              className="page-transition__animation"
            />
          </div>
        </div>
      )}

      {/* Thin progress bar for non-Lottie routes */}
      {barActive && <div className="pt-bar" />}

      {/* Invisible wrapper that re-mounts to replay the fade-in */}
      <style key={fadeKey}>{`
        body > #root > * {
          animation: ptFadeUp 0.55s cubic-bezier(0.22,1,0.36,1);
        }
      `}</style>
    </>
  );
}

export default PageTransition;
