
import React, { useState } from 'react';
// FIX: Update import paths to use the common directory
import { Language } from '../common/types';
import { translations } from '../common/constants';

interface LoginProps {
  onLogin: () => void;
  language: Language;
  setLanguage: (language: Language) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, language, setLanguage }) => {
  const [showLanguagePicker, setShowLanguagePicker] = useState(true);
  const t = translations[language];

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setShowLanguagePicker(false);
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

      <div className="w-full max-w-sm">
        <button onClick={onLogin} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md mb-4 hover:bg-blue-700 transition-colors">
          {t.loginWithPhone}
        </button>
        <button onClick={onLogin} className="w-full bg-white text-gray-700 font-semibold py-3 px-4 rounded-lg shadow-md border border-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center">
          <svg className="w-6 h-6 mr-2" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.53 6.57c2.04-6.13 7.72-10.29 12.91-10.29z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-8.53-6.57C.98 15.13 0 19.45 0 24s.98 8.87 2.56 12.42l8.97-6.83z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-5.2 0-9.6-3.47-11.3-8.17l-8.53 6.57C6.51 42.62 14.62 48 24 48z"></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          {t.loginWithGoogle}
        </button>
      </div>
    </div>
  );
};

export default Login;