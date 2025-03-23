import { useState } from 'react';
import { useGreenPoints } from '../contexts/GreenPointsContext';
import { useNotifications } from '../contexts/NotificationContext';

export default function VehicleRegistrationForm() {
  const { registerVehicle, loading } = useGreenPoints();
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState({
    type: '',
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    fuelEfficiency: '',
    primaryUse: 'commuting'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const vehicleData = {
        ...formData,
        year: parseInt(formData.year),
        fuelEfficiency: parseFloat(formData.fuelEfficiency)
      };

      const { success, error } = await registerVehicle(vehicleData);

      if (success) {
        let pointsMessage = '';
        if (formData.type === 'electric') {
          pointsMessage = ' You earned 100 green points for registering an electric vehicle!';
        } else if (formData.type === 'hybrid') {
          pointsMessage = ' You earned 50 green points for registering a hybrid vehicle!';
        } else if (formData.type === 'fuelEfficient') {
          pointsMessage = ' You earned 25 green points for registering a fuel-efficient vehicle!';
        }
        
        addNotification(`Vehicle registered successfully!${pointsMessage}`, 'success');
        // Reset form
        setFormData({
          type: '',
          make: '',
          model: '',
          year: '',
          licensePlate: '',
          fuelEfficiency: '',
          primaryUse: 'commuting'
        });
      } else {
        addNotification(`Failed to register vehicle: ${error}`, 'error');
      }
    } catch (error) {
      addNotification(`Error: ${error.message}`, 'error');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-dark mb-4">Register Your Vehicle</h2>
      <p className="text-gray-600 mb-4">
        Register your vehicle to earn Green Points for eco-friendly vehicles!
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
            Vehicle Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select a type</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
            <option value="fuelEfficient">Fuel Efficient ({'>'}40 MPG)</option>
            <option value="standard">Standard</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="make">
            Make
          </label>
          <input
            id="make"
            name="make"
            type="text"
            value={formData.make}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="model">
            Model
          </label>
          <input
            id="model"
            name="model"
            type="text"
            value={formData.model}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="year">
            Year
          </label>
          <input
            id="year"
            name="year"
            type="number"
            min="1900"
            max={new Date().getFullYear() + 1}
            value={formData.year}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="licensePlate">
            License Plate
          </label>
          <input
            id="licensePlate"
            name="licensePlate"
            type="text"
            value={formData.licensePlate}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fuelEfficiency">
            {formData.type === 'electric' ? 'Range (miles)' : 'Fuel Efficiency (MPG)'}
          </label>
          <input
            id="fuelEfficiency"
            name="fuelEfficiency"
            type="number"
            min="1"
            step="0.1"
            value={formData.fuelEfficiency}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="primaryUse">
            Primary Use
          </label>
          <select
            id="primaryUse"
            name="primaryUse"
            value={formData.primaryUse}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="commuting">Daily Commuting</option>
            <option value="occasional">Occasional Use</option>
            <option value="carpooling">Carpooling</option>
            <option value="business">Business</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={`btn btn-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register Vehicle'}
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>Points Guide:</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Electric Vehicles: 100 points</li>
            <li>Hybrid Vehicles: 50 points</li>
            <li>Fuel Efficient Vehicles ({'>'}40 MPG): 25 points</li>
          </ul>
        </div>
      </form>
    </div>
  );
} 