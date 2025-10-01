import React, { useState } from 'react';
import ManageVegetables from './ManageVegetables';
import TodaysDeliveries from './TodaysDeliveries';
import UserSales from './UserSales';

interface AdminDashboardProps {
  onLogout: () => void;
}

type AdminTab = 'vegetables' | 'deliveries' | 'sales';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('vegetables');

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
         <h1 className="text-2xl font-bold">
            <span className="text-green-700">सब्ज़ी</span>
            <span className="text-red-600 relative">MATE</span>
            <span className="text-gray-600 font-normal text-xl ml-2">Admin</span>
        </h1>
        <button 
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Logout
        </button>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('vegetables')}
            className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${activeTab === 'vegetables' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Manage Vegetables
          </button>
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${activeTab === 'deliveries' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Today's Deliveries
          </button>
           <button
            onClick={() => setActiveTab('sales')}
            className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${activeTab === 'sales' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Users & Sales
          </button>
        </div>
      </nav>

      <main className="flex-grow overflow-y-auto p-6 bg-gray-50">
        {activeTab === 'vegetables' && <ManageVegetables />}
        {activeTab === 'deliveries' && <TodaysDeliveries />}
        {activeTab === 'sales' && <UserSales />}
      </main>
    </div>
  );
};

export default AdminDashboard;
