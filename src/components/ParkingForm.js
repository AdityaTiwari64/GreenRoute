import { useState } from 'react';
import { useGreenPoints } from '../contexts/GreenPointsContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';

export default function ParkingForm() {
  const { logParking, loading } = useGreenPoints();
  const { addNotification } = useNotifications();
  const { getUserProfile } = useAuth();

  const [formData, setFormData] = useState({
    type: 'efficient',
    location: '',
    duration: '',
    date: new Date().toISOString().split('T')[0],
    phoneNumber: getUserProfile()?.phoneNumber || '',
    carNumber: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const parkingData = {
        ...formData,
        duration: parseInt(formData.duration),
        date: new Date(formData.date).toISOString()
      };

      const { success, points, error } = await logParking(parkingData);

      if (success) {
        let message = 'Parking recorded successfully!';
        if (points > 0) {
          message += ` You earned ${points} green points for using efficient parking.`;
        }
        addNotification(message, 'success');
        
        // Reset form
        setFormData({
          type: 'efficient',
          location: '',
          duration: '',
          date: new Date().toISOString().split('T')[0],
          phoneNumber: getUserProfile()?.phoneNumber || '',
          carNumber: '',
          notes: ''
        });
      } else {
        addNotification(`Failed to record parking: ${error}`, 'error');
      }
    } catch (error) {
      addNotification(`Error: ${error.message}`, 'error');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-dark mb-4">Log Parking Usage</h2>
      <p className="text-gray-600 mb-4">
        Record your smart parking usage to earn Green Points!
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
            Parking Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="efficient">Smart/Efficient Parking</option>
            <option value="standard">Standard Parking</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
            Parking Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="e.g., 555-123-4567"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="carNumber">
            Car Number/License Plate
          </label>
          <input
            id="carNumber"
            name="carNumber"
            type="text"
            value={formData.carNumber}
            onChange={handleChange}
            placeholder="e.g., ABC1234"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duration">
            Duration (minutes)
          </label>
          <input
            id="duration"
            name="duration"
            type="number"
            min="1"
            value={formData.duration}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="2"
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={`btn btn-primary ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Log Parking'}
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>Points Guide:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Smart/Efficient Parking: 10 points</li>
            <li>Standard Parking: 0 points</li>
          </ul>
        </div>
      </form>
    </div>
  );
} 