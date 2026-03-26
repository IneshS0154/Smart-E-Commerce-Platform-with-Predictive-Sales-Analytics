import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lottie from 'lottie-react';
import animationData from '../assets/Animation/data.json';
import './PageTransition.css';

function PageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();

  // Pages where animation should show
  const animatedRoutes = ['/', '/login', '/signup', '/signin', '/register'];

  useEffect(() => {
    // Only show animation if navigating TO one of the animated routes
    if (animatedRoutes.includes(location.pathname)) {
      setIsTransitioning(true);
      
      // Hide animation after duration
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  if (!isTransitioning) return null;

  return (
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
  );
}

export default PageTransition;
