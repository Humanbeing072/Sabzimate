import React, { useState, useEffect } from 'react';
import { Language, User, translations } from 'common';

interface ProfileScreenProps {
  language: Language;
  user: User;
  onSave: (user: User) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ language, user, onSave }) => {
  const t = translations[language];
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>(user);

  useEffect(() => {
    setFormData(user); // Sync form data if user prop changes
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleUseMap = () => {
    // Simulate getting location from a map
    setFormData({ ...formData, address: '456 Fresh Farms, Harvest Lane, 400002' });
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="py-3">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-md text-gray-800">{value}</p>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{t.yourProfile}</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
            {t.edit}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t.fullName}</label>
            <input
              type="text" name="name" id="name" value={formData.name || ''} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t.phoneNumber}</label>
            <input
              type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">{t.address}</label>
            <textarea
              name="address" id="address" rows={3} value={formData.address} onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <button type="button" onClick={handleUseMap} className="w-full text-green-600 font-semibold py-2 rounded-lg border border-green-600 hover:bg-green-50 transition-colors">
            {t.useMap}
          </button>
          <div className="flex space-x-2">
            <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 text-gray-800 font-bold py-2 rounded-lg">Cancel</button>
            <button onClick={handleSave} className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg">{t.save}</button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-md divide-y">
          <InfoRow label={t.fullName} value={user.name || ''} />
          <InfoRow label={t.phoneNumber} value={user.phone || ''} />
          <InfoRow label={t.address} value={user.address} />
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;