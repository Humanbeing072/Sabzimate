import React, { useState, useEffect } from 'react';
import { Language, Vegetable, OrderItem, User, translations, getTodaysVegetables, placeUrgentOrder, LoadingSpinner } from 'common';

interface UrgentOrderScreenProps {
  language: Language;
  searchQuery: string;
  user: User;
}

const quantityOptions = ['100g', '250g', '500g', '1kg'];

const ConfirmationTick: React.FC = () => (
    <div className="absolute top-4 right-10 animate-confirmation">
        <div className="bg-green-600 rounded-full p-1 shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        </div>
    </div>
);

const UrgentOrderScreen: React.FC<UrgentOrderScreenProps> = ({ language, searchQuery, user }) => {
  const t = translations[language];
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [order, setOrder] = useState<OrderItem[]>([]);
  const [confirmedVegIds, setConfirmedVegIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchVeggies = async () => {
      try {
        setIsLoading(true);
        const veggiesData = await getTodaysVegetables();
        setVegetables(veggiesData);
      } catch (error) {
        console.error("Failed to fetch vegetables:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVeggies();
  }, []);

  const updateQuantity = (vegId: string, newQuantity: string) => {
    const currentQuantity = getQuantity(vegId);
    const isAdding = newQuantity && newQuantity !== currentQuantity;

    if (isAdding) {
        setConfirmedVegIds(prev => [...prev, vegId]);
        setTimeout(() => {
            setConfirmedVegIds(prev => prev.filter(id => id !== vegId));
        }, 1500);
    }

    setOrder(prevOrder => {
      const existingItemIndex = prevOrder.findIndex(item => item.id === vegId);
      if (existingItemIndex > -1) {
        if (!newQuantity) {
          return prevOrder.filter(item => item.id !== vegId);
        }
        const updatedOrder = [...prevOrder];
        updatedOrder[existingItemIndex] = { ...updatedOrder[existingItemIndex], quantity: newQuantity };
        return updatedOrder;
      } else if (newQuantity) {
        return [...prevOrder, { id: vegId, quantity: newQuantity }];
      }
      return prevOrder;
    });
  };
  
  const handlePlaceOrder = async () => {
    if (order.length === 0) return;
    setIsPlacingOrder(true);
    try {
        await placeUrgentOrder(user.id, order);
        alert(language === Language.EN ? 'Order placed successfully!' : 'ऑर्डर सफलतापूर्वक दिया गया!');
        setOrder([]);
    } catch (error) {
        console.error("Failed to place order:", error);
        alert(language === Language.EN ? 'Failed to place order.' : 'ऑर्डर देने में विफल।');
    } finally {
        setIsPlacingOrder(false);
    }
  };

  const getQuantity = (vegId: string): string => {
    return order.find(item => item.id === vegId)?.quantity || '';
  };


  const filteredVegetables = vegetables.filter(veg =>
    searchQuery === '' ||
    veg.name[Language.EN].toLowerCase().includes(searchQuery.toLowerCase()) ||
    veg.name[Language.HI].includes(searchQuery)
  );

  return (
    <div className="p-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t.urgentOrderTitle}</h2>
        <p className="text-gray-600 mt-1">{t.urgentOrderDesc}</p>
      </div>

      {isLoading ? <LoadingSpinner /> : (
        <>
          <div className="space-y-4 pb-24">
            {filteredVegetables.length > 0 ? filteredVegetables.map(veg => (
              <div key={veg.id} className="bg-white p-4 rounded-lg shadow-md relative">
                {confirmedVegIds.includes(veg.id) && <ConfirmationTick />}
                {getQuantity(veg.id) && (
                  <button
                      onClick={() => updateQuantity(veg.id, '')}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md z-10 transform hover:scale-110 transition-transform"
                      aria-label="Deselect"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  </button>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{veg.name[language]}</h3>
                    <p className="text-green-600 font-semibold">₹{veg.price} / {veg.unit[language]}</p>
                  </div>
                </div>
                 <div className="grid grid-cols-4 gap-2 mt-3">
                    {quantityOptions.map(option => (
                        <button
                            key={option}
                            onClick={() => updateQuantity(veg.id, getQuantity(veg.id) === option ? '' : option)}
                            className={`py-2 px-1 text-sm font-semibold rounded-lg border-2 transition-colors ${getQuantity(veg.id) === option ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-green-500'}`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
              </div>
            )) : (
              <p className="text-center text-gray-500 mt-8">
                {language === Language.EN ? 'No vegetables found.' : 'कोई सब्जी नहीं मिली।'}
              </p>
            )}
          </div>
          <div className="fixed bottom-16 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t">
            <button 
                onClick={handlePlaceOrder}
                disabled={order.length === 0 || isPlacingOrder}
                className="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isPlacingOrder ? t.loading : `${t.placeOrder} (${order.length} ${language === Language.EN ? 'items' : 'आइटम'})`}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UrgentOrderScreen;