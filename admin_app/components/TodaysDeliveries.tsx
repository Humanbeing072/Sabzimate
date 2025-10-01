import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../common/types';
import { getDeliveryConfirmations, getDeliveryRejections } from '../../common/api';
import LoadingSpinner from '../../common/components/LoadingSpinner';

const UserCard: React.FC<{user: User}> = ({ user }) => (
    <li className="p-4 bg-white rounded-lg shadow">
      <p className="font-semibold text-gray-900">{user.name}</p>
      <p className="text-sm text-gray-600">{user.phone}</p>
      <p className="text-sm text-gray-600 mt-1">{user.address}</p>
    </li>
);

const TodaysDeliveries: React.FC = () => {
  const [confirmations, setConfirmations] = useState<User[]>([]);
  const [rejections, setRejections] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeliveries = useCallback(async () => {
    try {
      setIsLoading(true);
      const [confirmData, rejectData] = await Promise.all([
        getDeliveryConfirmations(),
        getDeliveryRejections()
      ]);
      setConfirmations(confirmData);
      setRejections(rejectData);
    } catch (error) {
      console.error("Failed to fetch delivery confirmations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchDeliveries]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Delivery Status for Today</h2>
      {isLoading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <h3 className="text-xl font-semibold text-green-700 mb-4">Confirmed Deliveries ({confirmations.length})</h3>
            {confirmations.length > 0 ? (
              <ul className="space-y-3">
                {confirmations.map((user) => (
                  <UserCard key={user.phone} user={user} />
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 mt-8 bg-white p-6 rounded-lg shadow">
                No users have confirmed for delivery yet.
              </p>
            )}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-red-700 mb-4">Declined Deliveries ({rejections.length})</h3>
            {rejections.length > 0 ? (
              <ul className="space-y-3">
                {rejections.map((user) => (
                  <UserCard key={user.phone} user={user} />
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 mt-8 bg-white p-6 rounded-lg shadow">
                No users have declined delivery yet.
              </p>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default TodaysDeliveries;
