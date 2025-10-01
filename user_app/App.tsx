import React, { useState, useEffect } from 'react';
import { Language, User } from '../common/types';
import Login from './components/Login';
import MainLayout from './components/MainLayout';
import OnboardingScreen from './components/OnboardingScreen';
import Intro from './components/Intro';

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [introAnimatingOut, setIntroAnimatingOut] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [user, setUser] = useState<User | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroAnimatingOut(true);
      setTimeout(() => setShowIntro(false), 500); // Wait for fade-out animation
    }, 2500); // Show intro for 2.5 seconds
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    // In a real app, you'd fetch user data. Here we assume new user.
    if (!user) {
        setNeedsOnboarding(true);
    }
  };
  
  const handleOnboardingComplete = (newUser: User) => {
    setUser(newUser);
    setNeedsOnboarding(false);
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const renderContent = () => {
    if (showIntro) {
      return <Intro isAnimatingOut={introAnimatingOut} />;
    }
    if (!isLoggedIn) {
      return <Login onLogin={handleLogin} language={language} setLanguage={setLanguage} />;
    }
    if (needsOnboarding) {
      return <OnboardingScreen onOnboardingComplete={handleOnboardingComplete} language={language} />;
    }
    if (user) {
      return <MainLayout language={language} setLanguage={setLanguage} user={user} setUser={handleUpdateUser} />;
    }
    // Fallback, should not be reached in normal flow
    return <Login onLogin={handleLogin} language={language} setLanguage={setLanguage} />;
  }

  return (
    <div className="bg-slate-50 font-sans">
      <div className="max-w-md mx-auto min-h-screen shadow-2xl bg-white">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
