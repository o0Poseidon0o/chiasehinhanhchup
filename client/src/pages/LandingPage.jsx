import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import CategoriesSection from '../components/landing/CategoriesSection';
import WhyUsSection from '../components/landing/WhyUsSection';
import PhotographersSection from '../components/landing/PhotographersSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import AlbumLookupSection from '../components/landing/AlbumLookupSection';
import TestimonialsCTA from '../components/landing/TestimonialsCTA';

export const LandingPage = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Hero Section & Booking Filter */}
      <HeroSection />

      {/* 2. Shooting Categories */}
      <CategoriesSection />

      {/* 3. Why Choose Us & SelectPhoto Engine */}
      <WhyUsSection />

      {/* 4. Featured Photographers */}
      <PhotographersSection />

      {/* 5. How It Works */}
      <HowItWorksSection />

      {/* 6. Quick Album Lookup & Consultation Form */}
      <AlbumLookupSection />

      {/* 7. Testimonials & Call to action banner */}
      <TestimonialsCTA />
    </div>
  );
};

export default LandingPage;
