import React, { useState } from 'react';
import { Language, Vegetable } from '../../common/types';
import { translations } from '../../common/constants';

interface VegetableDetailModalProps {
  vegetable: Vegetable;
  language: Language;
  initialQuantity: string;
  onClose: () => void;
  onQuantityChange: (id: number, quantity: string) => void;
}

const quantityOptions = ['100g', '250g', '500g', '1kg'];

const VegetableDetailModal: React.FC<VegetableDetailModalProps> = ({ vegetable, language, initialQuantity, onClose, onQuantityChange }) => {
  const t = translations[language];
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleUpdate = () => {
    onQuantityChange(vegetable.id, quantity);
    onClose();
  };
  
  const handleQuantitySelect = (option: string) => {
    // Toggle behavior: if the same option is clicked again, deselect it.
    setQuantity(prev => (prev === option ? '' : option));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <img src={vegetable.image} alt={vegetable.name[language]} className="w-full h-48 object-cover" />
          <button onClick={onClose} className="absolute top-2 right-2 bg-gray-800 bg-opacity-50 text-white rounded-full p-1 shadow-md hover:bg-opacity-75 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <h2 className="text-3xl font-bold text-gray-800">{vegetable.name[language]}</h2>
          <p className="text-xl text-green-600 font-semibold my-2">
            ₹{vegetable.price} / {vegetable.unit[language]}
          </p>
          <div className="grid grid-cols-4 gap-2 my-6">
              {quantityOptions.map(option => (
                  <button
                      key={option}
                      onClick={() => handleQuantitySelect(option)}
                      className={`py-3 px-1 text-md font-semibold rounded-lg border-2 transition-colors ${quantity === option ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'bg-white border-gray-300 text-gray-700 hover:border-green-500'}`}
                  >
                      {option}
                  </button>
              ))}
          </div>
          <button onClick={handleUpdate} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors text-lg">
            {quantity ? `${t.updateOrder} (${quantity})` : t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VegetableDetailModal;
