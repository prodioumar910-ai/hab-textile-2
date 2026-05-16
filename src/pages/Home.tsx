import React from 'react';
import HeroCarousel from '../components/HeroCarousel';
import Marquee from '../components/Marquee';
import TrendingSection from '../components/TrendingSection';
import HomeCatalogue from '../components/HomeCatalogue';
import { motion } from 'motion/react';

const Home: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full"
    >
      <HeroCarousel />
      <Marquee />
      <TrendingSection />
      <HomeCatalogue />
    </motion.div>
  );
};

export default Home;
