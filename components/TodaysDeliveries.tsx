import React, { useState, useEffect, useCallback } from 'react';
// FIX: Update import paths to use the common directory
import { User } from '../common/types';
import { getDeliveryConfirmations } from '../common/api';
import LoadingSpinner from './LoadingSpinner';

const TodaysDeliveries: React.FC = () => {
  const [confirmations, setConfirmations] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfirmations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getDeliveryConfirmations();
      setConfirmations(data);
    } catch (error) {
      console.error("Failed to fetch delivery confirmations:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfirmations();
  }, [fetchConfirmations]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirmed Deliveries for Today</h2>
      {isLoading ? <LoadingSpinner /> : (
        confirmations.length > 0 ? (
          <div className="bg-white rounded-lg shadow">
            <ul className="divide-y divide-gray-200">
              {confirmations.map((user) => (
                <li key={user.phone} className="p-4">
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.phone}</p>
                  <p className="text-sm text-gray-600 mt-1">{user.address}</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-8 bg-white p-6 rounded-lg shadow">
            No users have confirmed for delivery yet today.
          </p>
        )
      )}
    </div>
  );
};

export default TodaysDeliveries;