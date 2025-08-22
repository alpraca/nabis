import React from 'react';
import Hero from '../components/Hero';
import BestSellersAPI from '../components/BestSellersAPI';
import ShopByBrand from '../components/ShopByBrand';
import HowItWorks from '../components/HowItWorks';
import LatestArticles from '../components/LatestArticles';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <BestSellersAPI />
      <ShopByBrand />
      <HowItWorks />
      <LatestArticles />
    </div>
  );
};

export default HomePage;
