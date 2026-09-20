/* TRAVORA BD - Unified Booking & Digital Ticket Service */

(function () {
  const BOOKINGS_KEY = 'travora_user_bookings';
  const NOTIFICATIONS_KEY = 'travora_notifications';

  // Seed sample initial upcoming and completed trips
  function seedDefaultBookings() {
    const existing = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    if (existing.length === 0) {
      const sampleBookings = [
        {
          id: 'TRV-FL-88912',
          serviceType: 'FLIGHT',
          title: 'Dhaka to London (LHR)',
          serviceDetails: 'Biman Bangladesh Airlines (BG-084)',
          date: '2026-10-15',
          time: '10:30 AM',
          route: 'DAC ➔ LHR',
          passengerName: 'Verified User',
          seatOrRoom: 'Seat 14A (Economy)',
          status: 'UPCOMING',
          price: 88500,
          vat: 13275,
          serviceFee: 50,
          totalPrice: 101825,
          paymentMethod: 'bKash Tokenized',
          pnr: 'BG-P72X9A',
          bookedAt: new Date().toISOString()
        },
        {
          id: 'TRV-BUS-33104',
          serviceType: 'BUS',
          title: 'Dhaka to Cox\'s Bazar',
          serviceDetails: 'Green Line Paribahan (Scania AC)',
          date: '2026-08-20',
          time: '10:00 PM',
          route: 'Dhaka ➔ Cox\'s Bazar',
          passengerName: 'Verified User',
          seatOrRoom: 'Seats: A1, A2',
          status: 'COMPLETED',
          price: 3600,
          vat: 540,
          serviceFee: 50,
          totalPrice: 4190,
          paymentMethod: 'Nagad Gateway',
          pnr: 'GL-98214',
          bookedAt: '2026-08-15T10:00:00.000Z'
        }
      ];
      localStorage.getItem(BOOKINGS_KEY) || localStorage.setItem(BOOKINGS_KEY, JSON.stringify(sampleBookings));
    }
  }
  seedDefaultBookings();

  window.BookingService = {
    // Get all user bookings
    getAllBookings() {
      return JSON.parse(localStorage.getItem(BOOKINGS_KEY) || '[]');
    },

    // Get booking by ID
    getBookingById(id) {
      const bookings = this.getAllBookings();
      return bookings.find(b => b.id === id);
    },

    // Create a new booking
    createBooking(bookingData) {
      const bookings = this.getAllBookings();
      
      const pnrCode = (bookingData.serviceType.substring(0, 2) + '-' + Math.random().toString(36).substring(2, 8).toUpperCase());
      const bookingId = 'TRV-' + bookingData.serviceType + '-' + Math.floor(10000 + Math.random() * 90000);

      const basePrice = bookingData.price || 0;
      const vat = Math.round(basePrice * 0.15); // 15% VAT
      const serviceFee = 50; // 50 BDT convenience fee
      const totalPrice = basePrice + vat + serviceFee;

      const newBooking = {
        id: bookingId,
        serviceType: bookingData.serviceType, // FLIGHT, BUS, TRAIN, HOTEL
        title: bookingData.title,
        serviceDetails: bookingData.serviceDetails,
        date: bookingData.date,
        time: bookingData.time || 'N/A',
        route: bookingData.route || 'Bangladesh',
        passengerName: bookingData.passengerName || 'Travora Passenger',
        seatOrRoom: bookingData.seatOrRoom || 'N/A',
        status: 'UPCOMING',
        price: basePrice,
        vat,
        serviceFee,
        totalPrice,
        paymentMethod: bookingData.paymentMethod || 'bKash Mobile Banking',
        pnr: pnrCode,
        bookedAt: new Date().toISOString()
      };

      bookings.unshift(newBooking);
      localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));

      // Trigger automatic Notification
      this.sendBookingNotification(newBooking);

      return newBooking;
    },

    // Cancel Booking
    cancelBooking(bookingId) {
      const bookings = this.getAllBookings();
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        booking.status = 'CANCELLED';
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
        
        // Add cancellation notification
        const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
        notifications.unshift({
          id: 'NOTIF-' + Date.now(),
          title: 'Booking Cancelled',
          message: `Your booking #${booking.id} (${booking.title}) has been cancelled. Refund will be processed in 3-5 business days.`,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'cancellation'
        });
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
        return true;
      }
      return false;
    },

    // Notification Helper
    sendBookingNotification(booking) {
      const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
      notifications.unshift({
        id: 'NOTIF-' + Date.now(),
        title: `${booking.serviceType} Booking Confirmed! 🎉`,
        message: `Your reservation for ${booking.title} on ${booking.date} is confirmed. Booking ID: #${booking.id}, PNR: ${booking.pnr}.`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'confirmation'
      });
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
  };
})();
