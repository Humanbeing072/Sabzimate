import React, { useState } from 'react';
import { Language, User } from '../../common/types';
import { translations } from '../../common/constants';

interface OnboardingScreenProps {
  onOnboardingComplete: (user: User) => void;
  language: Language;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onOnboardingComplete, language }) => {
  const t = translations[language];
  const [user, setUser] = useState<User>({ name: '', phone: '', address: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUseMap = () => {
    // Simulate getting location from a map
    setUser({ ...user, address: '123 Green Valley, Veggie Town, 400001' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.name && user.phone && user.address) {
      onOnboardingComplete(user);
    } else {
      alert(language === Language.EN ? 'Please fill all fields.' : 'कृपया सभी फ़ील्ड भरें।');
    }
  };

  return (
    <div className="p-6 h-screen flex flex-col justify-center bg-gray-50">
      <h1 className="text-3xl font-bold text-center text-green-700 mb-6">{t.setupProfile}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t.fullName}</label>
          <input
            type="text"
            name="name"
            id="name"
            value={user.name}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t.phoneNumber}</label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={user.phone}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">{t.address}</label>
          <textarea
            name="address"
            id="address"
            rows={3}
            value={user.address}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        <button type="button" onClick={handleUseMap} className="w-full text-green-600 font-semibold py-2 rounded-lg border border-green-600 hover:bg-green-50 transition-colors">
          {t.useMap}
        </button>
        <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors">
          {t.saveAndContinue}
        </button>
      </form>
    </div>
  );
};

export default OnboardingScreen;
