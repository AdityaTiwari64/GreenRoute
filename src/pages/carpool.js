import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import dynamic from 'next/dynamic';
import { useNotifications } from '../contexts/NotificationContext';
import { sendEmail, generateBookingConfirmationEmail, generateBookingNotificationToDriver } from '../utils/emailService';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

// Dynamically import the Map components to avoid SSR issues with Leaflet
const CarpoolMap = dynamic(() => import('../components/CarpoolMap'), {
  ssr: false,
});

const LocationPickerMap = dynamic(() => import('../components/LocationPickerMap'), {
  ssr: false,
});

// Define mock data for the mobile view
const mockCarpools = [
  {
    id: 1,
    driver: 'John Doe',
    startLocation: [51.505, -0.09],
    startLocationAddress: 'London City Center',
    destination: [51.51, -0.1],
    destinationAddress: 'London Bridge',
    departureTime: '2023-07-25T08:30',
    seatsAvailable: 3,
    costPerPerson: '$5',
    vehicleType: 'Tesla Model 3',
  },
  {
    id: 2,
    driver: 'Jane Smith',
    startLocation: [51.51, -0.11],
    startLocationAddress: 'Covent Garden',
    destination: [51.52, -0.07],
    destinationAddress: 'Liverpool Street',
    departureTime: '2023-07-25T09:00',
    seatsAvailable: 2,
    costPerPerson: '$7',
    vehicleType: 'Toyota Prius',
  },
  {
    id: 3,
    driver: 'Mike Johnson',
    startLocation: [51.49, -0.08],
    startLocationAddress: 'Westminster',
    destination: [51.53, -0.09],
    destinationAddress: 'King\'s Cross',
    departureTime: '2023-07-25T08:45',
    seatsAvailable: 4,
    costPerPerson: '$4',
    vehicleType: 'Honda Civic',
  },
];

// Auth wrapper component to protect actions requiring authentication
const AuthCheck = ({ children, redirectTo = '/login', requireAuth = true, onFailure }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !isAuthenticated) {
      if (onFailure) {
        onFailure();
      } else {
        router.push(`${redirectTo}?redirect=${encodeURIComponent(router.asPath)}`);
      }
    }
  }, [isAuthenticated, loading, router, redirectTo, requireAuth, onFailure]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return children;
};

