import React, { useState, useEffect, useMemo } from 'react';
import { User, Sale, UserWithBill } from '../../common/types';
import { getUsers, getSalesData } from '../../common/api';
import LoadingSpinner from '../../common/components/LoadingSpinner';

const UserSales: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersData, salesData] = await Promise.all([
          getUsers(),
          getSalesData()
        ]);
        setUsers(usersData);
        setSales(salesData);
      } catch (error) {
        console.error("Failed to fetch user and sales data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const usersWithBills: UserWithBill[] = useMemo(() => {
    return users.map(user => {
      const userSales = sales.filter(sale => sale.userId === user.phone);
      const totalBill = userSales.reduce((acc, sale) => acc + sale.total, 0);
      return { ...user, totalBill };
    });
  }, [users, sales]);

  const totalRevenue = useMemo(() => {
      return sales.reduce((acc, sale) => acc + sale.total, 0);
  }, [sales]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Users & Sales Overview</h2>
      {isLoading ? <LoadingSpinner /> : (
        <>
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
                <p className="text-3xl font-bold text-green-600">₹{totalRevenue.toFixed(2)}</p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">User Bills</h3>
            <div className="bg-white rounded-lg shadow">
                <ul className="divide-y divide-gray-200">
                    {usersWithBills.map(user => (
                        <li key={user.phone} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-600">{user.phone}</p>
                                <p className="text-sm text-gray-600 mt-1">{user.address}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Monthly Bill</p>
                                <p className="font-bold text-lg text-red-600 text-right">₹{user.totalBill.toFixed(2)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
      )}
    </div>
  );
};

export default UserSales;
