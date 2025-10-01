import React, { useState, useEffect } from 'react';
import { Vegetable, Language } from 'common';
import { addVegetable, updateVegetable } from 'common/api';

interface VegetableEditModalProps {
  vegetable: Vegetable | null;
  onClose: () => void;
  onSave: () => void;
}

const initialFormState: Omit<Vegetable, 'id'> = {
  name: { [Language.EN]: '', [Language.HI]: '' },
  price: 0,
  unit: { [Language.EN]: 'kg', [Language.HI]: 'किलो' },
  image: 'https://picsum.photos/id/1060/400/300?blur=2' // Default placeholder
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const VegetableEditModal: React.FC<VegetableEditModalProps> = ({ vegetable, onClose, onSave }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (vegetable) {
      setFormData({
          name: vegetable.name,
          price: vegetable.price,
          unit: vegetable.unit,
          image: vegetable.image
      });
      setImagePreview(vegetable.image);
    } else {
      setFormData(initialFormState);
      setImagePreview(initialFormState.image);
    }
  }, [vegetable]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'price') {
      setFormData(prev => ({ ...prev, price: Number(value) }));
    } else if (name.startsWith('name.')) {
      const lang = name.split('.')[1] as Language;
      setFormData(prev => ({...prev, name: {...prev.name, [lang]: value}}));
    } else if (name.startsWith('unit.')) {
        const lang = name.split('.')[1] as Language;
        setFormData(prev => ({...prev, unit: {...prev.unit, [lang]: value}}));
    }
  };
  
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const base64 = await fileToBase64(file);
        setFormData(prev => ({ ...prev, image: base64 }));
        setImagePreview(base64);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (vegetable) {
        // FIX: Explicitly construct the payload for `updateVegetable` to resolve a type inference issue.
        // The spread operator was not being correctly interpreted by the TypeScript compiler in this context.
        await updateVegetable({
          id: vegetable.id,
          name: formData.name,
          price: formData.price,
          unit: formData.unit,
          image: formData.image,
        });
      } else {
        await addVegetable(formData);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save vegetable', error);
      alert('Could not save vegetable.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{vegetable ? 'Edit Vegetable' : 'Add New Vegetable'}</h2>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="flex items-center space-x-4">
                  {imagePreview && <img src={imagePreview} alt="preview" className="w-20 h-20 rounded-lg object-cover" />}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image</label>
                    <input type="file" name="image" onChange={handleImageChange} accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"/>
                  </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name (English)</label>
                <input type="text" name="name.EN" value={formData.name[Language.EN]} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name (Hindi)</label>
                <input type="text" name="name.HI" value={formData.name[Language.HI]} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Price (per unit)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit (English)</label>
                <input type="text" name="unit.EN" value={formData.unit[Language.EN]} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Unit (Hindi)</label>
                <input type="text" name="unit.HI" value={formData.unit[Language.HI]} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
            <button type="button" onClick={onClose} disabled={isSaving} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
            <button type="submit" disabled={isSaving} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400">
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VegetableEditModal;