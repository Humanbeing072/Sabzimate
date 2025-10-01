import React, { useState, useEffect, useRef } from 'react';
import { Language, translations } from 'common';

declare const google: any;

interface LoginProps {
  onLoginAttempt: (phone: string) => void;
  onGoogleLoginAttempt: (token: string) => void;
  language: Language;
  setLanguage: (language: Language) => void;
  isLoading: boolean;
}

const Login: React.FC<LoginProps> = ({ onLoginAttempt, onGoogleLoginAttempt, language, setLanguage, isLoading }) => {
  const [showLanguagePicker, setShowLanguagePicker] = useState(true);
  const [phone, setPhone] = useState('');
  const t = translations[language];
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setShowLanguagePicker(false);
  };

  const handleGoogleCallback = (response: any) => {
    if (response.credential) {
        onGoogleLoginAttempt(response.credential);
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (showLanguagePicker || isLoading) return;

    if (!clientId) {
        console.error("Google Sign-In is not configured. Please create a .env file in the 'packages/client' directory and add your VITE_GOOGLE_CLIENT_ID.");
        if (googleButtonRef.current) {
            const errorMsg = language === Language.EN 
                ? 'Google Sign-In is not configured by the developer. Please set VITE_GOOGLE_CLIENT_ID.' 
                : 'Google साइन-इन कॉन्फ़िगर नहीं है। कृपया VITE_GOOGLE_CLIENT_ID सेट करें।';
            googleButtonRef.current.innerHTML = `<div class="p-3 border border-red-300 bg-red-50 rounded-lg text-center"><p class="text-red-700 text-sm font-semibold">${errorMsg}</p></div>`;
        }
        return;
    }

    if (typeof google !== 'undefined' && googleButtonRef.current) {
        google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCallback
        });
        google.accounts.id.renderButton(
            googleButtonRef.current,
            { theme: "outline", size: "large", text: 'continue_with', width: '318' }
        );
        google.accounts.id.prompt();
    }
  }, [showLanguagePicker, isLoading, language]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim().length >= 10 && /^\d+$/.test(phone.trim())) {
      onLoginAttempt(phone.trim());
    } else {
      alert(language === Language.EN ? 'Please enter a valid 10-digit phone number.' : 'कृपया एक वैध 10-अंकीय फ़ोन नंबर दर्ज करें।');
    }
  };

  if (showLanguagePicker) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-green-50 p-6">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-green-700">सब्ज़ी</span>
          <span className="text-red-600 relative">MATE<span className="absolute bottom-[-2px] left-0 w-full h-0.5 bg-red-600"></span></span>
        </h1>
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-6">{translations[Language.EN].chooseLanguage} / {translations[Language.HI].chooseLanguage}</h2>
            <div className="space-y-4">
                <button
                    onClick={() => handleLanguageSelect(Language.EN)}
                    className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-300"
                >
                    {translations[Language.EN].english}
                </button>
                <button
                    onClick={() => handleLanguageSelect(Language.HI)}
                    className="w-full bg-orange-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-orange-600 transition-colors duration-300"
                >
                    {translations[Language.HI].hindi}
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-green-50 p-6 text-center">
      <h1 className="text-5xl font-bold mb-2">
        <span className="text-green-700">सब्ज़ी</span>
        <span className="text-red-600 relative">MATE<span className="absolute bottom-[-3px] left-0 w-full h-1 bg-red-600"></span></span>
      </h1>
      <p className="text-gray-600 mb-10">{t.loginSubtitle}</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="mb-4">
            <label htmlFor="phone" className="sr-only">{t.phoneNumber}</label>
            <input
                type="tel"
                name="phone"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phoneNumber}
                className="mt-1 block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-500 text-center text-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                required
            />
        </div>
        <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? `${t.loading}...` : t.continue}
        </button>
      </form>
      
      <div className="my-4 flex items-center w-full max-w-sm">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-500 text-sm font-semibold">OR</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div className="w-full max-w-sm flex justify-center">
        {isLoading ? (
            <div className="h-[40px] flex items-center justify-center"><p className="text-gray-500">{`${t.loading}...`}</p></div>
        ) : (
            <div ref={googleButtonRef} className="h-[42px]" />
        )}
      </div>
    </div>
  );
};

export default Login;