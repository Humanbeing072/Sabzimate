import React, { useState } from 'react';
import { Language, ActiveTab, User } from 'common';
import Header from './Header';
import BottomNav from './BottomNav';
import HomeScreen from './screens/HomeScreen';
import UrgentOrderScreen from './screens/UrgentOrderScreen';
import LocationScreen from './screens/LocationScreen';
import BillsScreen from './screens/BillsScreen';
import ProfileScreen from './screens/ProfileScreen';
import { useLocalStorageSync } from '../hooks/useLocalStorageSync';

interface MainLayoutProps {
  language: Language;
  setLanguage: (language: Language) => void;
  user: User;
  setUser: (user: User) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ language, setLanguage, user, setUser }) => {
  const [activeScreen, setActiveScreen] = useState<ActiveTab>(ActiveTab.Home);
  const [searchQuery, setSearchQuery] = useState('');
  const lastUpdate = useLocalStorageSync(); // This hook triggers a re-render on storage change

  const renderContent = () => {
    // By combining the active screen with the lastUpdate value, we create a unique key.
    // When lastUpdate changes (due to the hook), the key changes, forcing React
    // to unmount and remount the current screen. This is how it re-fetches fresh data.
    const screenKey = `${activeScreen}-${lastUpdate}`;
    
    switch (activeScreen) {
      case ActiveTab.Home:
        return <HomeScreen key={screenKey} language={language} searchQuery={searchQuery} user={user} />;
      case ActiveTab.UrgentOrder:
        return <UrgentOrderScreen key={screenKey} language={language} searchQuery={searchQuery} user={user} />;
      case ActiveTab.Location:
        return <LocationScreen key={screenKey} language={language} />;
      case ActiveTab.Bills:
        return <BillsScreen key={screenKey} language={language} user={user} />;
      case ActiveTab.Profile:
        return <ProfileScreen key={screenKey} language={language} user={user} onSave={setUser} />;
      default:
        return <HomeScreen key={screenKey} language={language} searchQuery={searchQuery} user={user} />;
    }
  };
  
  const handleNavClick = (tab: ActiveTab) => {
    setActiveScreen(tab);
    setSearchQuery(''); // Reset search on tab change
  }

  return (
    <div className="flex flex-col h-screen">
      <Header 
        language={language} 
        setLanguage={setLanguage} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onProfileClick={() => setActiveScreen(ActiveTab.Profile)}
      />
      <main className="flex-grow overflow-y-auto pb-20 bg-gray-50">
        {renderContent()}
      </main>
      <BottomNav activeTab={activeScreen} setActiveTab={handleNavClick} language={language} />
    </div>
  );
};

export default MainLayout;