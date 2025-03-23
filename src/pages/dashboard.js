import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { logoutUser } from '../lib/firebase';
import Link from 'next/link';
import { useNotifications } from '../contexts/NotificationContext';

// Auth wrapper component to protect routes
const AuthCheck = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

// Mock data for rides
const mockOfferedRides = [
  {
    id: 'ride-1',
    startLocationAddress: 'Downtown SF',
    destinationAddress: 'Stanford University',
    departureTime: '2023-08-15T08:30:00',
    seatsAvailable: 2,
    seatsTotal: 4,
    vehicleType: 'Tesla Model 3',
    cost: 10,
    bookings: [
      {
        id: 'booking-1',
        passengerName: 'Alice Johnson',
        passengerEmail: 'alice@example.com',
        passengerPhone: '555-123-4567',
        status: 'confirmed',
        createdAt: '2023-08-14T14:30:00',
      },
      {
        id: 'booking-2',
        passengerName: 'Bob Smith',
        passengerEmail: 'bob@example.com',
        passengerPhone: '555-987-6543',
        status: 'pending',
        createdAt: '2023-08-14T16:45:00',
      },
    ],
  },
  {
    id: 'ride-2',
    startLocationAddress: 'Berkeley',
    destinationAddress: 'San Jose',
    departureTime: '2023-08-16T17:30:00',
    seatsAvailable: 3,
    seatsTotal: 3,
    vehicleType: 'Honda Civic',
    cost: 8,
    bookings: [],
  },
];

const mockBookedRides = [
  {
    id: 'booking-3',
    ride: {
      id: 'ride-3',
      driver: 'Michael Chen',
      startLocationAddress: 'Oakland',
      destinationAddress: 'Palo Alto',
      departureTime: '2023-08-17T09:00:00',
      vehicleType: 'Toyota Prius',
      cost: 7,
    },
    status: 'confirmed',
    createdAt: '2023-08-15T11:20:00',
  },
  {
    id: 'booking-4',
    ride: {
      id: 'ride-4',
      driver: 'Sarah Williams',
      startLocationAddress: 'Daly City',
      destinationAddress: 'Mountain View',
      departureTime: '2023-08-18T07:45:00',
      vehicleType: 'Ford Escape',
      cost: 12,
    },
    status: 'pending',
    createdAt: '2023-08-15T13:10:00',
  },
];

// Format date for display
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    // Format date in a consistent way
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

