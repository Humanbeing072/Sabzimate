

import React from 'react';
// FIX: Update import paths to use the common directory
import { Language, ActiveTab } from '../common/types';
import { translations } from '../common/constants';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  language: Language;
}

// Icons
const HomeIcon = ({ isActive }: { isActive: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${isActive ? 'text-green-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UrgentOrderIcon = ({ isActive }: { isActive: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${isActive ? 'text-green-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const LocationIcon = ({ isActive }: { isActive: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${isActive ? 'text-green-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BillsIcon = ({ isActive }: { isActive: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-6 h-6 ${isActive ? 'text-green-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const NavItem: React.FC<{ tab: ActiveTab; label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void; }> = ({ label, icon, isActive, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center w-1/4 space-y-1">
    {icon}
    <span className={`text-xs font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>{label}</span>
  </button>
);


const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, language }) => {
  const t = translations[language];

  const mainTabs = [ActiveTab.Home, ActiveTab.UrgentOrder, ActiveTab.Location, ActiveTab.Bills];

  const navItems = [
    { tab: ActiveTab.Home, label: t.home, icon: <HomeIcon isActive={activeTab === ActiveTab.Home} /> },
    { tab: ActiveTab.UrgentOrder, label: t.urgentOrder, icon: <UrgentOrderIcon isActive={activeTab === ActiveTab.UrgentOrder} /> },
    { tab: ActiveTab.Location, label: t.location, icon: <LocationIcon isActive={activeTab === ActiveTab.Location} /> },
    { tab: ActiveTab.Bills, label: t.bills, icon: <BillsIcon isActive={activeTab === ActiveTab.Bills} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 shadow-t-lg flex justify-around h-16 z-10">
      {navItems.map(item => (
        <NavItem 
          key={item.tab}
          tab={item.tab}
          label={item.label}
          icon={item.icon}
          isActive={activeTab === item.tab && mainTabs.includes(activeTab)}
          onClick={() => setActiveTab(item.tab)}
        />
      ))}
    </nav>
  );
};

export default BottomNav;