import React from 'react';

const MainHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-base-100/90 backdrop-blur-lg border-b border-base-300 z-20 flex items-center justify-between px-4 md:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        {/* The main container for the logo text, using the Orbitron font */}
        <h1 className="font-orbitron text-2xl sm:text-3xl font-bold tracking-wider">
          {/* "BEAST" part */}
          <span 
            className="text-brand-primary"
          >
            BEAST
          </span>
          {/* "MODE" part */}
          <span 
            className="text-content-100"
          >
            MODE
          </span>
        </h1>
        <span className="border border-brand-primary/50 text-brand-primary text-[10px] font-bold px-1.5 py-0.5 rounded-sm tracking-widest -translate-y-px">
          beta
        </span>
      </div>
    </header>
  );
};

export default MainHeader;
