/* TRAVORA BD - Main Android App Controller & Multi-Screen Engine */

(function () {
  // Navigation State
  let currentScreen = 'splash';
  let historyStack = [];
  let isDarkMode = false;
  let isFullScreenMode = false;
  
  // Active Booking Transient State
  let bookingState = {
    serviceType: 'FLIGHT', // FLIGHT, BUS, TRAIN, HOTEL
    title: '',
    serviceDetails: '',
    date: '2026-10-15',
    time: '10:00 AM',
    route: '',
    price: 0,
    selectedSeats: [],
    passengerName: '',
    passengerPhone: '',
    hotelRoomType: ''
  };

  // Filter States
  let flightFilter = { maxPrice: 300000, airline: 'ALL', stops: 'ALL' };
  let busFilter = { operator: 'ALL' };
  let trainFilter = { classCode: 'ALL' };

  // Init App on Load
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });

  function initApp() {
    // Check Dark Mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      toggleDarkMode(true);
    }
    
    // Render Shell Header & Navigation
    renderShell();

    // Splash Timer (Navigate after 2.5s)
    setTimeout(() => {
      const user = window.AuthService.getCurrentUser();
      if (user) {
        navigateTo('home');
      } else {
        navigateTo('welcome');
      }
    }, 2200);
  }

  // Shell Layout Generator
  function renderShell() {
    const root = document.getElementById('root');
    root.innerHTML = `
      <div class="android-viewport-wrapper">
        <div id="device-frame" class="android-device-frame ${isDarkMode ? 'dark' : ''}">
          
          <!-- Top Status Bar -->
          <div class="android-status-bar">
            <span id="android-clock">${getFormattedTime()}</span>
            <div class="camera-notch"></div>
            <div class="flex items-center gap-1.5 text-xs opacity-90">
              <span id="theme-toggle-btn" class="cursor-pointer text-sm mr-1">
                ${isDarkMode ? '☀️' : '🌙'}
              </span>
              <span id="fullscreen-toggle-btn" class="cursor-pointer text-xs font-semibold px-1.5 py-0.5 rounded border border-current opacity-75">
                ${isFullScreenMode ? '📱 Frame' : '🖥️ Full'}
              </span>
              <span>5G</span>
              <span>🔋 98%</span>
            </div>
          </div>

          <!-- Main App Content Container -->
          <div id="screen-container" class="app-screen-container">
            <!-- Screen Content Rendered Here -->
          </div>

          <!-- Android Material 3 Bottom Navigation Bar -->
          <div id="bottom-nav-bar" class="android-nav-bar hidden">
            <div class="nav-item ${currentScreen === 'home' ? 'active' : ''}" onclick="window.App.navigateTo('home')">
              <div class="nav-item-icon-pill">
                <i data-lucide="home" class="w-5 h-5"></i>
              </div>
              <span>Home</span>
            </div>
            <div class="nav-item ${currentScreen === 'map_explore' ? 'active' : ''}" onclick="window.App.navigateTo('map_explore')">
              <div class="nav-item-icon-pill">
                <i data-lucide="map-pin" class="w-5 h-5"></i>
              </div>
              <span>Explore</span>
            </div>
            <div class="nav-item ${currentScreen === 'my_trips' ? 'active' : ''}" onclick="window.App.navigateTo('my_trips')">
              <div class="nav-item-icon-pill">
                <i data-lucide="ticket" class="w-5 h-5"></i>
              </div>
              <span>My Trips</span>
            </div>
            <div class="nav-item ${currentScreen === 'notifications' ? 'active' : ''}" onclick="window.App.navigateTo('notifications')">
              <div class="nav-item-icon-pill relative">
                <i data-lucide="bell" class="w-5 h-5"></i>
                <span id="unread-notif-badge" class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full hidden"></span>
              </div>
              <span>Alerts</span>
            </div>
            <div class="nav-item ${currentScreen === 'profile' ? 'active' : ''}" onclick="window.App.navigateTo('profile')">
              <div class="nav-item-icon-pill">
                <i data-lucide="user" class="w-5 h-5"></i>
              </div>
              <span>Profile</span>
            </div>
          </div>

        </div>
      </div>
    `;

    // Event Listeners for Frame Controls
    document.getElementById('theme-toggle-btn').addEventListener('click', () => toggleDarkMode(!isDarkMode));
    document.getElementById('fullscreen-toggle-btn').addEventListener('click', () => toggleFullScreen());
  }

  function getFormattedTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  function toggleDarkMode(enable) {
    isDarkMode = enable;
    const deviceFrame = document.getElementById('device-frame');
    if (deviceFrame) {
      if (isDarkMode) deviceFrame.classList.add('dark');
      else deviceFrame.classList.remove('dark');
    }
  }

  function toggleFullScreen() {
    isFullScreenMode = !isFullScreenMode;
    const deviceFrame = document.getElementById('device-frame');
    if (deviceFrame) {
      if (isFullScreenMode) deviceFrame.classList.add('full-screen-mode');
      else deviceFrame.classList.remove('full-screen-mode');
    }
    renderShell();
    renderCurrentScreen();
  }

  // Navigation Controller
  function navigateTo(screenId, params = {}) {
    if (currentScreen !== screenId) {
      historyStack.push(currentScreen);
    }
    currentScreen = screenId;
    renderCurrentScreen(params);
  }

  function goBack() {
    if (historyStack.length > 0) {
      currentScreen = historyStack.pop();
      renderCurrentScreen();
    } else {
      navigateTo('home');
    }
  }

  // Master Screen Dispatcher
  function renderCurrentScreen(params = {}) {
    const container = document.getElementById('screen-container');
    const navBar = document.getElementById('bottom-nav-bar');
    if (!container) return;

    // Show/Hide Bottom Nav Bar
    const mainTabScreens = ['home', 'map_explore', 'my_trips', 'notifications', 'profile'];
    if (mainTabScreens.includes(currentScreen)) {
      navBar.classList.remove('hidden');
    } else {
      navBar.classList.add('hidden');
    }

    // Active Tab Icon Styling
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const activeTab = document.querySelector(`.nav-item[onclick*="${currentScreen}"]`);
    if (activeTab) activeTab.classList.add('active');

    // Update Notification Unread Badge
    const unreadCount = window.NotificationService ? window.NotificationService.getUnreadCount() : 0;
    const badge = document.getElementById('unread-notif-badge');
    if (badge) {
      if (unreadCount > 0) badge.classList.remove('hidden');
      else badge.classList.add('hidden');
    }

    // Scroll to Top
    container.scrollTop = 0;

    switch (currentScreen) {
      case 'splash': container.innerHTML = renderSplashScreen(); break;
      case 'welcome': container.innerHTML = renderWelcomeScreen(); break;
      case 'signup': container.innerHTML = renderSignUpScreen(); break;
      case 'phone_otp': container.innerHTML = renderPhoneOtpScreen(); break;
      case 'email_otp': container.innerHTML = renderEmailOtpScreen(); break;
      case 'login': container.innerHTML = renderLoginScreen(); break;
      case 'forgot_password': container.innerHTML = renderForgotPasswordScreen(); break;
      case 'home': container.innerHTML = renderHomeScreen(); break;
      case 'flight_search': container.innerHTML = renderFlightSearchScreen(); break;
      case 'flight_results': container.innerHTML = renderFlightResultsScreen(); break;
      case 'flight_details': container.innerHTML = renderFlightDetailsScreen(params); break;
      case 'bus_search': container.innerHTML = renderBusSearchScreen(); break;
      case 'bus_results': container.innerHTML = renderBusResultsScreen(); break;
      case 'bus_seat_selection': container.innerHTML = renderBusSeatSelectionScreen(params); break;
      case 'train_search': container.innerHTML = renderTrainSearchScreen(); break;
      case 'train_results': container.innerHTML = renderTrainResultsScreen(); break;
      case 'train_details': container.innerHTML = renderTrainDetailsScreen(params); break;
      case 'hotel_search': container.innerHTML = renderHotelSearchScreen(); break;
      case 'hotel_results': container.innerHTML = renderHotelResultsScreen(); break;
      case 'hotel_details': container.innerHTML = renderHotelDetailsScreen(params); break;
      case 'passenger_info': container.innerHTML = renderPassengerInfoScreen(); break;
      case 'payment': container.innerHTML = renderPaymentScreen(); break;
      case 'booking_confirmation': container.innerHTML = renderBookingConfirmationScreen(params); break;
      case 'digital_ticket': container.innerHTML = renderDigitalTicketScreen(params); break;
      case 'map_explore': container.innerHTML = renderMapExploreScreen(); setTimeout(initLeafletMap, 100); break;
      case 'my_trips': container.innerHTML = renderMyTripsScreen(); break;
      case 'notifications': container.innerHTML = renderNotificationsScreen(); break;
      case 'profile': container.innerHTML = renderProfileScreen(); break;
      case 'security_settings': container.innerHTML = renderSecuritySettingsScreen(); break;
      case 'saved_info': container.innerHTML = renderSavedInfoScreen(); break;
      case 'help_support': container.innerHTML = renderHelpSupportScreen(); break;
      case 'terms_conditions': container.innerHTML = renderTermsConditionsScreen(); break;
      case 'privacy_policy': container.innerHTML = renderPrivacyPolicyScreen(); break;
      case 'admin_login': container.innerHTML = renderAdminLoginScreen(); break;
      case 'admin_dashboard': container.innerHTML = renderAdminDashboardScreen(); break;
      default: container.innerHTML = renderHomeScreen(); break;
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  /* ----------------------------------------------------
     SCREEN RENDERERS (38 Screens)
  ---------------------------------------------------- */

  // 1. SPLASH SCREEN
  function renderSplashScreen() {
    return `
      <div class="flex flex-col items-center justify-center min-h-[750px] p-6 text-center bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-950 text-white animate-fade-in">
        <div class="relative mb-6">
          <div class="w-28 h-28 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse-glow border-2 border-blue-400/30">
            <i data-lucide="plane-takeoff" class="w-14 h-14 text-white"></i>
          </div>
          <div class="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg">
            <i data-lucide="map-pin" class="w-5 h-5"></i>
          </div>
        </div>
        <h1 class="text-3xl font-extrabold tracking-wider text-blue-100">TRAVORA BD</h1>
        <p class="text-sm text-blue-200/80 mt-1 font-medium">Bangladesh Travel Super App</p>
        <div class="mt-12 flex flex-col items-center gap-2">
          <div class="w-7 h-7 border-3 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-xs text-blue-300 font-medium">Initializing Secure Gateway...</span>
        </div>
      </div>
    `;
  }

  // 2. WELCOME / ONBOARDING SCREEN
  function renderWelcomeScreen() {
    return `
      <div class="flex flex-col justify-between min-h-[750px] p-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white animate-fade-in">
        <div class="pt-8">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md">
              <i data-lucide="plane" class="w-7 h-7 text-white"></i>
            </div>
            <div>
              <h2 class="text-xl font-bold tracking-tight">TRAVORA BD</h2>
              <p class="text-xs text-slate-400">All-in-One Travel Booking</p>
            </div>
          </div>
          <h1 class="text-3xl font-extrabold leading-tight mb-3">Your Journey Across Bangladesh Begins Here</h1>
          <p class="text-sm text-slate-300 mb-8">Book Flights, Buses, Trains & Luxury Resorts with instant OTP security & BD digital tickets.</p>
          
          <div class="grid grid-cols-2 gap-3 mb-6">
            <div class="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col gap-2">
              <span class="text-2xl">✈️</span>
              <span class="font-bold text-sm">International Flights</span>
              <span class="text-xs text-slate-400">Biman, US-Bangla & Global</span>
            </div>
            <div class="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col gap-2">
              <span class="text-2xl">🚌</span>
              <span class="font-bold text-sm">BD Bus Tickets</span>
              <span class="text-xs text-slate-400">Green Line, Shohag, Hanif</span>
            </div>
            <div class="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col gap-2">
              <span class="text-2xl">🚆</span>
              <span class="font-bold text-sm">Bangladesh Railway</span>
              <span class="text-xs text-slate-400">Suborno & Sonar Bangla</span>
            </div>
            <div class="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col gap-2">
              <span class="text-2xl">🏨</span>
              <span class="font-bold text-sm">Hotels & Resorts</span>
              <span class="text-xs text-slate-400">Cox's Bazar, Sajek, Sylhet</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-3 pb-4">
          <button onclick="window.App.navigateTo('signup')" class="m3-btn-primary">
            Create Account (Sign Up)
          </button>
          <button onclick="window.App.navigateTo('login')" class="m3-btn-outline border-slate-600 text-white">
            Log In to Account
          </button>
        </div>
      </div>
    `;
  }

  // 3. SIGN UP SCREEN (Strictly 4 Fields, NO NAME FIELD)
  function renderSignUpScreen() {
    return `
      <div class="p-6 min-h-[750px] flex flex-col justify-between animate-fade-in">
        <div>
          <div class="flex items-center gap-3 mb-6">
            <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
              <i data-lucide="arrow-left" class="w-6 h-6"></i>
            </button>
            <h1 class="text-2xl font-extrabold">Create Account</h1>
          </div>

          <div class="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl p-4 mb-6 text-xs text-blue-800 dark:text-blue-300">
            <p class="font-semibold mb-1">🔐 Dual OTP Security Active</p>
            <p>Verification codes will be sent to your Bangladeshi Phone Number and Gmail address for instant account activation.</p>
          </div>

          <div id="signup-error-box" class="hidden mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-xs rounded-xl font-medium"></div>

          <form id="signup-form" onsubmit="window.App.handleSignUp(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Bangladeshi Phone Number *</label>
              <div class="relative">
                <span class="absolute left-3 top-3.5 text-sm font-semibold text-slate-500">+880</span>
                <input type="tel" id="signup-phone" placeholder="1712345678" required
                  class="w-full pl-14 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600" />
              </div>
              <span class="text-[11px] text-slate-400 mt-1 block">Only valid Bangladeshi mobile numbers accepted</span>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Gmail / Email Address *</label>
              <input type="email" id="signup-email" placeholder="example@gmail.com" required
                class="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Password *</label>
              <input type="password" id="signup-password" placeholder="8-12 characters (A-z, 0-9)" required
                class="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Confirm Password *</label>
              <input type="password" id="signup-confirm-password" placeholder="Re-enter password" required
                class="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>

            <button type="submit" class="m3-btn-primary mt-4">
              Send Verification OTPs ➔
            </button>
          </form>
        </div>

        <div class="text-center text-xs opacity-75 pt-6">
          Already have an account? 
          <span onclick="window.App.navigateTo('login')" class="text-blue-600 font-bold underline cursor-pointer">Log In</span>
        </div>
      </div>
    `;
  }

  // 4. PHONE OTP VERIFICATION SCREEN
  function renderPhoneOtpScreen() {
    const pending = JSON.parse(sessionStorage.getItem('travora_pending_registration') || '{}');
    return `
      <div class="p-6 min-h-[750px] flex flex-col justify-between animate-fade-in">
        <div>
          <div class="flex items-center gap-3 mb-6">
            <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
              <i data-lucide="arrow-left" class="w-6 h-6"></i>
            </button>
            <h1 class="text-2xl font-extrabold">Phone Verification</h1>
          </div>

          <p class="text-sm opacity-80 mb-4">
            Enter the 6-digit verification OTP sent to your Bangladeshi phone number:
            <span class="font-bold text-blue-600 block mt-1">${pending.phone || '+880 17XXXXXXX'}</span>
          </p>

          <!-- Developer Demo Code Banner -->
          <div class="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-300 mb-6 flex justify-between items-center">
            <span>📱 SMS OTP Code: <strong class="text-base tracking-widest ml-1 font-mono">${pending.phoneOtp || '123456'}</strong></span>
            <span class="text-[10px] bg-amber-200 dark:bg-amber-900 px-2 py-0.5 rounded font-bold">DEV MOCK</span>
          </div>

          <div id="phone-otp-error" class="hidden mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-xs rounded-xl font-medium"></div>

          <div class="flex justify-between gap-2 mb-6">
            <input type="text" maxlength="6" id="phone-otp-input" placeholder="1 2 3 4 5 6"
              class="w-full py-4 text-center tracking-widest font-mono text-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-600" />
          </div>

          <button onclick="window.App.verifyPhoneOtp()" class="m3-btn-primary">
            Verify Phone Number ➔
          </button>
        </div>

        <div class="text-center text-xs opacity-75">
          Step 1 of 2 Verification
        </div>
      </div>
    `;
  }

  // 5. EMAIL OTP VERIFICATION SCREEN
  function renderEmailOtpScreen() {
    const pending = JSON.parse(sessionStorage.getItem('travora_pending_registration') || '{}');
    return `
      <div class="p-6 min-h-[750px] flex flex-col justify-between animate-fade-in">
        <div>
          <div class="flex items-center gap-3 mb-6">
            <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
              <i data-lucide="arrow-left" class="w-6 h-6"></i>
            </button>
            <h1 class="text-2xl font-extrabold">Email Verification</h1>
          </div>

          <p class="text-sm opacity-80 mb-4">
            Phone verified! Now enter the 6-digit OTP code sent to your Gmail/Email address:
            <span class="font-bold text-blue-600 block mt-1">${pending.email || 'user@gmail.com'}</span>
          </p>

          <!-- Developer Demo Code Banner -->
          <div class="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-300 mb-6 flex justify-between items-center">
            <span>📧 Email OTP Code: <strong class="text-base tracking-widest ml-1 font-mono">${pending.emailOtp || '654321'}</strong></span>
            <span class="text-[10px] bg-amber-200 dark:bg-amber-900 px-2 py-0.5 rounded font-bold">DEV MOCK</span>
          </div>

          <div id="email-otp-error" class="hidden mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-xs rounded-xl font-medium"></div>

          <div class="flex justify-between gap-2 mb-6">
            <input type="text" maxlength="6" id="email-otp-input" placeholder="6 5 4 3 2 1"
              class="w-full py-4 text-center tracking-widest font-mono text-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-600" />
          </div>

          <button onclick="window.App.verifyEmailOtp()" class="m3-btn-primary">
            Activate Account & Enter ➔
          </button>
        </div>

        <div class="text-center text-xs opacity-75">
          Step 2 of 2 Verification
        </div>
      </div>
    `;
  }

  // 6. LOGIN SCREEN
  function renderLoginScreen() {
    return `
      <div class="p-6 min-h-[750px] flex flex-col justify-between animate-fade-in">
        <div>
          <div class="flex items-center gap-3 mb-6">
            <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
              <i data-lucide="arrow-left" class="w-6 h-6"></i>
            </button>
            <h1 class="text-2xl font-extrabold">Welcome Back</h1>
          </div>

          <p class="text-sm opacity-80 mb-6">Log in with your verified Bangladeshi phone number and password.</p>

          <div id="login-error-box" class="hidden mb-4 p-3 bg-red-100 border border-red-300 text-red-700 text-xs rounded-xl font-medium"></div>

          <!-- Quick Test Credentials Box -->
          <div class="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl text-xs mb-6 text-blue-800 dark:text-blue-300">
            <p class="font-bold mb-1">💡 Quick Demo Login:</p>
            <p>Phone: <strong>01712345678</strong> | Password: <strong>Demo1234</strong></p>
          </div>

          <form onsubmit="window.App.handleLogin(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Bangladeshi Phone Number</label>
              <input type="tel" id="login-phone" placeholder="01712345678" required
                class="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Password</label>
              <input type="password" id="login-password" placeholder="••••••••" required
                class="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>

            <div class="flex justify-end">
              <span onclick="window.App.navigateTo('forgot_password')" class="text-xs text-blue-600 font-bold hover:underline cursor-pointer">
                Forgot Password?
              </span>
            </div>

            <button type="submit" class="m3-btn-primary mt-2">
              Log In ➔
            </button>
          </form>
        </div>

        <div class="text-center text-xs opacity-75 pt-6">
          Don't have an account? 
          <span onclick="window.App.navigateTo('signup')" class="text-blue-600 font-bold underline cursor-pointer">Sign Up</span>
        </div>
      </div>
    `;
  }

  // 7. FORGOT PASSWORD SCREEN
  function renderForgotPasswordScreen() {
    return `
      <div class="p-6 min-h-[750px] flex flex-col justify-between animate-fade-in">
        <div>
          <div class="flex items-center gap-3 mb-6">
            <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
              <i data-lucide="arrow-left" class="w-6 h-6"></i>
            </button>
            <h1 class="text-2xl font-extrabold">Reset Password</h1>
          </div>

          <p class="text-sm opacity-80 mb-6">Enter your registered Bangladeshi phone number to receive an account reset OTP.</p>

          <form onsubmit="event.preventDefault(); alert('Reset OTP sent to your registered phone number. Verification code: 882910'); window.App.navigateTo('login')" class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Registered Phone Number</label>
              <input type="tel" placeholder="01712345678" required
                class="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600" />
            </div>

            <button type="submit" class="m3-btn-primary mt-4">
              Send Password Reset OTP
            </button>
          </form>
        </div>
      </div>
    `;
  }

  // 8. HOME SCREEN
  function renderHomeScreen() {
    const userLocation = window.LocationService.getUserLocation();
    const mockData = window.TRAVORA_MOCK;
    const user = window.AuthService.getCurrentUser();

    return `
      <div class="p-4 space-y-5 animate-fade-in">
        <!-- Header Location & User Info -->
        <div class="flex justify-between items-center bg-blue-600 text-white p-4 rounded-3xl shadow-lg">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-xl font-bold">
              🗺️
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Current Location</span>
              <h2 class="text-sm font-bold flex items-center gap-1 cursor-pointer" onclick="window.App.navigateTo('map_explore')">
                ${userLocation.name} <i data-lucide="chevron-down" class="w-4 h-4"></i>
              </h2>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.App.navigateTo('admin_login')" class="p-2 bg-white/15 rounded-full text-xs font-bold px-2.5">
              Admin ⚙️
            </button>
          </div>
        </div>

        <!-- Global Travel Search Bar -->
        <div class="relative cursor-pointer" onclick="window.App.navigateTo('hotel_search')">
          <input type="text" readonly placeholder="Search Flights, Buses, Trains, Hotels..."
            class="w-full pl-11 pr-4 py-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium cursor-pointer shadow-sm" />
          <i data-lucide="search" class="w-5 h-5 absolute left-3.5 top-3.5 opacity-50"></i>
        </div>

        <!-- Main Category Grid Launchers -->
        <div>
          <h3 class="text-xs font-bold uppercase tracking-wider opacity-70 mb-3">Book Travel Services</h3>
          <div class="grid grid-cols-4 gap-3">
            <div onclick="window.App.navigateTo('flight_search')" class="m3-card m3-card-interactive p-3 flex flex-col items-center justify-center gap-1 text-center cursor-pointer">
              <div class="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                <i data-lucide="plane" class="w-6 h-6"></i>
              </div>
              <span class="text-xs font-bold mt-1">Flights</span>
            </div>

            <div onclick="window.App.navigateTo('bus_search')" class="m3-card m3-card-interactive p-3 flex flex-col items-center justify-center gap-1 text-center cursor-pointer">
              <div class="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <i data-lucide="bus" class="w-6 h-6"></i>
              </div>
              <span class="text-xs font-bold mt-1">Bus</span>
            </div>

            <div onclick="window.App.navigateTo('train_search')" class="m3-card m3-card-interactive p-3 flex flex-col items-center justify-center gap-1 text-center cursor-pointer">
              <div class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                <i data-lucide="train" class="w-6 h-6"></i>
              </div>
              <span class="text-xs font-bold mt-1">Train</span>
            </div>

            <div onclick="window.App.navigateTo('hotel_search')" class="m3-card m3-card-interactive p-3 flex flex-col items-center justify-center gap-1 text-center cursor-pointer">
              <div class="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                <i data-lucide="building" class="w-6 h-6"></i>
              </div>
              <span class="text-xs font-bold mt-1">Hotels</span>
            </div>
          </div>
        </div>

        <!-- Upcoming Trip Card Banner -->
        <div class="m3-card p-4 bg-gradient-to-r from-indigo-900 to-blue-900 text-white relative overflow-hidden">
          <div class="flex justify-between items-center mb-2">
            <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-500/30 rounded-full border border-blue-400/40">Upcoming Trip</span>
            <span class="text-xs font-semibold text-blue-200">Oct 15, 2026</span>
          </div>
          <h4 class="text-base font-extrabold mb-1">Dhaka (DAC) ➔ London (LHR)</h4>
          <p class="text-xs text-blue-200/80 mb-3">Biman Bangladesh BG-084 • Seat 14A</p>
          <button onclick="window.App.navigateTo('my_trips')" class="px-4 py-2 bg-white text-blue-950 font-bold text-xs rounded-xl shadow">
            View Digital Pass 🎫
          </button>
        </div>

        <!-- Popular BD Destinations -->
        <div>
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-xs font-bold uppercase tracking-wider opacity-70">Popular BD Destinations</h3>
            <span onclick="window.App.navigateTo('hotel_search')" class="text-xs text-blue-600 font-bold cursor-pointer">See All</span>
          </div>
          <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            ${mockData.destinations.map(dest => `
              <div onclick="window.App.navigateTo('hotel_results')" class="min-w-[160px] m3-card m3-card-interactive cursor-pointer flex-shrink-0">
                <img src="${dest.image}" class="w-full h-24 object-cover" />
                <div class="p-2.5">
                  <h4 class="text-xs font-bold">${dest.name}</h4>
                  <p class="text-[10px] opacity-75">${dest.title}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Nearby Hotels Banner -->
        <div class="m3-card p-4 flex items-center justify-between bg-slate-100 dark:bg-slate-800">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-blue-600 text-white rounded-2xl">
              <i data-lucide="navigation" class="w-6 h-6"></i>
            </div>
            <div>
              <h4 class="text-xs font-bold">Explore Nearby Facilities</h4>
              <p class="text-[11px] opacity-70">Interactive Leaflet map with distance in km/meters</p>
            </div>
          </div>
          <button onclick="window.App.navigateTo('map_explore')" class="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
            Map
          </button>
        </div>
      </div>
    `;
  }

  // 9. FLIGHT SEARCH SCREEN
  function renderFlightSearchScreen() {
    const mockData = window.TRAVORA_MOCK;
    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex items-center gap-3">
          <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
            <i data-lucide="arrow-left" class="w-6 h-6"></i>
          </button>
          <h1 class="text-xl font-extrabold">Search International Flights</h1>
        </div>

        <div class="m3-card p-4 space-y-4">
          <!-- Trip Type Selector -->
          <div class="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
            <button class="flex-1 py-2 rounded-xl bg-blue-600 text-white shadow">Round Trip</button>
            <button class="flex-1 py-2 rounded-xl opacity-75">One Way</button>
          </div>

          <!-- From Airport -->
          <div>
            <label class="block text-[11px] font-bold uppercase opacity-70 mb-1">From Airport</label>
            <select id="flight-from" class="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold">
              ${mockData.airports.map(a => `<option value="${a.code}">${a.city} (${a.code}) - ${a.name}</option>`).join('')}
            </select>
          </div>

          <!-- To Airport -->
          <div>
            <label class="block text-[11px] font-bold uppercase opacity-70 mb-1">To Destination</label>
            <select id="flight-to" class="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold">
              ${mockData.airports.map((a, i) => `<option value="${a.code}" ${i === 6 ? 'selected' : ''}>${a.city} (${a.code}) - ${a.name}</option>`).join('')}
            </select>
          </div>

          <!-- Travel Dates & Class -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold uppercase opacity-70 mb-1">Departure Date</label>
              <input type="date" value="2026-10-15" class="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold" />
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase opacity-70 mb-1">Cabin Class</label>
              <select class="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold">
                <option>Economy</option>
                <option>Premium Economy</option>
                <option>Business Class</option>
              </select>
            </div>
          </div>

          <button onclick="window.App.navigateTo('flight_results')" class="m3-btn-primary mt-2">
            Search Flights ✈️
          </button>
        </div>
      </div>
    `;
  }

  // 10. FLIGHT RESULTS SCREEN
  function renderFlightResultsScreen() {
    const flights = window.TRAVORA_MOCK.flights;
    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
              <i data-lucide="arrow-left" class="w-6 h-6"></i>
            </button>
            <div>
              <h1 class="text-lg font-extrabold">Flight Results</h1>
              <p class="text-xs opacity-75">${flights.length} Available Flights Found</p>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          ${flights.map(flight => `
            <div onclick="window.App.selectFlight('${flight.id}')" class="m3-card m3-card-interactive p-4 space-y-3 cursor-pointer">
              <div class="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xl">${flight.airlineCode === 'BG' ? '✈️' : '🟡'}</span>
                  <div>
                    <h3 class="text-xs font-bold">${flight.airlineName}</h3>
                    <span class="text-[10px] opacity-75">${flight.flightNumber} • ${flight.cabinClass}</span>
                  </div>
                </div>
                <span class="text-sm font-extrabold text-blue-600">৳${flight.price.toLocaleString()}</span>
              </div>

              <div class="flex justify-between items-center text-center">
                <div>
                  <h4 class="text-base font-extrabold">${flight.departTime}</h4>
                  <span class="text-xs font-bold">${flight.fromCode}</span>
                </div>
                <div class="flex flex-col items-center">
                  <span class="text-[10px] opacity-75">${flight.duration}</span>
                  <div class="w-20 h-0.5 bg-blue-500 relative my-1">
                    <div class="w-2 h-2 bg-blue-600 rounded-full absolute -top-0.75 left-1/2 -translate-x-1/2"></div>
                  </div>
                  <span class="text-[10px] text-emerald-600 font-bold">${flight.stops === 0 ? 'Direct' : '1 Stop'}</span>
                </div>
                <div>
                  <h4 class="text-base font-extrabold">${flight.arrivalTime}</h4>
                  <span class="text-xs font-bold">${flight.toCode}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 11. BUS SEARCH SCREEN
  function renderBusSearchScreen() {
    const cities = window.TRAVORA_MOCK.busCities;
    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex items-center gap-3">
          <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
            <i data-lucide="arrow-left" class="w-6 h-6"></i>
          </button>
          <h1 class="text-xl font-extrabold">Bangladesh Bus Tickets</h1>
        </div>

        <div class="m3-card p-4 space-y-4">
          <div>
            <label class="block text-[11px] font-bold uppercase opacity-70 mb-1">Departure City</label>
            <select class="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold">
              ${cities.map(c => `<option>${c}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase opacity-70 mb-1">Destination City</label>
            <select class="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold">
              ${cities.map((c, i) => `<option ${i === 2 ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase opacity-70 mb-1">Travel Date</label>
            <input type="date" value="2026-10-15" class="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold" />
          </div>

          <button onclick="window.App.navigateTo('bus_results')" class="m3-btn-primary">
            Search Buses 🚌
          </button>
        </div>
      </div>
    `;
  }

  // 12. BUS RESULTS SCREEN
  function renderBusResultsScreen() {
    const buses = window.TRAVORA_MOCK.buses;
    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex items-center gap-3">
          <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
            <i data-lucide="arrow-left" class="w-6 h-6"></i>
          </button>
          <div>
            <h1 class="text-lg font-extrabold">Bus Schedule</h1>
            <p class="text-xs opacity-75">Dhaka ➔ Cox's Bazar</p>
          </div>
        </div>

        <div class="space-y-3">
          ${buses.map(bus => `
            <div onclick="window.App.selectBus('${bus.id}')" class="m3-card m3-card-interactive p-4 space-y-3 cursor-pointer">
              <div class="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-2">
                <div>
                  <h3 class="text-sm font-extrabold text-blue-600">${bus.operator}</h3>
                  <span class="text-[10px] opacity-75 font-semibold">${bus.busType}</span>
                </div>
                <span class="text-base font-extrabold">৳${bus.fare.toLocaleString()}</span>
              </div>

              <div class="flex justify-between items-center text-xs font-semibold">
                <div>Dep: <strong class="text-slate-900 dark:text-white">${bus.departureTime}</strong></div>
                <div class="text-emerald-600 font-bold">${bus.availableSeats} Seats Left</div>
                <div>Arr: <strong class="text-slate-900 dark:text-white">${bus.arrivalTime}</strong></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 13. BUS VISUAL SEAT SELECTION SCREEN
  function renderBusSeatSelectionScreen(params) {
    const bus = window.TRAVORA_MOCK.buses.find(b => b.id === (params.busId || 'BUS-GL-101')) || window.TRAVORA_MOCK.buses[0];
    const seats = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'];
    const booked = ['A3', 'B2', 'C4'];

    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex items-center gap-3">
          <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
            <i data-lucide="arrow-left" class="w-6 h-6"></i>
          </button>
          <div>
            <h1 class="text-lg font-extrabold">Select Bus Seats</h1>
            <p class="text-xs opacity-75">${bus.operator} • ৳${bus.fare}/seat</p>
          </div>
        </div>

        <!-- Seat Legend -->
        <div class="flex justify-around bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-xs font-bold">
          <div class="flex items-center gap-1.5"><div class="w-4 h-4 bg-white border border-slate-400 rounded"></div> Available</div>
          <div class="flex items-center gap-1.5"><div class="w-4 h-4 bg-blue-600 rounded"></div> Selected</div>
          <div class="flex items-center gap-1.5"><div class="w-4 h-4 bg-slate-500 rounded"></div> Booked</div>
        </div>

        <!-- Bus Layout Container -->
        <div class="m3-card p-4 space-y-4">
          <div class="flex justify-between items-center text-xs font-bold opacity-60 border-b border-slate-200 dark:border-slate-800 pb-2">
            <span>FRONT / DRIVER</span>
            <span>☸️ Steering</span>
          </div>

          <div class="bus-seat-grid">
            ${seats.map(s => {
              const isBooked = booked.includes(s);
              const isSelected = bookingState.selectedSeats.includes(s);
              let stateClass = isBooked ? 'booked' : (isSelected ? 'selected' : 'available');
              return `<div onclick="window.App.toggleBusSeat('${s}', ${isBooked})" class="bus-seat ${stateClass}">${s}</div>`;
            }).join('')}
          </div>
        </div>

        <!-- Total Fare & Checkout -->
        <div class="m3-card p-4 flex justify-between items-center bg-blue-600 text-white">
          <div>
            <span class="text-xs opacity-80 block">Selected: ${bookingState.selectedSeats.join(', ') || 'None'}</span>
            <span class="text-lg font-extrabold">Total: ৳${(bookingState.selectedSeats.length * bus.fare).toLocaleString()}</span>
          </div>
          <button onclick="window.App.proceedBusBooking('${bus.id}')" class="px-5 py-2.5 bg-white text-blue-950 font-bold rounded-xl text-xs shadow">
            Continue ➔
          </button>
        </div>
      </div>
    `;
  }

  // 14. TRAIN SEARCH SCREEN
  function renderTrainSearchScreen() {
    const stations = window.TRAVORA_MOCK.railwayStations;
    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex items-center gap-3">
          <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
            <i data-lucide="arrow-left" class="w-6 h-6"></i>
          </button>
          <h1 class="text-xl font-extrabold">Bangladesh Railway</h1>
        </div>

        <div class="m3-card p-4 space-y-4">
          <div>
            <label class="block text-[11px] font-bold uppercase opacity-70 mb-1">From Station</label>
            <select class="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold">
              ${stations.map(s => `<option>${s.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase opacity-70 mb-1">To Station</label>
            <select class="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold">
              ${stations.map((s, i) => `<option ${i === 2 ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase opacity-70 mb-1">Journey Date</label>
            <input type="date" value="2026-10-15" class="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold" />
          </div>

          <button onclick="window.App.navigateTo('train_results')" class="m3-btn-primary">
            Search Trains 🚆
          </button>
        </div>
      </div>
    `;
  }

  // 15. TRAIN RESULTS SCREEN
  function renderTrainResultsScreen() {
    const trains = window.TRAVORA_MOCK.trains;
    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex items-center gap-3">
          <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
            <i data-lucide="arrow-left" class="w-6 h-6"></i>
          </button>
          <div>
            <h1 class="text-lg font-extrabold">Available BD Trains</h1>
            <p class="text-xs opacity-75">Dhaka Kamalapur ➔ Chattogram</p>
          </div>
        </div>

        <div class="space-y-3">
          ${trains.map(train => `
            <div onclick="window.App.selectTrain('${train.id}')" class="m3-card m3-card-interactive p-4 space-y-3 cursor-pointer">
              <div class="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <div>
                  <h3 class="text-sm font-extrabold text-blue-600">${train.name} (${train.number})</h3>
                  <span class="text-[10px] text-red-500 font-bold">Off Day: ${train.offDay}</span>
                </div>
                <span class="text-xs font-bold">${train.departureTime} - ${train.arrivalTime}</span>
              </div>

              <div class="flex gap-2 overflow-x-auto">
                ${train.classes.map(c => `
                  <div class="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-center min-w-[100px]">
                    <span class="text-[10px] font-bold block opacity-75">${c.name}</span>
                    <span class="text-xs font-extrabold text-blue-600 block">৳${c.fare}</span>
                    <span class="text-[9px] text-emerald-600 font-bold">${c.availability} Seats</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 16. HOTEL SEARCH SCREEN
  function renderHotelSearchScreen() {
    const mockData = window.TRAVORA_MOCK;
    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex items-center gap-3">
          <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
            <i data-lucide="arrow-left" class="w-6 h-6"></i>
          </button>
          <h1 class="text-xl font-extrabold">Hotels & Resorts BD</h1>
        </div>

        <div class="m3-card p-4 space-y-4">
          <div>
            <label class="block text-[11px] font-bold uppercase opacity-70 mb-1">Destination / City</label>
            <select class="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold">
              ${mockData.destinations.map(d => `<option>${d.name}</option>`).join('')}
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-[11px] font-bold uppercase opacity-70 mb-1">Check-In</label>
              <input type="date" value="2026-10-15" class="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold" />
            </div>
            <div>
              <label class="block text-[11px] font-bold uppercase opacity-70 mb-1">Check-Out</label>
              <input type="date" value="2026-10-17" class="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold" />
            </div>
          </div>

          <button onclick="window.App.navigateTo('hotel_results')" class="m3-btn-primary">
            Search Resorts 🏨
          </button>
        </div>
      </div>
    `;
  }

  // 17. HOTEL RESULTS SCREEN
  function renderHotelResultsScreen() {
    const hotels = window.TRAVORA_MOCK.hotels;
    const userLoc = window.LocationService.getUserLocation();

    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex items-center gap-3">
          <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
            <i data-lucide="arrow-left" class="w-6 h-6"></i>
          </button>
          <div>
            <h1 class="text-lg font-extrabold">Hotels in Bangladesh</h1>
            <p class="text-xs opacity-75">${hotels.length} Properties Available</p>
          </div>
        </div>

        <div class="space-y-4">
          ${hotels.map(h => {
            const distance = window.LocationService.calculateDistance(userLoc.lat, userLoc.lng, h.lat, h.lng);
            return `
              <div onclick="window.App.selectHotel('${h.id}')" class="m3-card m3-card-interactive cursor-pointer space-y-2">
                <img src="${h.image}" class="w-full h-44 object-cover" />
                <div class="p-4 space-y-2">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="text-base font-extrabold">${h.name}</h3>
                      <p class="text-xs opacity-75">${h.location}</p>
                    </div>
                    <span class="px-2 py-1 bg-amber-500 text-white font-bold text-xs rounded-lg">★ ${h.rating}</span>
                  </div>

                  <div class="flex justify-between items-center text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span class="text-blue-600 font-bold">📍 ${distance} from current position</span>
                    <span class="text-sm font-extrabold">৳${h.pricePerNight.toLocaleString()}<span class="text-[10px] font-normal opacity-75">/night</span></span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // 18. PASSENGER INFO & CHECKOUT FORM
  function renderPassengerInfoScreen() {
    const user = window.AuthService.getCurrentUser() || {};
    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex items-center gap-3">
          <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
            <i data-lucide="arrow-left" class="w-6 h-6"></i>
          </button>
          <h1 class="text-xl font-extrabold">Passenger Information</h1>
        </div>

        <div class="m3-card p-4 space-y-4">
          <div>
            <label class="block text-[11px] font-bold uppercase opacity-70 mb-1">Full Passenger Name *</label>
            <input type="text" id="passenger-name" value="Kabir Hossain" required
              class="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold" />
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase opacity-70 mb-1">Verified Contact Phone *</label>
            <input type="tel" id="passenger-phone" value="${user.phone || '+8801712345678'}" readonly
              class="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-500" />
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase opacity-70 mb-1">NID / Passport Number</label>
            <input type="text" value="1992837465201"
              class="w-full p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-bold" />
          </div>

          <button onclick="window.App.proceedToPayment()" class="m3-btn-primary">
            Proceed to Payment 💳
          </button>
        </div>
      </div>
    `;
  }

  // 19. PAYMENT SCREEN (Itemized Breakdown & Gateways)
  function renderPaymentScreen() {
    const base = bookingState.price || 5000;
    const vat = Math.round(base * 0.15);
    const fee = 50;
    const total = base + vat + fee;

    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex items-center gap-3">
          <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
            <i data-lucide="arrow-left" class="w-6 h-6"></i>
          </button>
          <h1 class="text-xl font-extrabold">Secure Payment</h1>
        </div>

        <!-- Fare Itemization Breakdown -->
        <div class="m3-card p-4 space-y-2">
          <h3 class="text-xs font-bold uppercase opacity-70 border-b border-slate-200 dark:border-slate-800 pb-2">Price Breakdown</h3>
          <div class="flex justify-between text-xs font-semibold">
            <span>Base Fare (${bookingState.title})</span>
            <span>৳${base.toLocaleString()}</span>
          </div>
          <div class="flex justify-between text-xs font-semibold">
            <span>Govt VAT (15%)</span>
            <span>৳${vat.toLocaleString()}</span>
          </div>
          <div class="flex justify-between text-xs font-semibold">
            <span>Convenience Fee</span>
            <span>৳${fee}</span>
          </div>
          <div class="flex justify-between text-sm font-extrabold pt-2 border-t border-slate-200 dark:border-slate-800 text-blue-600">
            <span>Total Payable Amount</span>
            <span>৳${total.toLocaleString()}</span>
          </div>
        </div>

        <!-- Payment Gateway Options -->
        <div class="m3-card p-4 space-y-3">
          <h3 class="text-xs font-bold uppercase opacity-70">Select Payment Method</h3>
          <div class="space-y-2">
            <label class="flex items-center justify-between p-3 border border-pink-300 dark:border-pink-900 bg-pink-50 dark:bg-pink-950/40 rounded-2xl cursor-pointer">
              <span class="flex items-center gap-2 font-bold text-xs text-pink-700 dark:text-pink-300">
                <span>💖</span> bKash Mobile Banking
              </span>
              <input type="radio" name="payment_gateway" value="bKash" checked />
            </label>

            <label class="flex items-center justify-between p-3 border border-orange-300 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/40 rounded-2xl cursor-pointer">
              <span class="flex items-center gap-2 font-bold text-xs text-orange-700 dark:text-orange-300">
                <span>🟠</span> Nagad Gateway
              </span>
              <input type="radio" name="payment_gateway" value="Nagad" />
            </label>

            <label class="flex items-center justify-between p-3 border border-purple-300 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/40 rounded-2xl cursor-pointer">
              <span class="flex items-center gap-2 font-bold text-xs text-purple-700 dark:text-purple-300">
                <span>🚀</span> Rocket / Upay
              </span>
              <input type="radio" name="payment_gateway" value="Rocket" />
            </label>

            <label class="flex items-center justify-between p-3 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 rounded-2xl cursor-pointer">
              <span class="flex items-center gap-2 font-bold text-xs">
                <span>💳</span> Visa / Mastercard / AMEX
              </span>
              <input type="radio" name="payment_gateway" value="Card" />
            </label>
          </div>

          <button onclick="window.App.confirmPayment()" class="m3-btn-primary mt-3">
            Pay ৳${total.toLocaleString()} & Confirm 🔒
          </button>
        </div>
      </div>
    `;
  }

  // 20. DIGITAL TICKET SCREEN (QR Code + PNR)
  function renderDigitalTicketScreen(params) {
    const booking = window.BookingService.getBookingById(params.bookingId) || window.BookingService.getAllBookings()[0];
    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
              <i data-lucide="arrow-left" class="w-6 h-6"></i>
            </button>
            <h1 class="text-xl font-extrabold">Digital Ticket Pass</h1>
          </div>
          <button onclick="window.print()" class="p-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
            Print 🖨️
          </button>
        </div>

        <div class="digital-ticket-card p-6 space-y-4">
          <!-- Ticket Header -->
          <div class="flex justify-between items-center border-b-2 border-dashed border-slate-300 pb-4">
            <div>
              <span class="text-[10px] font-bold text-blue-600 tracking-wider uppercase">${booking.serviceType} TICKET</span>
              <h2 class="text-lg font-extrabold">${booking.title}</h2>
              <span class="text-xs font-mono text-slate-500">PNR: ${booking.pnr}</span>
            </div>
            <div class="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
              ✔
            </div>
          </div>

          <!-- Route Details -->
          <div class="grid grid-cols-2 gap-3 text-xs font-bold">
            <div>
              <span class="text-[10px] opacity-60 block">PASSENGER</span>
              <span>${booking.passengerName}</span>
            </div>
            <div>
              <span class="text-[10px] opacity-60 block">DATE & TIME</span>
              <span>${booking.date} • ${booking.time}</span>
            </div>
            <div>
              <span class="text-[10px] opacity-60 block">SEAT / ROOM</span>
              <span>${booking.seatOrRoom}</span>
            </div>
            <div>
              <span class="text-[10px] opacity-60 block">TOTAL PAID</span>
              <span class="text-emerald-600 font-extrabold">৳${booking.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <!-- Barcode & QR Code Section -->
          <div class="pt-4 border-t border-slate-200 flex flex-col items-center gap-2">
            <div class="w-32 h-32 bg-slate-100 p-2 rounded-xl flex items-center justify-center border">
              <!-- Inline QR SVG Mock -->
              <svg class="w-full h-full text-slate-900" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#ffffff" />
                <rect x="10" y="10" width="30" height="30" fill="#000" />
                <rect x="60" y="10" width="30" height="30" fill="#000" />
                <rect x="10" y="60" width="30" height="30" fill="#000" />
                <rect x="18" y="18" width="14" height="14" fill="#fff" />
                <rect x="68" y="18" width="14" height="14" fill="#fff" />
                <rect x="18" y="68" width="14" height="14" fill="#fff" />
                <rect x="45" y="45" width="10" height="10" fill="#000" />
              </svg>
            </div>
            <span class="text-[10px] font-mono opacity-60">ID: #${booking.id}</span>
          </div>
        </div>
      </div>
    `;
  }

  // 21. MAP & EXPLORE SCREEN (Leaflet Interactive Map)
  function renderMapExploreScreen() {
    return `
      <div class="p-4 space-y-3 animate-fade-in">
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-extrabold">Map & Travel Distance</h1>
          <span class="text-xs text-blue-600 font-bold">GPS Active 📍</span>
        </div>

        <!-- Map Leaflet Viewport -->
        <div id="leaflet-map" class="shadow-md"></div>

        <div class="m3-card p-3 space-y-2">
          <h3 class="text-xs font-bold uppercase opacity-70">Nearby Landmarks & Distance</h3>
          <div class="space-y-2 text-xs font-semibold">
            <div class="flex justify-between p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <span>✈️ Hazrat Shahjalal Airport (DAC)</span>
              <span class="text-blue-600 font-bold">4.2 km</span>
            </div>
            <div class="flex justify-between p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <span>🚆 Kamalapur Railway Station</span>
              <span class="text-blue-600 font-bold">6.8 km</span>
            </div>
            <div class="flex justify-between p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <span>🏨 Pan Pacific Sonargaon Dhaka</span>
              <span class="text-blue-600 font-bold">850 meters</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function initLeafletMap() {
    if (window.L && document.getElementById('leaflet-map')) {
      const map = L.map('leaflet-map').setView([23.7513, 90.3929], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);

      window.TRAVORA_MOCK.mapMarkers.forEach(m => {
        L.marker([m.lat, m.lng]).addTo(map).bindPopup(`<b>${m.name}</b><br>${m.info}`);
      });
    }
  }

  // 22. MY TRIPS SCREEN
  function renderMyTripsScreen() {
    const bookings = window.BookingService.getAllBookings();
    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <h1 class="text-2xl font-extrabold">My Trips & Bookings</h1>

        <div class="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          <button class="flex-1 py-2 rounded-xl bg-blue-600 text-white shadow">Upcoming (${bookings.filter(b=>b.status==='UPCOMING').length})</button>
          <button class="flex-1 py-2 rounded-xl opacity-75">Completed</button>
          <button class="flex-1 py-2 rounded-xl opacity-75">Cancelled</button>
        </div>

        <div class="space-y-3">
          ${bookings.map(b => `
            <div class="m3-card p-4 space-y-3">
              <div class="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md">
                  ${b.serviceType}
                </span>
                <span class="text-xs font-bold text-emerald-600">${b.status}</span>
              </div>

              <div>
                <h3 class="text-sm font-extrabold">${b.title}</h3>
                <p class="text-xs opacity-75">${b.serviceDetails} • ${b.date}</p>
              </div>

              <div class="flex justify-between items-center pt-2">
                <span class="text-sm font-extrabold">৳${b.totalPrice.toLocaleString()}</span>
                <button onclick="window.App.viewDigitalTicket('${b.id}')" class="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl">
                  Digital Pass 🎫
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 23. NOTIFICATIONS SCREEN
  function renderNotificationsScreen() {
    const notifs = window.NotificationService.getNotifications();
    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-extrabold">Alerts & Notifications</h1>
          <button onclick="window.NotificationService.markAllAsRead(); window.App.renderCurrentScreen();" class="text-xs text-blue-600 font-bold">
            Mark all read
          </button>
        </div>

        <div class="space-y-3">
          ${notifs.map(n => `
            <div class="m3-card p-4 space-y-1 ${!n.read ? 'border-l-4 border-l-blue-600' : ''}">
              <h3 class="text-xs font-bold flex justify-between">
                <span>${n.title}</span>
                <span class="text-[10px] font-normal opacity-60">${new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </h3>
              <p class="text-xs opacity-80">${n.message}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 24. PROFILE SCREEN
  function renderProfileScreen() {
    const user = window.AuthService.getCurrentUser() || { phone: '+8801712345678', email: 'travora.user@gmail.com' };
    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <h1 class="text-2xl font-extrabold">User Profile</h1>

        <div class="m3-card p-4 flex items-center gap-4">
          <div class="w-14 h-14 bg-blue-600 text-white rounded-3xl flex items-center justify-center font-bold text-xl shadow">
            👤
          </div>
          <div>
            <h3 class="text-sm font-extrabold">${user.phone}</h3>
            <span class="text-xs opacity-75">${user.email}</span>
            <div class="flex gap-2 mt-1">
              <span class="text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">Phone Verified ✔</span>
              <span class="text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">Email Verified ✔</span>
            </div>
          </div>
        </div>

        <div class="m3-card divide-y divide-slate-200 dark:divide-slate-800">
          <div onclick="window.App.navigateTo('security_settings')" class="p-4 flex justify-between items-center text-xs font-bold cursor-pointer">
            <span>🔒 Security & Password Settings</span>
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </div>
          <div onclick="window.App.navigateTo('terms_conditions')" class="p-4 flex justify-between items-center text-xs font-bold cursor-pointer">
            <span>📜 Terms & Conditions</span>
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </div>
          <div onclick="window.App.navigateTo('privacy_policy')" class="p-4 flex justify-between items-center text-xs font-bold cursor-pointer">
            <span>🛡️ Privacy Policy</span>
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </div>
        </div>

        <button onclick="window.AuthService.logout(); window.App.navigateTo('welcome');" class="m3-btn-outline border-red-500 text-red-500">
          Log Out of Account
        </button>
      </div>
    `;
  }

  // 25. SECURITY SETTINGS SCREEN
  function renderSecuritySettingsScreen() {
    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex items-center gap-3">
          <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
            <i data-lucide="arrow-left" class="w-6 h-6"></i>
          </button>
          <h1 class="text-xl font-extrabold">Security Settings</h1>
        </div>

        <div class="m3-card p-4 space-y-4">
          <h3 class="text-xs font-bold uppercase opacity-70">Active Protection</h3>
          <div class="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300">
            ✔ Dual OTP Authentication Enforced<br/>
            ✔ 5-Attempt Brute-Force Rate Limiting Active<br/>
            ✔ Session Tokens Encrypted
          </div>
        </div>
      </div>
    `;
  }

  // 26. TERMS & CONDITIONS SCREEN
  function renderTermsConditionsScreen() {
    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex items-center gap-3">
          <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
            <i data-lucide="arrow-left" class="w-6 h-6"></i>
          </button>
          <h1 class="text-xl font-extrabold">Terms & Conditions</h1>
        </div>
        <div class="m3-card p-4 text-xs space-y-2">
          <p>TRAVORA BD is operated under Bangladesh Digital Travel Guidelines. All booking tickets are issued directly with authorized partners.</p>
        </div>
      </div>
    `;
  }

  // 27. PRIVACY POLICY SCREEN
  function renderPrivacyPolicyScreen() {
    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex items-center gap-3">
          <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
            <i data-lucide="arrow-left" class="w-6 h-6"></i>
          </button>
          <h1 class="text-xl font-extrabold">Privacy Policy</h1>
        </div>
        <div class="m3-card p-4 text-xs space-y-2">
          <p>We strictly protect user mobile numbers, emails, and transaction history. No location or private data is shared with third parties without permission.</p>
        </div>
      </div>
    `;
  }

  // 28. ADMIN LOGIN SCREEN
  function renderAdminLoginScreen() {
    return `
      <div class="p-6 min-h-[750px] flex flex-col justify-between animate-fade-in">
        <div>
          <div class="flex items-center gap-3 mb-6">
            <button onclick="window.App.goBack()" class="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800">
              <i data-lucide="arrow-left" class="w-6 h-6"></i>
            </button>
            <h1 class="text-2xl font-extrabold">Admin Portal</h1>
          </div>

          <div class="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 rounded-2xl text-xs mb-6 text-purple-800 dark:text-purple-300">
            <p class="font-bold mb-1">🔐 Admin Demo Credentials:</p>
            <p>Username: <strong>admin</strong> | Password: <strong>Admin@1234</strong></p>
          </div>

          <form onsubmit="window.App.handleAdminLogin(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Admin Username</label>
              <input type="text" id="admin-user" value="admin" required class="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-medium" />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Password</label>
              <input type="password" id="admin-pass" value="Admin@1234" required class="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-sm font-medium" />
            </div>

            <button type="submit" class="m3-btn-primary mt-2">
              Log In to Admin Dashboard ➔
            </button>
          </form>
        </div>
      </div>
    `;
  }

  // 29. ADMIN DASHBOARD SCREEN
  function renderAdminDashboardScreen() {
    const metrics = window.AdminController.getAdminMetrics();
    return `
      <div class="p-4 space-y-4 animate-fade-in">
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-extrabold">Admin Control Panel</h1>
          <button onclick="window.AdminController.logoutAdmin(); window.App.navigateTo('home')" class="text-xs text-red-500 font-bold">
            Logout
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="p-3 bg-blue-600 text-white rounded-2xl">
            <span class="text-[10px] uppercase font-bold opacity-80">Total Revenue</span>
            <h3 class="text-base font-extrabold">৳${metrics.totalRevenue.toLocaleString()}</h3>
          </div>
          <div class="p-3 bg-emerald-600 text-white rounded-2xl">
            <span class="text-[10px] uppercase font-bold opacity-80">Total Bookings</span>
            <h3 class="text-base font-extrabold">${metrics.totalBookings}</h3>
          </div>
        </div>

        <div class="m3-card p-4 space-y-3">
          <h3 class="text-xs font-bold uppercase opacity-70">Manage Inventories</h3>
          <div class="grid grid-cols-2 gap-2 text-xs font-bold">
            <div class="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">🏨 Hotels (${metrics.hotelsCount})</div>
            <div class="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">🚌 Bus Routes (${metrics.busesCount})</div>
            <div class="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">🚆 Railway (${metrics.trainsCount})</div>
            <div class="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">✈️ Flights (${metrics.flightsCount})</div>
          </div>
        </div>
      </div>
    `;
  }

  /* ----------------------------------------------------
     ACTION HANDLERS & API WRAPPERS
  ---------------------------------------------------- */

  window.App = {
    navigateTo,
    goBack,
    renderCurrentScreen,

    // Sign Up Handler
    handleSignUp(e) {
      e.preventDefault();
      const phone = document.getElementById('signup-phone').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const confirmPassword = document.getElementById('signup-confirm-password').value;

      const res = window.AuthService.signUp({ phone, email, password, confirmPassword });
      if (!res.success) {
        const errBox = document.getElementById('signup-error-box');
        errBox.innerText = res.message;
        errBox.classList.remove('hidden');
      } else {
        navigateTo('phone_otp');
      }
    },

    verifyPhoneOtp() {
      const code = document.getElementById('phone-otp-input').value;
      const res = window.AuthService.verifyPhoneOtp(code);
      if (!res.success) {
        const errBox = document.getElementById('phone-otp-error');
        errBox.innerText = res.message;
        errBox.classList.remove('hidden');
      } else {
        navigateTo('email_otp');
      }
    },

    verifyEmailOtp() {
      const code = document.getElementById('email-otp-input').value;
      const res = window.AuthService.verifyEmailOtp(code);
      if (!res.success) {
        const errBox = document.getElementById('email-otp-error');
        errBox.innerText = res.message;
        errBox.classList.remove('hidden');
      } else {
        alert('🎉 Account Activated Successfully! Welcome to TRAVORA BD.');
        navigateTo('home');
      }
    },

    handleLogin(e) {
      e.preventDefault();
      const phone = document.getElementById('login-phone').value;
      const password = document.getElementById('login-password').value;

      const res = window.AuthService.login(phone, password);
      if (!res.success) {
        const errBox = document.getElementById('login-error-box');
        errBox.innerText = res.message;
        errBox.classList.remove('hidden');
      } else {
        navigateTo('home');
      }
    },

    selectFlight(flightId) {
      const flight = window.TRAVORA_MOCK.flights.find(f => f.id === flightId);
      bookingState = {
        serviceType: 'FLIGHT',
        title: `${flight.fromCity} ➔ ${flight.toCity}`,
        serviceDetails: `${flight.airlineName} (${flight.flightNumber})`,
        date: '2026-10-15',
        time: flight.departTime,
        route: `${flight.fromCode} ➔ ${flight.toCode}`,
        price: flight.price,
        seatOrRoom: 'Seat 14A (Economy)',
        passengerName: 'Kabir Hossain'
      };
      navigateTo('passenger_info');
    },

    selectBus(busId) {
      navigateTo('bus_seat_selection', { busId });
    },

    toggleBusSeat(seatNum, isBooked) {
      if (isBooked) return;
      const idx = bookingState.selectedSeats.indexOf(seatNum);
      if (idx >= 0) bookingState.selectedSeats.splice(idx, 1);
      else bookingState.selectedSeats.push(seatNum);
      renderCurrentScreen();
    },

    proceedBusBooking(busId) {
      if (bookingState.selectedSeats.length === 0) {
        alert('Please select at least 1 bus seat.');
        return;
      }
      const bus = window.TRAVORA_MOCK.buses.find(b => b.id === busId);
      bookingState.serviceType = 'BUS';
      bookingState.title = `${bus.from} ➔ ${bus.to}`;
      bookingState.serviceDetails = `${bus.operator} (${bus.busType})`;
      bookingState.date = '2026-10-15';
      bookingState.time = bus.departureTime;
      bookingState.price = bookingState.selectedSeats.length * bus.fare;
      bookingState.seatOrRoom = `Seats: ${bookingState.selectedSeats.join(', ')}`;
      navigateTo('passenger_info');
    },

    selectTrain(trainId) {
      const train = window.TRAVORA_MOCK.trains.find(t => t.id === trainId);
      bookingState = {
        serviceType: 'TRAIN',
        title: `${train.name} (${train.number})`,
        serviceDetails: `${train.from} ➔ ${train.to}`,
        date: '2026-10-15',
        time: train.departureTime,
        route: 'Dhaka ➔ Chattogram',
        price: train.classes[0].fare,
        seatOrRoom: `Class: ${train.classes[0].name} (Coach J)`,
        passengerName: 'Kabir Hossain'
      };
      navigateTo('passenger_info');
    },

    selectHotel(hotelId) {
      const hotel = window.TRAVORA_MOCK.hotels.find(h => h.id === hotelId);
      bookingState = {
        serviceType: 'HOTEL',
        title: hotel.name,
        serviceDetails: `${hotel.destination} • ${hotel.rooms[0].type}`,
        date: '2026-10-15',
        time: 'Check-in 12:00 PM',
        route: hotel.location,
        price: hotel.pricePerNight,
        seatOrRoom: hotel.rooms[0].type,
        passengerName: 'Kabir Hossain'
      };
      navigateTo('passenger_info');
    },

    proceedToPayment() {
      const name = document.getElementById('passenger-name').value;
      bookingState.passengerName = name;
      navigateTo('payment');
    },

    confirmPayment() {
      const newBooking = window.BookingService.createBooking(bookingState);
      navigateTo('digital_ticket', { bookingId: newBooking.id });
    },

    viewDigitalTicket(bookingId) {
      navigateTo('digital_ticket', { bookingId });
    },

    handleAdminLogin(e) {
      e.preventDefault();
      const u = document.getElementById('admin-user').value;
      const p = document.getElementById('admin-pass').value;
      const res = window.AdminController.loginAdmin(u, p);
      if (res.success) {
        navigateTo('admin_dashboard');
      } else {
        alert(res.message);
      }
    }
  };
})();
