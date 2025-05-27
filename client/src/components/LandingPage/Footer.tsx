import React from 'react';
import Image from 'next/image';
import { assets } from '@/app/assets/assets';
const Footer = () => {
  return (
    <footer className="bg-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center">
              <Image
                src={assets.logo}
                alt="Logo"
                width={150}
                height={50}
                className="mr-4"
              />
            </div>
            <p className="mt-4 text-gray-600 max-w-md">
              GraphPM transforms your project management workflow with powerful graph visualization and dependency tracking tools.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#https://github.com/AhmedTrb" className="text-gray-600 hover:text-primary-600" aria-label="GitHub">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.068-.608.068-.608 1.003.07 1.532 1.03 1.532 1.03.891 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.839a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.376.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.934.359.31.678.92.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.16 22 16.416 22 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-primary-600" aria-label="Twitter">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/ahmed-trabelsi-tn/" className="text-gray-600 hover:text-primary-600" aria-label="LinkedIn">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                </svg>
              </a>
            </div>
          </div>
          
          
          
          <div>
            <h3 className="text-sm font-semibold text-gray-800 tracking-wider uppercase">Links</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="#https://github.com/AhmedTrb" className="text-gray-600 hover:text-primary-600">GitHub Repository</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">Live Demo</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">Roadmap</a></li>
              <li><a href="#" className="text-gray-600 hover:text-primary-600">Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-4 flex flex-col md:flex-row justify-between">
          <p className="text-gray-600 text-sm">
            © 2025 Ahmed Trabelsi . All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-gray-600 text-sm hover:text-primary-600">Privacy Policy</a>
            <a href="#" className="text-gray-600 text-sm hover:text-primary-600">Terms of Service</a>
            <a href="#" className="text-gray-600 text-sm hover:text-primary-600">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
