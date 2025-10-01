import React, { useState, useEffect } from 'react';
import { Language, User, translations, createUser } from 'common';

interface OnboardingScreenProps {
  onOnboardingComplete: (user: User) => void;
  language: Language;
  phone: string | null;
  profile: { name: string; email: string; googleId: string; } | null;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onOnboardingComplete, language, phone, profile }) => {
  const t = translations[language];
  const [formData, setFormData] = useState<Omit<User, 'id'>>({ 
    name: '', 
    phone: '', 
    address: '',
    email: null,
    googleId: null,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
        setFormData({
            name: profile.name,
            phone: '',
            address: '',
            email: profile.email,
            googleId: profile.googleId,
        });
    } else if (phone) {
        setFormData(prev => ({ ...prev, phone }));
    }
  }, [phone, profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUseMap = () => {
    // Simulate getting location from a map
    setFormData({ ...formData, address: '123 Green Valley, Veggie Town, 400001' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone && formData.address) {
      setIsSaving(true);
      try {
        const newUser = await createUser(formData);
        onOnboardingComplete(newUser);
      } catch (error: any) {
        console.error("Failed to create user profile:", error);
        alert(error.message || (language === Language.EN ? 'Failed to save profile. Please try again.' : 'प्रोफ़ाइल सहेजने में विफल। कृपया पुन प्रयास करें।'));
      } finally {
        setIsSaving(false);
      }
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
            value={formData.name || ''}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 ${profile ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-900'}`}
            required
            readOnly={!!profile}
            autoFocus={!profile}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t.phoneNumber}</label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 ${!profile ? 'bg-gray-100 text-gray-600' : 'bg-white text-gray-900'}`}
            readOnly={!profile}
            required
            autoFocus={!!profile}
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">{t.address}</label>
          <textarea
            name="address"
            id="address"
            rows={3}
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        <button type="button" onClick={handleUseMap} className="w-full text-green-600 font-semibold py-2 rounded-lg border border-green-600 hover:bg-green-50 transition-colors">
          {t.useMap}
        </button>
        <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSaving ? t.loading : t.saveAndContinue}
        </button>
      </form>
    </div>
  );
};

export default OnboardingScreen;