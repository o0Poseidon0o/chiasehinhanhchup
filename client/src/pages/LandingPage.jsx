import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '../components/landing/HeroSection';
import CategoriesSection from '../components/landing/CategoriesSection';
import LocationGuidesSection from '../components/landing/LocationGuidesSection';
import WhyUsSection from '../components/landing/WhyUsSection';
import PhotographersSection from '../components/landing/PhotographersSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import AlbumLookupSection from '../components/landing/AlbumLookupSection';
import TestimonialsCTA from '../components/landing/TestimonialsCTA';

export const LandingPage = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  return (
    <div className="space-y-4">
      {/* 1. Hero Section & Booking Filter */}
      <HeroSection />

      {/* 2. Shooting Categories */}
      <CategoriesSection />

      {/* 3. Location Guides (Địa điểm chụp ảnh đẹp trên mọi miền) */}
      <LocationGuidesSection />

      {/* 4. Why Choose Us & SelectPhoto Engine */}
      <WhyUsSection />

      {/* 5. Featured Photographers */}
      <PhotographersSection />

      {/* 6. How It Works */}
      <HowItWorksSection />

      {/* 7. Quick Album Lookup & Consultation Form */}
      <AlbumLookupSection />

      {/* 8. Testimonials & Call to action banner */}
      <TestimonialsCTA />
    </div>
  );
};

export default LandingPage;
