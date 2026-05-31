import React from 'react';

const Header = ({ title }) => {
  return (
    <header className="p-4 md:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-content-100">
        {title}
      </h1>
    </header>
  );
};

export default Header;