export default function DashboardPage() {
  const { getUserProfile, isAuthenticated, loading } = useAuth();
  const { addNotification } = useNotifications();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('rides');
  const [offeredRides, setOfferedRides] = useState([]);
  const [bookedRides, setBookedRides] = useState([]);
  const [showBookingDetails, setShowBookingDetails] = useState(null);
  
  useEffect(() => {
    // In a real app, you would fetch this data from your backend
    setOfferedRides(mockOfferedRides);
    setBookedRides(mockBookedRides);
  }, []);
  
  const handleLogout = async () => {
    try {
      const { success, error } = await logoutUser();
      if (success) {
        addNotification('You have been logged out successfully', 'success');
        router.push('/');
      } else {
        addNotification(`Logout failed: ${error}`, 'error');
      }
    } catch (error) {
      addNotification(`Error during logout: ${error.message}`, 'error');
      console.error('Logout error:', error);
    }
  };
  
  const handleApproveRideRequest = (rideId, bookingId) => {
    // In a real app, you would update this in your database
    setOfferedRides(offeredRides.map(ride => {
      if (ride.id === rideId) {
        return {
          ...ride,
          bookings: ride.bookings.map(booking => {
            if (booking.id === bookingId) {
              return { ...booking, status: 'confirmed' };
            }
            return booking;
          }),
          seatsAvailable: ride.seatsAvailable - 1
        };
      }
      return ride;
    }));
    
    addNotification('Ride request approved', 'success');
  };
  
  const handleDeclineRideRequest = (rideId, bookingId) => {
    // In a real app, you would update this in your database
    setOfferedRides(offeredRides.map(ride => {
      if (ride.id === rideId) {
        return {
          ...ride,
          bookings: ride.bookings.map(booking => {
            if (booking.id === bookingId) {
              return { ...booking, status: 'declined' };
            }
            return booking;
          })
        };
      }
      return ride;
    }));
    
    addNotification('Ride request declined', 'warning');
  };
  
  const handleCancelBooking = (bookingId) => {
    // In a real app, you would update this in your database
    setBookedRides(bookedRides.filter(booking => booking.id !== bookingId));
    addNotification('Booking cancelled successfully', 'info');
  };

  return (
    <Layout>
      <AuthCheck>
        <div className="bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-dark">Dashboard</h1>
                <p className="mt-1 text-gray-600">
                  Manage your carpools and bookings
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
                <Link href="/carpool" className="btn btn-secondary">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Carpool
                </Link>
                <button onClick={handleLogout} className="btn btn-outline">
                  Sign Out
                </button>
              </div>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xl font-bold">
                    {getUserProfile()?.displayName?.charAt(0) || 'U'}
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{getUserProfile()?.displayName}</h2>
                  <p className="text-gray-600">{getUserProfile()?.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Eco Commuter</span>
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                      {offeredRides.length} Rides Offered
                    </span>
                    <span className="bg-secondary/10 text-secondary text-xs px-2 py-1 rounded">
                      {bookedRides.length} Rides Booked
                    </span>
                  </div>
                </div>
                <div className="ml-auto mt-4 md:mt-0">
                  <Link href="/profile" className="text-primary hover:text-primary/80 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('rides')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'rides'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Offered Rides
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'bookings'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Bookings
                </button>
              </nav>
            </div>

            {/* Tab Contents */}
            {activeTab === 'rides' ? (
              <div>
                <h2 className="text-xl font-bold mb-4">Your Offered Rides</h2>
                {offeredRides.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-600 mb-4">You haven't offered any rides yet.</p>
                    <Link href="/carpool" className="btn btn-primary">
                      Offer a Ride
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {offeredRides.map((ride) => (
                      <div key={ride.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                              <h3 className="text-lg font-bold">{ride.startLocationAddress} to {ride.destinationAddress}</h3>
                              <p className="text-gray-600">{formatDate(ride.departureTime)}</p>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm">
                                  <span className="font-medium">Vehicle:</span> {ride.vehicleType}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Available Seats:</span> {ride.seatsAvailable} of {ride.seatsTotal}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium">Cost Per Person:</span> ${ride.cost}
                                </p>
                              </div>
                            </div>
                            <div className="mt-4 md:mt-0 flex flex-col items-end">
                              <div className="text-right mb-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  ride.seatsAvailable > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {ride.seatsAvailable > 0 ? 'Seats Available' : 'Fully Booked'}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <Link href={`/rides/${ride.id}/edit`} className="btn btn-sm btn-outline">
                                  Edit
                                </Link>
                                <button className="btn btn-sm btn-danger">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Booking Requests Section */}
                          {ride.bookings.length > 0 && (
                            <div className="mt-6 border-t border-gray-200 pt-4">
                              <h4 className="font-bold text-gray-700 mb-3">Booking Requests ({ride.bookings.length})</h4>
                              <div className="space-y-4">
                                {ride.bookings.map((booking) => (
                                  <div key={booking.id} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                      <div>
                                        <div className="flex items-center">
                                          <h5 className="font-semibold">{booking.passengerName}</h5>
                                          <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'
                                          }`}>
                                            {booking.status === 'confirmed' ? 'Confirmed' : 
                                             booking.status === 'pending' ? 'Pending' : 
                                             'Declined'}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-600">Requested on: {formatDate(booking.createdAt)}</p>
                                        <button 
                                          onClick={() => setShowBookingDetails(booking.id === showBookingDetails ? null : booking.id)}
                                          className="text-primary text-sm mt-1 flex items-center"
                                        >
                                          {showBookingDetails === booking.id ? 'Hide Details' : 'View Details'}
                                          <svg className={`ml-1 w-4 h-4 transform ${showBookingDetails === booking.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                          </svg>
                                        </button>
                                      </div>
                                      
                                      {booking.status === 'pending' && (
                                        <div className="mt-4 md:mt-0 flex gap-2">
                                          <button 
                                            onClick={() => handleApproveRideRequest(ride.id, booking.id)}
                                            className="btn btn-sm btn-success"
                                          >
                                            Approve
                                          </button>
                                          <button 
                                            onClick={() => handleDeclineRideRequest(ride.id, booking.id)}
                                            className="btn btn-sm btn-danger"
                                          >
                                            Decline
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {showBookingDetails === booking.id && (
                                      <div className="mt-3 bg-white p-3 rounded border border-gray-200 text-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                          <div>
                                            <p><span className="font-medium">Email:</span> {booking.passengerEmail}</p>
                                            <p><span className="font-medium">Phone:</span> {booking.passengerPhone}</p>
                                          </div>
                                          <div>
                                            <p><span className="font-medium">Booking ID:</span> {booking.id}</p>
                                            {booking.notes && (
                                              <p><span className="font-medium">Notes:</span> {booking.notes}</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold mb-4">Your Bookings</h2>
                {bookedRides.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-600 mb-4">You haven't booked any rides yet.</p>
                    <Link href="/carpool" className="btn btn-primary">
                      Find a Ride
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bookedRides.map((booking) => (
                      <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-lg font-bold">{booking.ride.startLocationAddress} to {booking.ride.destinationAddress}</h3>
                            <p className="text-gray-600">{formatDate(booking.ride.departureTime)}</p>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm">
                                <span className="font-medium">Driver:</span> {booking.ride.driver}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Vehicle:</span> {booking.ride.vehicleType}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Cost:</span> ${booking.ride.cost}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Booked on:</span> {formatDate(booking.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 md:mt-0 flex flex-col items-end">
                            <div className="text-right mb-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status === 'confirmed' ? 'Confirmed' : 
                                 booking.status === 'pending' ? 'Pending Approval' : 
                                 'Declined'}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {booking.status !== 'declined' && (
                                <button 
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="btn btn-sm btn-danger"
                                >
                                  Cancel Booking
                                </button>
                              )}
                              <Link 
                                href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(booking.ride.startLocationAddress)}&destination=${encodeURIComponent(booking.ride.destinationAddress)}&travelmode=driving`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline"
                              >
                                View Route
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </AuthCheck>
    </Layout>
  );
} 