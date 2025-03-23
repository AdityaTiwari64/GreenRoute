// This is a mock email service for demonstration purposes
// In a real application, you would integrate with a proper email service like SendGrid, Mailchimp, etc.

const mockEmailDelay = 1000; // Simulate network delay

export const sendEmail = async (to, subject, content) => {
  console.log(`Sending email to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content: ${content}`);
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate success with 95% probability
      if (Math.random() < 0.95) {
        resolve({
          success: true,
          messageId: `mock-${Date.now()}`,
          timestamp: new Date().toISOString(),
        });
      } else {
        // Simulate occasional failure
        reject(new Error('Failed to send email. Please try again.'));
      }
    }, mockEmailDelay);
  });
};

export const generateBookingConfirmationEmail = (booking) => {
  return {
    subject: `EcoCommute: Your ride with ${booking.ride.driver} is confirmed!`,
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #5f8d4e;">Your Ride is Confirmed!</h2>
        <p>Hello ${booking.passengerName},</p>
        <p>Your ride with <strong>${booking.ride.driver}</strong> has been successfully booked.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="color: #5f8d4e; margin-top: 0;">Ride Details:</h3>
          <p><strong>From:</strong> ${booking.ride.startLocationAddress}</p>
          <p><strong>To:</strong> ${booking.ride.destinationAddress}</p>
          <p><strong>Departure:</strong> ${new Date(booking.ride.departureTime).toLocaleString()}</p>
          <p><strong>Cost:</strong> ${booking.ride.costPerPerson || 'Free'}</p>
        </div>
        
        <p>The driver has been notified of your booking and will contact you if needed.</p>
        <p>Need to cancel? Please do so at least 2 hours before the scheduled departure.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 12px;">
            Thank you for using EcoCommute! By carpooling, you're helping reduce carbon emissions and making our planet greener.
          </p>
        </div>
      </div>
    `,
  };
};

export const generateBookingNotificationToDriver = (booking) => {
  return {
    subject: `EcoCommute: New passenger for your ride on ${new Date(booking.ride.departureTime).toLocaleDateString()}`,
    content: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #5f8d4e;">New Ride Booking!</h2>
        <p>Hello ${booking.ride.driver},</p>
        <p>Good news! <strong>${booking.passengerName}</strong> has booked a seat in your carpool.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3 style="color: #5f8d4e; margin-top: 0;">Ride Details:</h3>
          <p><strong>From:</strong> ${booking.ride.startLocationAddress}</p>
          <p><strong>To:</strong> ${booking.ride.destinationAddress}</p>
          <p><strong>Departure:</strong> ${new Date(booking.ride.departureTime).toLocaleString()}</p>
          <p><strong>Passenger Phone:</strong> ${booking.passengerPhone}</p>
          ${booking.notes ? `<p><strong>Notes from passenger:</strong> ${booking.notes}</p>` : ''}
        </div>
        
        <p>You now have ${booking.ride.seatsAvailable - 1} seats remaining in your carpool.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #666; font-size: 12px;">
            Thank you for using EcoCommute and sharing your ride! Together we're reducing traffic and emissions.
          </p>
        </div>
      </div>
    `,
  };
}; 