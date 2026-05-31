import React, { useState } from 'react';
import { XIcon } from './icons';

const MetricsModal = ({ isOpen, onClose, onAddWeight, onAddMeasurement }) => {
  const [metricType, setMetricType] = useState('weight');
  const [value, setValue] = useState('');
  const [muscle, setMuscle] = useState('Chest');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue <= 0) {
        alert("Please enter a valid positive number.");
        return;
    }

    if (metricType === 'weight') {
      onAddWeight(numericValue);
    } else {
      if (!muscle) {
          alert("Please select a muscle group.");
          return;
      }
      onAddMeasurement(muscle, numericValue);
    }
    setValue('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-base-200/80 backdrop-blur-2xl border border-base-300 rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-content-200 hover:text-content-100">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4">Add New Metric</h2>
        
        <div className="mb-4">
          <div className="flex bg-black/20 rounded-lg p-1">
            <button 
              onClick={() => setMetricType('weight')}
              className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${metricType === 'weight' ? 'bg-brand-primary text-base-100' : 'text-content-200'}`}>
              Weight
            </button>
            <button 
              onClick={() => setMetricType('measurement')}
              className={`w-1/2 p-2 rounded-md font-semibold transition-colors ${metricType === 'measurement' ? 'bg-brand-primary text-base-100' : 'text-content-200'}`}>
              Measurement
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {metricType === 'measurement' && (
            <div>
              <label htmlFor="muscle" className="block text-sm font-medium text-content-200 mb-1">Muscle Group</label>
              <select 
                id="muscle"
                value={muscle}
                onChange={(e) => setMuscle(e.target.value)}
                className="w-full bg-base-100/50 border border-base-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
              >
                <option>Chest</option>
                <option>Waist</option>
                <option>Hips</option>
                <option>Bicep (L)</option>
                <option>Bicep (R)</option>
                <option>Thigh (L)</option>
                <option>Thigh (R)</option>
              </select>
            </div>
          )}
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-content-200 mb-1">
              Value ({metricType === 'weight' ? 'kg' : 'in'})
            </label>
            <input 
              id="value"
              type="number"
              step="0.1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={metricType === 'weight' ? 'e.g., 75.5' : 'e.g., 42.0'}
              required
              className="w-full bg-base-100/50 border border-base-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none"
            />
          </div>
          <button type="submit" className="w-full bg-brand-primary hover:bg-brand-secondary text-base-100 font-bold py-3 px-4 rounded-lg transition-colors">
            Save Metric
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

export default MetricsModal;
