import React, { useState, useEffect } from 'react';
import { Language, User } from 'common';
import Login from './components/Login';
import MainLayout from './components/MainLayout';
import OnboardingScreen from './components/OnboardingScreen';
import Intro from './components/Intro';
import { getUserByPhone, signInWithGoogle } from 'common';

interface OnboardingProfile {
  name: string;
  email: string;
  googleId: string;
}

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [introAnimatingOut, setIntroAnimatingOut] = useState<boolean>(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [onboardingPhone, setOnboardingPhone] = useState<string | null>(null);
  const [onboardingProfile, setOnboardingProfile] = useState<OnboardingProfile | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>(Language.EN);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroAnimatingOut(true);
      setTimeout(() => setShowIntro(false), 500); // Wait for fade-out animation
    }, 2500); // Show intro for 2.5 seconds
    return () => clearTimeout(timer);
  }, []);

  const handleLoginAttempt = async (phone: string) => {
    setIsLoading(true);
    try {
      const existingUser = await getUserByPhone(phone);
      if (existingUser) {
        setUser(existingUser);
        setOnboardingPhone(null);
        setOnboardingProfile(null);
      } else {
        setOnboardingPhone(phone);
        setUser(null);
      }
      setIsLoggedIn(true);
    } catch (error) {
      alert('Could not connect to the server. Please try again later.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginAttempt = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await signInWithGoogle(token);
      if ('user' in response) {
        setUser(response.user);
        setOnboardingPhone(null);
        setOnboardingProfile(null);
      } else if (response.needsOnboarding) {
        setOnboardingProfile(response.profile);
        setUser(null);
      }
      setIsLoggedIn(true);
    } catch (error) {
      alert('Could not connect to the server for Google login. Please try again later.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOnboardingComplete = (newUser: User) => {
    setUser(newUser);
    setOnboardingPhone(null);
    setOnboardingProfile(null);
  };
  
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const renderContent = () => {
    if (showIntro) {
      return <Intro isAnimatingOut={introAnimatingOut} />;
    }
    if (!isLoggedIn) {
      return <Login onLoginAttempt={handleLoginAttempt} onGoogleLoginAttempt={handleGoogleLoginAttempt} language={language} setLanguage={setLanguage} isLoading={isLoading} />;
    }
    if (onboardingPhone || onboardingProfile) {
      return <OnboardingScreen onOnboardingComplete={handleOnboardingComplete} language={language} phone={onboardingPhone} profile={onboardingProfile} />;
    }
    if (user) {
      return <MainLayout language={language} setLanguage={setLanguage} user={user} setUser={handleUpdateUser} />;
    }
    // Fallback, should not be reached in normal flow but prevents screen flashing
    return <Login onLoginAttempt={handleLoginAttempt} onGoogleLoginAttempt={handleGoogleLoginAttempt} language={language} setLanguage={setLanguage} isLoading={isLoading} />;
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