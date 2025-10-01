
import React, { useState } from 'react';
// FIX: Update import paths to use the common directory
import { Language } from '../common/types';
import { translations } from '../common/constants';

interface HeaderProps {
  language: Language;
  setLanguage: (language: Language) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onProfileClick: () => void;
}

const SearchIcon: React.FC<{className: string}> = ({className}) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const CloseIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const ProfileIcon: React.FC<{className: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ language, setLanguage, searchQuery, setSearchQuery, onProfileClick }) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(language === Language.EN ? Language.HI : Language.EN);
  };

  const handleSearchToggle = () => {
      setIsSearchVisible(!isSearchVisible);
      if (isSearchVisible) {
          setSearchQuery(''); // Clear search when closing
      }
  }

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
      {!isSearchVisible && (
        <>
            <div className="flex-1">
                <div className="relative inline-block w-28 text-left bg-gray-100 rounded-full p-1">
                    <button onClick={toggleLanguage} className="w-full flex items-center justify-center transition-all duration-300">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${language === Language.HI ? 'bg-white shadow' : 'text-gray-600'}`}>हिन्दी</span>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${language === Language.EN ? 'bg-white shadow' : 'text-gray-600'}`}>English</span>
                    </button>
                </div>
            </div>
            <h1 className="flex-1 text-center text-2xl font-bold">
                <span className="text-green-700">सब्ज़ी</span>
                <span className="text-red-600 relative">MATE<span className="absolute bottom-[-2px] left-0 w-full h-0.5 bg-red-600"></span></span>
            </h1>
        </>
      )}
      
      {isSearchVisible && (
          <div className="w-full flex items-center">
              <input 
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
          </div>
      )}

      <div className="flex-1 flex items-center justify-end space-x-4">
        <button onClick={handleSearchToggle} className="text-gray-600 hover:text-green-700">
            {isSearchVisible ? <CloseIcon className="w-6 h-6" /> : <SearchIcon className="w-6 h-6" />}
        </button>
        {!isSearchVisible && (
            <button onClick={onProfileClick} className="text-gray-600 hover:text-green-700">
                <ProfileIcon className="w-7 h-7" />
            </button>
        )}
      </div>
    </header>
  );
};

export default Header;