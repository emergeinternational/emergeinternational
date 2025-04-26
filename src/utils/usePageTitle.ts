
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles: { [key: string]: string } = {
  '/login': 'Welcome to Emerge International — Connect. Learn. Create.',
  '/email-login': 'Welcome to Emerge International — Connect. Learn. Create.',
  '/home': 'Emerge International — Fashion, Arts, and Entertainment',
  '/about': 'About Us — Emerge International',
  '/education': 'Education & Courses — Emerge International',
  '/workshops': 'Creative Workshops — Emerge International',
  '/events': 'Industry Events — Emerge International',
  '/shop': 'Designer Collections — Emerge International',
  '/donations': 'Support Creative Talent — Emerge International',
  '/profile': 'Your Profile — Emerge International',
  '/admin': 'Admin Dashboard — Emerge International',
  '/talent-registration': 'Join Our Creative Community — Emerge International',
  '/submit': 'Media Submission — Emerge International',
  '/contact': 'Contact Us — Emerge International',
  '/terms': 'Terms & Conditions — Emerge International',
  '/privacy': 'Privacy Policy — Emerge International',
};

export const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    const defaultTitle = 'Emerge International — Fashion, Arts, and Entertainment';
    const pageTitle = pageTitles[location.pathname] || defaultTitle;
    document.title = pageTitle;
  }, [location]);
};
