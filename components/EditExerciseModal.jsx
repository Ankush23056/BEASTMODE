import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';

const EditExerciseModal = ({ isOpen, onClose, exercise, onSave }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (exercise) {
      setFormData(exercise);
    }
  }, [exercise]);

  if (!isOpen || !exercise) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-base-200/80 backdrop-blur-2xl border border-base-300 rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-content-200 hover:text-content-100">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Edit Exercise</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-content-200 mb-1">Exercise Name</label>
            <input id="name" name="name" type="text" value={formData.name || ''} onChange={handleChange} className="w-full bg-base-100/50 border border-base-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label htmlFor="sets" className="block text-sm font-medium text-content-200 mb-1">Sets</label>
                <input id="sets" name="sets" type="text" value={formData.sets || ''} onChange={handleChange} className="w-full bg-base-100/50 border border-base-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none" />
            </div>
             <div>
                <label htmlFor="reps" className="block text-sm font-medium text-content-200 mb-1">Reps</label>
                <input id="reps" name="reps" type="text" value={formData.reps || ''} onChange={handleChange} className="w-full bg-base-100/50 border border-base-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-base-100 font-bold py-3 px-4 rounded-lg transition-colors">
            Save Changes
          </button>
        </form>
      </div>
      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EditExerciseModal;
