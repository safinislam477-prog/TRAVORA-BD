/* TRAVORA BD - Secure Admin Dashboard Controller */

(function () {
  window.AdminController = {
    isAdminLoggedIn() {
      return sessionStorage.getItem('travora_admin_logged_in') === 'true';
    },

    loginAdmin(username, password) {
      if (username === 'admin' && password === 'Admin@1234') {
        sessionStorage.setItem('travora_admin_logged_in', 'true');
        return { success: true };
      }
      return { success: false, message: 'Invalid Admin Credentials' };
    },

    logoutAdmin() {
      sessionStorage.removeItem('travora_admin_logged_in');
    },

    getAdminMetrics() {
      const users = JSON.parse(localStorage.getItem('travora_users_db') || '[]');
      const bookings = JSON.parse(localStorage.getItem('travora_user_bookings') || '[]');
      
      const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      const activeBookings = bookings.filter(b => b.status === 'UPCOMING').length;

      return {
        totalUsers: users.length,
        totalBookings: bookings.length,
        activeBookings,
        totalRevenue,
        hotelsCount: window.TRAVORA_MOCK.hotels.length,
        busesCount: window.TRAVORA_MOCK.buses.length,
        trainsCount: window.TRAVORA_MOCK.trains.length,
        flightsCount: window.TRAVORA_MOCK.flights.length
      };
    }
  };
})();
