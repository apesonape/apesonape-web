'use client';

import React, { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';
import { Raleway } from 'next/font/google';

const raleway = Raleway({ subsets: ['latin'] });

const NFTLandingPage = () => {
  const contractAddress = "0xa6bAbE18F2318D2880DD7dA3126C19536048F8B0";
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const getImagePath = (path: string) => {
    const base = process.env.NODE_ENV === 'production' ? '/apesonape-web' : '';
    return `${base}${path}`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress);
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 1000);
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = contractAddress;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setShowCopyFeedback(true);
        setTimeout(() => setShowCopyFeedback(false), 1000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <main className={`min-h-screen bg-hero-blue text-black relative ${raleway.className}`}>
      {/* Main container */}
      <div className="min-h-screen w-full relative">
        {/* Left side - Hero Image */}
        <div className="absolute bottom-0 left-0 w-3/4 h-full">
          <img 
            src={getImagePath('/AoA-placeholder-apecoinblue.jpg')}
            alt="NFT Hero"
            className="absolute bottom-0 left-0 w-full h-auto object-contain object-bottom"
          />
        </div>
        
        {/* Right side - Content */}
        <div className="absolute right-0 min-w-[400px] w-1/3 top-[15%] p-8">
          <div className="bg-black/10 backdrop-blur-sm p-8">
            {/* Marketplace Links */}
            <div className="space-y-4 mb-12">
              <a 
                href="https://magiceden.us/collections/apechain/0xa6bAbE18F2318D2880DD7dA3126C19536048F8B0" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-black/10 hover:bg-black/15 p-4 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={getImagePath('/magiceden_icon.jpeg')}
                    alt="Magic Eden" 
                    className="w-6 h-6"
                  />
                  <span className="font-medium text-white">Magic Eden</span>
                </div>
                <ExternalLink className="w-5 h-5 text-white" />
              </a>
              
              <a 
                href="https://apechain.mintify.xyz/apechain/0xa6babe18f2318d2880dd7da3126c19536048f8b0" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-black/10 hover:bg-black/15 p-4 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={getImagePath('/mintify_icon.jpeg')}
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
                <div className="flex items-center gap-2">
                  <div className="font-mono text-sm break-all text-white flex-grow">
                    {contractAddress}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="p-1 hover:bg-black/10 rounded-md transition-colors relative"
                    title="Copy address"
                  >
                    {showCopyFeedback ? (
                      <Check className="w-4 h-4 text-white opacity-100 transition-opacity duration-200 ease-out" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <a 
                    href="https://apescan.io/address/0xa6babe18f2318d2880dd7da3126c19536048f8b0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-black/10 rounded-md transition-colors"
                    title="View on Apescan"
                  >
                    <img 
                      src={getImagePath('/chain-light.svg')}
                      alt="View on Apescan"
                      className="w-5 h-5"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="absolute bottom-8 sm:left-8 right-8 flex flex-col gap-4 sm:items-start items-center">
          <a 
            href="https://x.com/apechainapes"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center hover:bg-black/10 rounded-full transition-colors bg-black/5 backdrop-blur-sm"
          >
            <img 
              src={getImagePath('/x-white.png')}
              alt="Follow us on X"
              className="w-5 h-5"
            />
          </a>
          <a 
            href="https://discord.gg/gVmqW6SExU"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center hover:bg-black/10 rounded-full transition-colors bg-black/5 backdrop-blur-sm"
          >
            <img 
              src={getImagePath('/discord-white.png')}
              alt="Join our Discord"
              className="w-6 h-5"
            />
          </a>
        </div>

        {/* Bottom centered logo */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <img 
            src={getImagePath('/apechain.png')}
            alt="Apechain Logo"
            className="h-8 w-auto"
          />
        </div>
      </div>
    </main>
  );
};

export default NFTLandingPage;