import React from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
const HeroSection = () => {
  return (
    <section className="hero-gradient pt-28 pb-16 md:pt-32 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary-600 mb-6 animate-fade-in">
            Visualize Your Projects as Interactive Graphs
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 md:mb-12 animate-fade-in">
            Transform complex project dependencies into clear visual networks. 
            Identify blockers instantly and optimize your workflow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-6 text-lg">
              Try Live Demo
            </Button>
            <Button variant="outline" className="border-secondary-600 text-secondary-600 hover:bg-secondary-50 px-8 py-6 text-lg">
              <a href='https://github.com/AhmedTrb/Project-Management-web-app'>View on GitHub</a>
            </Button>
          </div>
        </div>
        <div className="mt-16 max-w-5xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white z-10 h-32 bottom-0"></div>
          <div className="relative rounded-xl shadow-xl overflow-hidden border border-gray-200">
            <div className="absolute top-0 left-0 right-0 h-10 flex items-center px-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            <div className="pt-10">
              <div className="min-h-[300px] md:min-h-[400px]  rounded-lg flex items-center justify-center">
                <Image src="/graphView.png" alt="Project Graph View" width={1100} height={600} className='object-cover'/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;