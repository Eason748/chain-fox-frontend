import React, { useEffect } from 'react'; // Import useEffect
import { initNetworkParticles } from '../components/NetworkParticles'; // Import the initializer

import HeroSection from '../components/HomePage/HeroSection';
import MissionSection from '../components/HomePage/MissionSection';
import WorkflowSection from '../components/HomePage/WorkflowSection';
import FeaturesSection from '../components/HomePage/FeaturesSection';
import AuditFeaturesSection from '../components/HomePage/AuditFeaturesSection';
import RoadmapSection from '../components/HomePage/RoadmapSection';
import TokenomicsSection from '../components/HomePage/TokenomicsSection';
import FAQSection from '../components/HomePage/FAQSection';
import CaseStudiesSection from '../components/HomePage/CaseStudiesSection';
import CurrentStatusSection from '../components/HomePage/CurrentStatusSection';

function HomePage() {
  // Initialize network particles background only for this page
  useEffect(() => {
    const cleanup = initNetworkParticles();
    // Cleanup on unmount
    return () => {
      if (cleanup) cleanup();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Mission Section */}
      <MissionSection />

      {/* Workflow Section */}
      <WorkflowSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Audit Features Section */}
      <AuditFeaturesSection />

      {/* Roadmap Section */}
      <RoadmapSection />

      {/* Tokenomics Section */}
      <TokenomicsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Case Studies Section */}
      <CaseStudiesSection />

      {/* Current Status Section */}
      <CurrentStatusSection />
    </>
  );
}

export { HomePage };
