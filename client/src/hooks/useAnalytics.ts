import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsService } from '../services/api';

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Avoid tracking admin or login pages to keep stats clean and focused on portfolio visits
    const path = location.pathname;
    if (!path.startsWith('/admin') && !path.startsWith('/login')) {
      analyticsService.trackVisit(path);
    }
  }, [location]);
};
