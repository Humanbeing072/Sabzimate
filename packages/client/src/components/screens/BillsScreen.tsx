import React, { useState, useEffect } from 'react';
import { Language, BillEntry, User, translations, getBills, LoadingSpinner } from 'common';

interface BillsScreenProps {
  language: Language;
  user: User;
}

const BillItem: React.FC<{ bill: BillEntry }> = ({ bill }) => (
  <div className="bg-white p-4 rounded-lg shadow-md mb-3">
    <div className="flex justify-between items-center">
      <span className="font-bold text-gray-700">{new Date(bill.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      <span className="font-bold text-lg text-green-600">₹{bill.total.toFixed(2)}</span>
    </div>
    <div className="mt-2 border-t pt-2">
      {bill.items.map((item, index) => (
        <div key={index} className="flex justify-between text-sm text-gray-600">
          <span>{item.name} (x{item.quantity})</span>
          <span>₹{item.price.toFixed(2)}</span>
        </div>
      ))}
    </div>
  </div>
);

const BillsScreen: React.FC<BillsScreenProps> = ({ language, user }) => {
  const t = translations[language];
  const [bills, setBills] = useState<BillEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        const billsData = await getBills(user.id);
        setBills(billsData);
      } catch(error) {
        console.error("Failed to fetch bills:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBills();
  }, [user]);

  const monthlyTotal = bills.reduce((acc, bill) => acc + bill.total, 0);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">{t.billsTitle}</h2>
      
      {isLoading ? <LoadingSpinner /> : (
        <>
            <div className="bg-white p-4 rounded-lg shadow-lg mb-6 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-700">{t.monthlyTotal}</span>
                <span className="text-2xl font-bold text-red-700">₹{monthlyTotal.toFixed(2)}</span>
                </div>
                <div className="flex space-x-2 mt-4">
                    <button className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-colors">{t.payNow}</button>
                    <button className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 rounded-lg hover:bg-gray-300 transition-colors">{t.payWithCash}</button>
                </div>
            </div>

            <div className="space-y-3">
                {bills.length > 0 ? bills.map((bill, index) => (
                    <BillItem key={index} bill={bill} />
                )) : (
                    <p className="text-center text-gray-500 mt-8 bg-white p-6 rounded-lg shadow">
                        {language === Language.EN ? 'No bills for this month yet.' : 'इस महीने के लिए अभी तक कोई बिल नहीं है।'}
                    </p>
                )}
            </div>
        </>
      )}
    </div>
  );
};

export default BillsScreen;