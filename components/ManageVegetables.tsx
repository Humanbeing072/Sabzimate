import React, { useState, useEffect, useCallback } from 'react';
// FIX: Update import paths to use the common directory
import { Vegetable, Language } from '../common/types';
import { getTodaysVegetables, deleteVegetable } from '../common/api';
import LoadingSpinner from './LoadingSpinner';
import VegetableEditModal from './VegetableEditModal';

const ManageVegetables: React.FC = () => {
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVegetable, setEditingVegetable] = useState<Vegetable | null>(null);

  const fetchVeggies = useCallback(async () => {
    try {
      setIsLoading(true);
      const veggiesData = await getTodaysVegetables();
      setVegetables(veggiesData);
    } catch (error) {
      console.error("Failed to fetch vegetables:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVeggies();
  }, [fetchVeggies]);

  const handleAddNew = () => {
    setEditingVegetable(null);
    setIsModalOpen(true);
  };

  const handleEdit = (veg: Vegetable) => {
    setEditingVegetable(veg);
    setIsModalOpen(true);
  };

  const handleDelete = async (vegId: number) => {
    if (window.confirm("Are you sure you want to delete this vegetable?")) {
      try {
        await deleteVegetable(vegId);
        fetchVeggies(); // Refresh list after deleting
      } catch (error) {
        console.error("Failed to delete vegetable:", error);
        alert("Could not delete vegetable.");
      }
    }
  };
  
  const handleModalSave = () => {
    setIsModalOpen(false);
    fetchVeggies(); // Refresh list after saving
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Vegetable List</h2>
            <button
                onClick={handleAddNew}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                + Add New
            </button>
        </div>
        {isLoading ? <LoadingSpinner /> : (
            <div className="bg-white rounded-lg shadow">
                <ul className="divide-y divide-gray-200">
                    {vegetables.map(veg => (
                        <li key={veg.id} className="p-4 flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-900">{veg.name[Language.EN]} / {veg.name[Language.HI]}</p>
                                <p className="text-sm text-gray-600">₹{veg.price} per {veg.unit[Language.EN]}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleEdit(veg)} className="text-blue-600 hover:text-blue-800 font-semibold">Edit</button>
                                <button onClick={() => handleDelete(veg.id)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )}
        {isModalOpen && (
            <VegetableEditModal
                vegetable={editingVegetable}
                onClose={() => setIsModalOpen(false)}
                onSave={handleModalSave}
            />
        )}
    </div>
  );
};

export default ManageVegetables;