// Function to safely format dates
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    // Format date in a consistent way to avoid hydration errors
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    console.error('Date formatting error:', e);
    return 'Invalid date';
  }
};

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
    vehicleType: '', // Added vehicle type
    isDriver: true,
  });

  // State for offered rides
  const [offeredRides, setOfferedRides] = useState([]);
  
  // State for location selection modal
  const [locationModal, setLocationModal] = useState({
    isOpen: false,
    fieldType: null, // 'start' or 'destination'
  });
  
  // State for booking modal
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    ride: null,
  });
  
  // State for client-side rendering readiness
  const [isClient, setIsClient] = useState(false);
  
  // Add notification context
  const { addNotification, removeNotification } = useNotifications();
  
  // Add auth context and router
  const { isAuthenticated, getUserProfile } = useAuth();
  const router = useRouter();
  
  // Add state for form data in booking modal
  const [bookingFormData, setBookingFormData] = useState({
    passengerName: '',
    passengerEmail: '',
    passengerPhone: '',
    notes: '',
  });
  
  // Set isClient to true once component is mounted (client-side only)
  useEffect(() => {
    setIsClient(true);
    
    // Pre-fill form with user data if authenticated
    if (isAuthenticated && getUserProfile()) {
      setBookingFormData(prev => ({
        ...prev,
        passengerName: getUserProfile().displayName || '',
        passengerEmail: getUserProfile().email || '',
      }));
      
      setFormData(prev => ({
        ...prev,
        driverName: getUserProfile().displayName || '',
      }));
    }
  }, [isAuthenticated, getUserProfile]);

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
    
    if (!isAuthenticated) {
      addNotification('Please log in to offer a ride', 'warning');
      router.push(`/login?redirect=${encodeURIComponent('/carpool')}`);
      return;
    }
    
    if (!formData.startLocation || !formData.destination) {
      addNotification('Please select both start location and destination on the map', 'error');
      return;
    }
    
    // Validate vehicle type if offering a ride
    if (formData.isDriver && !formData.vehicleType.trim()) {
      addNotification('Please specify your vehicle type', 'error');
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
      seatsTotal: parseInt(formData.seatsAvailable),
      cost: formData.costPerPerson || '0',
      vehicleType: formData.vehicleType,
      createdAt: new Date().toISOString(),
      userId: getUserProfile()?.uid,
    };
    
    // Add to offered rides
    setOfferedRides([...offeredRides, newRide]);
    
    // Reset form
    setFormData({
      driverName: getUserProfile()?.displayName || '',
      startLocation: '',
      startLocationAddress: '',
      destination: '',
      destinationAddress: '',
      departureTime: '',
      returnTime: '',
      seatsAvailable: 1,
      costPerPerson: '',
      vehicleType: '',
      isDriver: true,
    });
    
    addNotification('Your carpool has been offered successfully!', 'success');
  };
  
  const handleBooking = (ride) => {
    if (!isAuthenticated) {
      addNotification('Please log in to book a ride', 'warning');
      router.push(`/login?redirect=${encodeURIComponent('/carpool')}`);
      return;
    }
    
    setBookingModal({
      isOpen: true,
      ride: ride,
    });
  };
  
  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingFormData({
      ...bookingFormData,
      [name]: value,
    });
  };
  
  const submitBooking = async (e) => {
    e.preventDefault();
    
    // Show loading notification
    const loadingId = addNotification('Processing your booking...', 'info', false);
    
    try {
      // Create booking object with pending status
      const booking = {
        id: `booking-${Date.now()}`,
        ride: bookingModal.ride,
        passengerName: bookingFormData.passengerName,
        passengerEmail: bookingFormData.passengerEmail,
        passengerPhone: bookingFormData.passengerPhone,
        notes: bookingFormData.notes,
        status: 'pending', // 'pending', 'approved', 'declined'
        createdAt: new Date().toISOString(),
      };
      
      // Send email to passenger
      if (booking.passengerEmail) {
        const passengerEmail = generateBookingConfirmationEmail(booking);
        await sendEmail(
          booking.passengerEmail,
          passengerEmail.subject,
          passengerEmail.content
        );
      }
      
      // In a real app, you would also send an email to the driver
      // Simulating driver email for demonstration
      const driverEmail = generateBookingNotificationToDriver(booking);
      console.log('Would send to driver:', driverEmail);
      
      // Remove loading notification
      removeNotification(loadingId);
      
      // Success notification with pending status
      addNotification('🕒 Booking request sent! Waiting for driver approval.', 'info');
      
      // Close modal
      setBookingModal({
        isOpen: false,
        ride: null,
      });
      
      // Reset booking form
      setBookingFormData({
        passengerName: '',
        passengerEmail: '',
        passengerPhone: '',
        notes: '',
      });
      
      // In a real app, we would store this booking in a database
      // For demo purposes, we'll simulate the driver approval after a delay
      simulateDriverResponse(booking);
      
    } catch (error) {
      console.error('Booking error:', error);
      addNotification(`Failed to process booking: ${error.message}`, 'error');
      removeNotification(loadingId);
    }
  };
  
  // Simulate driver's response to booking request
  const simulateDriverResponse = (booking) => {
    // Simulate a delay of 3-8 seconds for driver response
    const responseDelay = Math.floor(Math.random() * 5000) + 3000;
    
    setTimeout(() => {
      // 80% chance of approval
      const isApproved = Math.random() < 0.8;
      
      if (isApproved) {
        // Driver approved the booking
        addNotification(`🎉 ${booking.ride.driver} approved your ride request! Your seat has been reserved.`, 'success');
        
        // Update ride's available seats
        const updatedRides = offeredRides.map(ride => {
          if (ride.id === booking.ride.id && ride.seatsAvailable > 0) {
            return { ...ride, seatsAvailable: ride.seatsAvailable - 1 };
          }
          return ride;
        });
        
        setOfferedRides(updatedRides);
        
        // In a real app, you would update the booking status in the database
        console.log('Booking approved:', { ...booking, status: 'approved' });
        
        // Send confirmation email to passenger
        if (booking.passengerEmail) {
          sendEmail(
            booking.passengerEmail,
            'EcoCommute: Your ride request has been approved!',
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #5f8d4e;">Ride Request Approved!</h2>
              <p>Hello ${booking.passengerName},</p>
              <p>Great news! <strong>${booking.ride.driver}</strong> has approved your ride request.</p>
              <p>Your seat is now confirmed for the trip from ${booking.ride.startLocationAddress} to ${booking.ride.destinationAddress} on ${formatDate(booking.ride.departureTime)}.</p>
              <p>Please be on time at the pickup location. Enjoy your ride!</p>
            </div>`
          ).catch(err => console.error('Error sending confirmation email:', err));
        }
      } else {
        // Driver declined the booking
        addNotification(`Sorry, ${booking.ride.driver} couldn't approve your ride request. Please try another ride.`, 'warning');
        
        // In a real app, you would update the booking status in the database
        console.log('Booking declined:', { ...booking, status: 'declined' });
        
        // Send notification email to passenger
        if (booking.passengerEmail) {
          sendEmail(
            booking.passengerEmail,
            'EcoCommute: Your ride request couldn\'t be accommodated',
            `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #e57373;">Ride Request Not Approved</h2>
              <p>Hello ${booking.passengerName},</p>
              <p>Unfortunately, <strong>${booking.ride.driver}</strong> was unable to approve your ride request.</p>
              <p>This could be due to a last-minute change in their plans or other circumstances.</p>
              <p>Please try booking another ride from our available options.</p>
            </div>`
          ).catch(err => console.error('Error sending decline email:', err));
        }
      }
    }, responseDelay);
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
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="vehicleType">
                        Vehicle Type*
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="vehicleType"
                        name="vehicleType"
                        type="text"
                        placeholder="e.g. Toyota Prius, Tesla Model 3"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Please specify your vehicle make and model
                      </p>
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
                <CarpoolMap 
                  carpools={offeredRides} 
                  onBookRide={handleBooking}
                />
              </div>
              
              {/* List of available rides for mobile view - Only render on client */}
              {isClient && (
                <div className="mt-4 md:hidden">
                  <h3 className="text-xl font-bold mb-4">Nearby Rides</h3>
                  {[...mockCarpools, ...offeredRides].length > 0 ? (
                    <div className="divide-y divide-tertiary/30">
                      {[...mockCarpools, ...offeredRides].map((ride) => (
                        <div key={ride.id} className="py-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{ride.driver}</h4>
                              <p className="text-sm text-gray-600">
                                {formatDate(ride.departureTime)}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">From:</span> {ride.startLocationAddress || 'Start location'}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">To:</span> {ride.destinationAddress || 'Destination'}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Vehicle:</span> {ride.vehicleType || 'Not specified'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-primary font-bold">{ride.costPerPerson || ride.cost ? `$${ride.cost}` : 'Free'}</span>
                              <p className="text-sm">{ride.seatsAvailable} seats</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <button 
                              className="bg-accent text-white text-sm py-1 px-3 rounded hover:bg-accent/90 w-full"
                              onClick={() => handleBooking(ride)}
                              disabled={ride.seatsAvailable < 1}
                            >
                              {ride.seatsAvailable < 1 ? 'Fully Booked' : 'Book Seat'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-center py-4">No rides available at the moment</p>
                  )}
                </div>
              )}
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

      {/* Location Selection Modal - Only render on client */}
      {isClient && locationModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 md:w-3/4 lg:w-2/3 h-3/4 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
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
            <p className="text-gray-600 text-sm mb-2">Search for a location or click on the map to select</p>
            <div className="flex-grow" style={{ position: 'relative', width: '100%', height: '100%' }}>
              <LocationPickerMap 
                onLocationSelect={handleMapLocationSelect}
                value={
                  locationModal.fieldType === 'start' 
                    ? formData.startLocation 
                    : formData.destination
                }
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Booking Modal - Only render on client */}
      {isClient && bookingModal.isOpen && bookingModal.ride && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full z-[10000] mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-green-700 mb-4">Book a Ride</h3>
            
            <div className="mb-4 bg-green-50 p-3 rounded-lg">
              <p className="font-semibold">Trip Details:</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Driver:</span>
                <span className="font-medium">{bookingModal.ride.driver}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">From:</span>
                <span className="font-medium">{bookingModal.ride.startLocationAddress}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">To:</span>
                <span className="font-medium">{bookingModal.ride.destinationAddress}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Departure:</span>
                <span className="font-medium">{formatDate(bookingModal.ride.departureTime)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Vehicle:</span>
                <span className="font-medium">{bookingModal.ride.vehicleType || 'Not specified'}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Seats Available:</span>
                <span className="font-medium">{bookingModal.ride.seatsAvailable}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cost:</span>
                <span className="font-medium">${bookingModal.ride.cost || bookingModal.ride.costPerPerson?.replace('$', '') || '0'}</span>
              </div>
            </div>
            
            <form onSubmit={submitBooking}>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="passengerName">
                  Your Name*
                </label>
                <input
                  type="text"
                  id="passengerName"
                  name="passengerName"
                  value={bookingFormData.passengerName}
                  onChange={handleBookingChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="passengerEmail">
                  Email Address*
                </label>
                <input
                  type="email"
                  id="passengerEmail"
                  name="passengerEmail"
                  value={bookingFormData.passengerEmail}
                  onChange={handleBookingChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send booking confirmations to this email
                </p>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="passengerPhone">
                  Phone Number*
                </label>
                <input
                  type="tel"
                  id="passengerPhone"
                  name="passengerPhone"
                  value={bookingFormData.passengerPhone}
                  onChange={handleBookingChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                  Notes for Driver (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={bookingFormData.notes}
                  onChange={handleBookingChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Any special requests or information for the driver..."
                ></textarea>
              </div>
              
              <div className="flex justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setBookingModal({ isOpen: false, ride: null })}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Request Booking
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                By booking this ride, you agree to EcoCommute's Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
} 