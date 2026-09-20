/* TRAVORA BD - Notifications & Alert Service */

(function () {
  const NOTIFICATIONS_KEY = 'travora_notifications';

  function seedDefaultNotifications() {
    const existing = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    if (existing.length === 0) {
      const initialNotifs = [
        {
          id: 'NOTIF-01',
          title: 'Welcome to TRAVORA BD! ✈️',
          message: 'Explore international flights, Bangladesh bus tickets, Bangladesh Railway trains, and top resorts across Cox\'s Bazar, Sajek, and Sylhet.',
          timestamp: new Date().toISOString(),
          read: false,
          type: 'welcome'
        },
        {
          id: 'NOTIF-02',
          title: 'Security Update: Dual Verification Active 🔒',
          message: 'Your phone (+8801712345678) and Gmail address have been verified for secure authentication.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: true,
          type: 'security'
        }
      ];
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(initialNotifs));
    }
  }
  seedDefaultNotifications();

  window.NotificationService = {
    getNotifications() {
      return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]');
    },

    getUnreadCount() {
      const notifs = this.getNotifications();
      return notifs.filter(n => !n.read).length;
    },

    markAllAsRead() {
      const notifs = this.getNotifications();
      notifs.forEach(n => n.read = true);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
    },

    addNotification(title, message, type = 'info') {
      const notifs = this.getNotifications();
      notifs.unshift({
        id: 'NOTIF-' + Date.now(),
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
        type
      });
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs));
    }
  };
})();
