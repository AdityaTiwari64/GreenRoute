import { useState } from 'react';
import Layout from '../components/Layout';
import dynamic from 'next/dynamic';

// Dynamically import the Map components to avoid SSR issues with Leaflet
const CarpoolMap = dynamic(() => import('../components/CarpoolMap'), {
  ssr: false,
});

const LocationPickerMap = dynamic(() => import('../components/LocationPickerMap'), {
  ssr: false,
});

export default function CarpoolPage() {
  // State for form data
  const [formData, setFormData] = useState({
    driverName: '',
    startLocation: '',
    startLocationAddress: '',
    destination: '',
    destinationAddress: '',
    departureTime: '',
    returnTime: '',
    seatsAvailable: 1,
    costPerPerson: '',
    isDriver: true,
  });

  // State for offered rides
  const [offeredRides, setOfferedRides] = useState([]);
  
  // State for location selection modal
  const [locationModal, setLocationModal] = useState({
    isOpen: false,
    fieldType: null, // 'start' or 'destination'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleLocationSelect = (fieldType) => {
    setLocationModal({
      isOpen: true,
      fieldType,
    });
  };

  const handleMapLocationSelect = (location) => {
    if (locationModal.fieldType === 'start') {
      setFormData({
        ...formData,
        startLocation: location.coordinates,
        startLocationAddress: location.address,
      });
    } else if (locationModal.fieldType === 'destination') {
      setFormData({
        ...formData,
        destination: location.coordinates,
        destinationAddress: location.address,
      });
    }
    
    // Close the modal after selection
    setLocationModal({
      isOpen: false,
      fieldType: null,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.startLocation || !formData.destination) {
      alert('Please select both start location and destination on the map');
      return;
    }
    
    // Create a new ride offer
    const newRide = {
      id: `offer-${Date.now()}`,
      driver: formData.driverName || 'Anonymous',
      startLocation: formData.startLocation,
      startLocationAddress: formData.startLocationAddress,
      destination: formData.destination,
      destinationAddress: formData.destinationAddress,
      departureTime: formData.departureTime,
      returnTime: formData.returnTime,
      seatsAvailable: parseInt(formData.seatsAvailable),
      costPerPerson: formData.costPerPerson ? `$${formData.costPerPerson}` : null,
      createdAt: new Date().toISOString(),
    };
    
    // Add to offered rides
    setOfferedRides([...offeredRides, newRide]);
    
    // Reset form
    setFormData({
      driverName: '',
      startLocation: '',
      startLocationAddress: '',
      destination: '',
      destinationAddress: '',
      departureTime: '',
      returnTime: '',
      seatsAvailable: 1,
      costPerPerson: '',
      isDriver: true,
    });
    
    // In a real app, this would connect to a backend API
    alert('Your carpool has been offered and added to the map!');
  };

  return (
    <Layout>
      <div className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-dark">Carpooling</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with others heading your way and share the ride. Save money, reduce emissions, and make your commute more enjoyable.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Form Section */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Find or Offer a Ride</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                    I want to:
                  </label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="isDriver"
                        checked={formData.isDriver}
                        onChange={() => setFormData({ ...formData, isDriver: true })}
                      />
                      <span className="ml-2">Offer a ride (driver)</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name="isDriver"
                        checked={!formData.isDriver}
                        onChange={() => setFormData({ ...formData, isDriver: false })}
                      />
                      <span className="ml-2">Find a ride (passenger)</span>
                    </label>
                  </div>
                </div>

                {formData.isDriver && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="driverName">
                      Your Name
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="driverName"
                      name="driverName"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.driverName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startLocation">
                    Start Location
                  </label>
                  <div className="flex">
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="startLocationAddress"
                      name="startLocationAddress"
                      type="text"
                      placeholder="Select on map"
                      value={formData.startLocationAddress}
                      readOnly
                      required
                    />
                    <button 
                      type="button"
                      className="ml-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
                      onClick={() => handleLocationSelect('start')}
                    >
                      Select
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="destination">
                    Destination
                  </label>
                  <div className="flex">
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="destinationAddress"
                      name="destinationAddress"
                      type="text"
                      placeholder="Select on map"
                      value={formData.destinationAddress}
                      readOnly
                      required
                    />
                    <button 
                      type="button"
                      className="ml-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
                      onClick={() => handleLocationSelect('destination')}
                    >
                      Select
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="departureTime">
                      Departure Time
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="departureTime"
                      name="departureTime"
                      type="datetime-local"
                      value={formData.departureTime}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="returnTime">
                      Return Time (Optional)
                    </label>
                    <input
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      id="returnTime"
                      name="returnTime"
                      type="datetime-local"
                      value={formData.returnTime}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {formData.isDriver && (
                  <>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="seatsAvailable">
                        Seats Available
                      </label>
                      <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="seatsAvailable"
                        name="seatsAvailable"
                        value={formData.seatsAvailable}
                        onChange={handleChange}
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                          <option key={num} value={num}>
                            {num}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="costPerPerson">
                        Cost Per Person ($) (Optional)
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="costPerPerson"
                        name="costPerPerson"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.costPerPerson}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between mt-6">
                  <button className="btn btn-primary w-full" type="submit">
                    {formData.isDriver ? 'Offer Ride' : 'Find Ride'}
                  </button>
                </div>
              </form>
            </div>

            {/* Map Section */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6">Available Carpools</h2>
              <div className="h-96 rounded-lg overflow-hidden">
                <CarpoolMap carpools={offeredRides} />
              </div>
            </div>
          </div>

          {/* Carpool Benefits */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Benefits of Carpooling</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="rounded-full bg-primary/10 p-4 w-16 h-16 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mt-4">Cost Savings</h3>
                <p className="text-gray-600 mt-2">
                  Share fuel and maintenance costs, reducing your daily commute expenses by up to 75%.
                </p>
              </div>

              <div className="text-center">
                <div className="rounded-full bg-green-100 p-4 w-16 h-16 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mt-4">Environmental Impact</h3>
                <p className="text-gray-600 mt-2">
                  Reduce carbon emissions and your carbon footprint by sharing rides instead of driving alone.
                </p>
              </div>

              <div className="text-center">
                <div className="rounded-full bg-secondary/10 p-4 w-16 h-16 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mt-4">Community Building</h3>
                <p className="text-gray-600 mt-2">
                  Meet colleagues and neighbors, build relationships, and make your commute more enjoyable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Selection Modal */}
      {locationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 md:w-3/4 lg:w-2/3 h-3/4 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Select {locationModal.fieldType === 'start' ? 'Starting' : 'Destination'} Location
              </h3>
              <button 
                onClick={() => setLocationModal({ isOpen: false, fieldType: null })}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-[90%]">
              <LocationPickerMap 
                onLocationSelect={handleMapLocationSelect}
                value={
                  locationModal.fieldType === 'start' 
                    ? formData.startLocation 
                    : formData.destination
                }
              />
            </div>
            <p className="text-gray-600 text-sm mt-2">Click on the map to select a location</p>
          </div>
        </div>
      )}
    </Layout>
  );
} 