/* TRAVORA BD - Secure Authentication & Dual OTP Verification Service */

(function () {
  const USERS_KEY = 'travora_users_db';
  const CURRENT_USER_KEY = 'travora_current_user';
  const LOGIN_ATTEMPTS_KEY = 'travora_login_attempts';

  // Seed default demo user if empty
  function seedDefaultUser() {
    const existingUsers = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (existingUsers.length === 0) {
      const demoUser = {
        phone: '+8801712345678',
        email: 'travora.user@gmail.com',
        // In real backend: bcrypt hash. Never plaintext.
        passwordHash: 'Demo1234', 
        phoneVerified: true,
        emailVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        savedPassengers: [
          { id: 'p1', name: 'Kabir Hossain', type: 'Adult', gender: 'Male', nid: '1992837465201' }
        ]
      };
      existingUsers.push(demoUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(existingUsers));
    }
  }
  seedDefaultUser();

  window.AuthService = {
    // Validate Bangladeshi phone format
    validateBdPhone(phone) {
      const cleaned = phone.replace(/[\s-]/g, '');
      // Format: 013-019 (11 digits) or +88013-+88019 (14 chars)
      const bdPhoneRegex = /^(?:\+8801|01)[3-9]\d{8}$/;
      return bdPhoneRegex.test(cleaned);
    },

    // Clean phone number to standard format (+8801XXXXXXXXX)
    formatBdPhone(phone) {
      let cleaned = phone.replace(/[\s-]/g, '');
      if (cleaned.startsWith('01')) {
        cleaned = '+88' + cleaned;
      }
      return cleaned;
    },

    // Validate email format
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    // Password validation: 8-12 chars, 1 uppercase, 1 lowercase, 1 number
    validatePassword(password) {
      if (!password || password.length < 8 || password.length > 12) {
        return { valid: false, message: 'Password must be between 8 and 12 characters.' };
      }
      if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter.' };
      }
      if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter.' };
      }
      if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number.' };
      }
      return { valid: true };
    },

    // Sign Up Initialization (Strictly NO Name Field)
    signUp({ phone, email, password, confirmPassword }) {
      if (!phone || !this.validateBdPhone(phone)) {
        return { success: false, message: 'Please enter a valid Bangladeshi mobile number (e.g. 01712345678).' };
      }
      if (!email || !this.validateEmail(email)) {
        return { success: false, message: 'Please enter a valid Gmail or email address.' };
      }
      
      const pwdVal = this.validatePassword(password);
      if (!pwdVal.valid) {
        return { success: false, message: pwdVal.message };
      }

      if (password !== confirmPassword) {
        return { success: false, message: 'Password and Confirm Password do not match.' };
      }

      const formattedPhone = this.formatBdPhone(phone);
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      
      if (users.find(u => u.phone === formattedPhone)) {
        return { success: false, message: 'An account with this phone number already exists.' };
      }

      // Generate Dual OTP codes (6 digits)
      const phoneOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

      const pendingRegistration = {
        phone: formattedPhone,
        email,
        passwordHash: password, // In production: secure salt + hash
        phoneOtp,
        emailOtp,
        phoneVerified: false,
        emailVerified: false,
        expiresAt,
        attemptsLeft: 3
      };

      sessionStorage.setItem('travora_pending_registration', JSON.stringify(pendingRegistration));

      return {
        success: true,
        message: 'Validation successful. OTPs sent to phone and email.',
        pendingData: { phone: formattedPhone, email, phoneOtpDemo: phoneOtp, emailOtpDemo: emailOtp }
      };
    },

    // Verify Phone OTP Step
    verifyPhoneOtp(inputOtp) {
      const pending = JSON.parse(sessionStorage.getItem('travora_pending_registration') || 'null');
      if (!pending) {
        return { success: false, message: 'Registration session expired. Please sign up again.' };
      }

      if (Date.now() > pending.expiresAt) {
        return { success: false, message: 'OTP has expired. Please request a new code.' };
      }

      if (pending.attemptsLeft <= 0) {
        return { success: false, message: 'Maximum verification attempts exceeded. Session locked.' };
      }

      if (inputOtp !== pending.phoneOtp) {
        pending.attemptsLeft -= 1;
        sessionStorage.setItem('travora_pending_registration', JSON.stringify(pending));
        return { success: false, message: `Incorrect Phone OTP. ${pending.attemptsLeft} attempts remaining.` };
      }

      pending.phoneVerified = true;
      sessionStorage.setItem('travora_pending_registration', JSON.stringify(pending));
      return { success: true, message: 'Phone verified successfully.' };
    },

    // Verify Email OTP Step
    verifyEmailOtp(inputOtp) {
      const pending = JSON.parse(sessionStorage.getItem('travora_pending_registration') || 'null');
      if (!pending) {
        return { success: false, message: 'Registration session expired. Please sign up again.' };
      }

      if (!pending.phoneVerified) {
        return { success: false, message: 'Please verify your phone number first.' };
      }

      if (Date.now() > pending.expiresAt) {
        return { success: false, message: 'OTP has expired. Please request a new code.' };
      }

      if (pending.attemptsLeft <= 0) {
        return { success: false, message: 'Maximum verification attempts exceeded.' };
      }

      if (inputOtp !== pending.emailOtp) {
        pending.attemptsLeft -= 1;
        sessionStorage.setItem('travora_pending_registration', JSON.stringify(pending));
        return { success: false, message: `Incorrect Email OTP. ${pending.attemptsLeft} attempts remaining.` };
      }

      pending.emailVerified = true;
      
      // Both verifications succeed: Activate Account
      const newUser = {
        phone: pending.phone,
        email: pending.email,
        passwordHash: pending.passwordHash,
        phoneVerified: true,
        emailVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        savedPassengers: []
      };

      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      // Auto login user
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      sessionStorage.removeItem('travora_pending_registration');

      return { success: true, message: 'Account activated successfully!', user: newUser };
    },

    // Login with Brute-Force Rate Limiting
    login(phone, password) {
      const formattedPhone = this.formatBdPhone(phone);
      const attempts = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
      const userAttempts = attempts[formattedPhone] || { count: 0, lockUntil: 0 };

      if (Date.now() < userAttempts.lockUntil) {
        const secondsRemaining = Math.ceil((userAttempts.lockUntil - Date.now()) / 1000);
        return { success: false, message: `Account locked due to excessive failed attempts. Try again in ${secondsRemaining}s.` };
      }

      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const user = users.find(u => u.phone === formattedPhone && u.passwordHash === password);

      if (!user) {
        userAttempts.count += 1;
        if (userAttempts.count >= 5) {
          userAttempts.lockUntil = Date.now() + 2 * 60 * 1000; // 2 minute lock
          attempts[formattedPhone] = userAttempts;
          localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
          return { success: false, message: '5 failed login attempts. Account temporarily locked for 2 minutes.' };
        }

        attempts[formattedPhone] = userAttempts;
        localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
        return { success: false, message: `Invalid phone number or password. (${5 - userAttempts.count} attempts left)` };
      }

      // Reset failed attempts on success
      delete attempts[formattedPhone];
      localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));

      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return { success: true, user };
    },

    // Logout
    logout() {
      localStorage.removeItem(CURRENT_USER_KEY);
    },

    // Get Active Logged-in User
    getCurrentUser() {
      return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null');
    }
  };
})();
