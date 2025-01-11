import React from 'react';
import { ExternalLink } from 'lucide-react';

const NFTLandingPage = () => {
  return (
    <div className="fixed inset-0 bg-hero-blue text-black overflow-hidden">
      {/* Main container */}
      <div className="h-full w-full flex justify-between relative">
        {/* Left side - Hero Image */}
        <div className="flex-1">
          <img 
            src="/AoA-placeholder-apecoinblue.jpg"
            alt="NFT Hero"
            className="absolute bottom-0 left-0 w-3/4 h-auto object-contain object-bottom"
          />
        </div>
        
        {/* Right side - Content */}
        <div className="absolute right-0 min-w-[400px] w-1/3 h-full p-8">
          <div className="bg-black/10 backdrop-blur-sm h-full p-8">
            {/* Marketplace Links */}
            <div className="space-y-4 mb-12">
              <a 
                href="#" 
                className="flex items-center justify-between bg-black/10 hover:bg-black/15 p-4 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src="/magiceden_icon.jpeg" 
                    alt="Magic Eden" 
                    className="w-6 h-6"
                  />
                  <span className="font-medium text-white">Magic Eden</span>
                </div>
                <ExternalLink className="w-5 h-5 text-white" />
              </a>
              
              <a 
                href="#" 
                className="flex items-center justify-between bg-black/10 hover:bg-black/15 p-4 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src="/mintify_icon.jpeg" 
                    alt="Mintify" 
                    className="w-6 h-6"
                  />
                  <span className="font-medium text-white">Mintify</span>
                </div>
                <ExternalLink className="w-5 h-5 text-white" />
              </a>
            </div>
            
            {/* Contract Address */}
            <div>
              <div className="bg-black/10 p-4">
                <h2 className="text-sm font-medium mb-2 text-white">Contract Address</h2>
                <div className="font-mono text-sm break-all text-white">
                  0x0000000000000000000000000000000000000000
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom centered logo */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <img 
            src="/apechain.png"
            alt="Apechain Logo"
            className="h-8 w-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default NFTLandingPage;