
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-funzone-purple to-funzone-dark-purple py-4 px-6 shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-white font-roboto flex items-center">
          🎮 FunZone <span className="hidden sm:inline ml-2">- Play Simple Web Games</span>
        </h1>
        <div className="flex items-center mt-2 md:mt-0">
          <div className="relative inline-block">
            <div className="inline-flex items-center font-roboto text-white text-sm">
              <span className="animate-pulse-slow mr-2">●</span> 
              <span>Players online: 183</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
