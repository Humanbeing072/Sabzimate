import React from 'react';
// FIX: Update import paths to use the common directory
import { Vegetable, Language } from '../common/types';

interface VegetableCardProps {
  vegetable: Vegetable;
  language: Language;
  onClick: () => void;
  onDeselect: () => void;
  quantity?: string;
  isConfirmed: boolean;
}

const ConfirmationTick: React.FC = () => (
  <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const VegetableCard: React.FC<VegetableCardProps> = ({ vegetable, language, onClick, onDeselect, quantity, isConfirmed }) => {
  
  const handleDeselectClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card's onClick from firing
    onDeselect();
  };

  return (
    <button onClick={onClick} className="bg-white rounded-lg shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 w-full text-left relative">
      {isConfirmed && (
        <div key={vegetable.id} className="animate-confirmation absolute inset-0 bg-green-600 bg-opacity-75 flex items-center justify-center z-20 rounded-lg">
          <ConfirmationTick />
        </div>
      )}
      {quantity && (
        <div className="absolute top-2 right-2 flex items-center space-x-1 z-10">
            <button 
                onClick={handleDeselectClick} 
                className="bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md transform hover:scale-110 transition-transform"
                aria-label="Deselect"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="bg-green-600 text-white text-xs font-bold min-w-[24px] h-6 px-2 rounded-full flex items-center justify-center ring-2 ring-white">
              {quantity}
            </div>
        </div>
      )}
      <img src={vegetable.image} alt={vegetable.name[language]} className="w-full h-32 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800">{vegetable.name[language]}</h3>
        <p className="text-green-600 font-semibold mt-1">
          ₹{vegetable.price} / {vegetable.unit[language]}
        </p>
      </div>
    </button>
  );
};

export default VegetableCard;