
import React from 'react';
// FIX: Update import paths to use the common directory
import { Language } from '../../common/types';
import { translations } from '../../common/constants';

interface LocationScreenProps {
  language: Language;
}

const LocationScreen: React.FC<LocationScreenProps> = ({ language }) => {
  const t = translations[language];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 text-center">
        <h2 className="text-2xl font-bold text-gray-800">{t.locationTitle}</h2>
        <p className="text-gray-600 mt-1">{t.locationDesc}</p>
      </div>
      <div className="flex-grow bg-gray-200 relative">
        {/* Placeholder for Google Map */}
        <img 
          src="https://picsum.photos/id/43/800/1200" 
          alt="Map placeholder" 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl animate-pulse">
               {/* Truck Icon */}
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v1h10a2 2 0 012 2v3a2 2 0 01-2 2H3a1 1 0 01-1-1v-1H1V6a2 2 0 012-2h11a1 1 0 011 1v2h-1V6a1 1 0 00-1-1H3z" />
               </svg>
            </div>
            <div className="mt-2 bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm font-semibold">
              सब्ज़ीMATE Truck
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationScreen;