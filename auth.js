/* ==========================================================================
   ARGOS - USER AUTHENTICATION & SESSION CONTROLLER (auth.js)
   ========================================================================== */

// Simple Synth for Auth Audios
class AuthSynth {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
    } catch (e) {
      console.warn('AudioContext not supported in this browser.');
    }
  }

  beep(freq = 600, type = 'sine', duration = 0.08) {
    this.init();
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (err) {}
  }

  speak(text) {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 1.05;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }
  }
}

const authSynth = new AuthSynth();

// Helper functions for UI interaction sounds
function playClickSound() {
  authSynth.beep(750, 'sine', 0.04);
}

function playHoverSound() {
  authSynth.beep(900, 'sine', 0.02);
}

// Global functions (needed for inline HTML onclick handlers)
window.togglePasswordVisibility = function(inputId, buttonEl) {
  playClickSound();
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const icon = buttonEl.querySelector('i');
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fa-solid fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fa-solid fa-eye';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // --- DATABASE & SESSION STATE MANAGEMENT ---
  const DEFAULT_USERS = [
    { fullname: "Carlos Mendoza (Operador)", username: "operador", password: "123", role: "operador" },
    { fullname: "Sofía Ruiz (Estudiante)", username: "estudiante", password: "123", role: "estudiante" },
    { fullname: "Prof. Alejandro Silva", username: "docente", password: "123", role: "docente" }
  ];

  // Initialize simulated DB
  if (!localStorage.getItem('argos_users')) {
    localStorage.setItem('argos_users', JSON.stringify(DEFAULT_USERS));
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem('argos_users')) || [];
    } catch (e) {
      return [];
    }
  }

  function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('argos_users', JSON.stringify(users));
  }

  function getActiveSession() {
    try {
      return JSON.parse(localStorage.getItem('argos_session')) || null;
    } catch (e) {
      return null;
    }
  }

  function setActiveSession(user) {
    localStorage.setItem('argos_session', JSON.stringify(user));
  }

  function removeActiveSession() {
    localStorage.removeItem('argos_session');
  }

  // --- ELEMENT SELECTORS ---
  const btnOpenLogin = document.getElementById('btn-open-login');
  const btnOpenRegister = document.getElementById('btn-open-register');
  const btnLogout = document.getElementById('btn-logout');
  
  const loginModal = document.getElementById('login-modal-overlay');
  const registerModal = document.getElementById('register-modal-overlay');
  
  const btnCloseLogin = document.getElementById('btn-close-login');
  const btnCloseRegister = document.getElementById('btn-close-register');
  
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  const linkToRegister = document.getElementById('link-to-register');
  const linkToLogin = document.getElementById('link-to-login');
  
  const loginErrorMsg = document.getElementById('login-error-msg');
  const registerErrorMsg = document.getElementById('register-error-msg');
  
  // Profile Selector link
  const nativeProfileSelect = document.getElementById('profile-select');

  // --- MODAL CONTROLS ---
  function showModal(modalEl) {
    modalEl.classList.remove('hidden');
    authSynth.beep(500, 'sine', 0.1);
    
    // Add visual glow reaction on form inputs
    const firstInput = modalEl.querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 150);
  }

  function hideModal(modalEl) {
    modalEl.classList.add('hidden');
    authSynth.beep(300, 'sine', 0.05);
    
    // Clear forms and errors
    const form = modalEl.querySelector('form');
    if (form) form.reset();
    
    const errors = modalEl.querySelectorAll('.auth-error-msg');
    errors.forEach(err => err.classList.add('hidden'));

    // Reset password field types
    const passwords = modalEl.querySelectorAll('input[type="text"]');
    passwords.forEach(pwd => {
      if (pwd.id.includes('password')) pwd.type = 'password';
    });
    const eyeIcons = modalEl.querySelectorAll('.btn-toggle-password i');
    eyeIcons.forEach(icon => { icon.className = 'fa-solid fa-eye'; });
  }

  // Bind Openers
  if (btnOpenLogin) btnOpenLogin.addEventListener('click', () => showModal(loginModal));
  if (btnOpenRegister) btnOpenRegister.addEventListener('click', () => showModal(registerModal));
  
  // Bind Closers
  if (btnCloseLogin) btnCloseLogin.addEventListener('click', () => hideModal(loginModal));
  if (btnCloseRegister) btnCloseRegister.addEventListener('click', () => hideModal(registerModal));

  // Switch between modals
  if (linkToRegister) {
    linkToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      hideModal(loginModal);
      setTimeout(() => showModal(registerModal), 200);
    });
  }
  if (linkToLogin) {
    linkToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      hideModal(registerModal);
      setTimeout(() => showModal(loginModal), 200);
    });
  }

  // Close modals when clicking overlay background
  [loginModal, registerModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          hideModal(modal);
        }
      });
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (loginModal && !loginModal.classList.contains('hidden')) hideModal(loginModal);
      if (registerModal && !registerModal.classList.contains('hidden')) hideModal(registerModal);
    }
  });

  // Add click/hover sounds to new buttons/inputs
  function attachAuthSounds() {
    const elList = document.querySelectorAll('.auth-modal-card button, .auth-modal-card input, .auth-modal-card select, .auth-modal-card a, .user-session-container button');
    elList.forEach(el => {
      el.addEventListener('mouseenter', playHoverSound);
      el.addEventListener('click', playClickSound);
    });
  }
  
  // Execute after small delays to ensure elements render
  setTimeout(attachAuthSounds, 300);

  // --- CHECK AND INJECT EXPERT ROLE ---
  window.checkAndInjectExpertRole = function() {
    const isExpertUnlocked = localStorage.getItem('argos_expert_unlocked') === 'true';
    if (isExpertUnlocked) {
      if (nativeProfileSelect && !nativeProfileSelect.querySelector('option[value="expert"]')) {
        const opt = document.createElement('option');
        opt.value = 'expert';
        opt.textContent = 'Controlador Experto 🏆';
        nativeProfileSelect.appendChild(opt);
      }
      const regSelect = document.getElementById('register-role');
      if (regSelect && !regSelect.querySelector('option[value="expert"]')) {
        const opt = document.createElement('option');
        opt.value = 'expert';
        opt.textContent = 'Controlador Experto (Acceso Total) 🏆';
        regSelect.appendChild(opt);
      }
    }
  };

  // --- PANEL LOCK CONTROL ---
  function updatePanelLocks(role) {
    const flightCard = document.getElementById('flight-control-card');
    const studentModule = document.getElementById('student-module');
    const teacherModule = document.getElementById('teacher-module');
    
    const currentRole = role || 'publico';
    
    // Flight Control & Student Labs are always unlocked for all users (including guest public)
    if (flightCard) {
      flightCard.classList.remove('panel-locked');
    }
    
    if (studentModule) {
      studentModule.classList.remove('panel-locked');
    }
    
    // Teacher Console is unlocked for 'docente', 'operador' and 'expert'
    if (teacherModule) {
      if (currentRole === 'docente' || currentRole === 'operador' || currentRole === 'expert') {
        teacherModule.classList.remove('panel-locked');
      } else {
        teacherModule.classList.add('panel-locked');
      }
    }
  }

  // Intercept click on lock overlay triggers
  document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('btn-lock-action-trigger')) {
      playClickSound();
      showModal(loginModal);
    }
    if (e.target && e.target.classList.contains('btn-bypass-lock')) {
      playClickSound();
      const parentCard = e.target.closest('.panel-locked');
      if (parentCard) {
        parentCard.classList.remove('panel-locked');
        
        // Flight Control specific bypass logic
        if (parentCard.id === 'flight-control-card') {
          const manualControls = document.getElementById('manual-controls-card');
          if (manualControls) manualControls.classList.remove('locked');
          const flightStatus = document.getElementById('flight-system-status');
          if (flightStatus) {
            flightStatus.className = 'system-level unlocked';
            flightStatus.textContent = 'CONTROL MANUAL (DEMO)';
          }
          const droneFeed = document.getElementById('drone-feed-overlay');
          if (droneFeed) {
            droneFeed.classList.remove('offline');
            // Hide camera offline overlay text
            const offlineText = droneFeed.querySelector('.offline-overlay-text');
            if (offlineText) offlineText.style.display = 'none';
          }
        }
      }
    }
  });

  // --- SESSION CORE LOGIC ---
  function updateSessionUI(session) {
    const loggedOutDiv = document.getElementById('session-logged-out');
    const loggedInDiv = document.getElementById('session-logged-in');
    
    if (session) {
      // User is logged in
      if (loggedOutDiv) loggedOutDiv.classList.add('hidden');
      if (loggedInDiv) loggedInDiv.classList.remove('hidden');
      
      const nameEl = document.getElementById('user-name-display');
      const roleEl = document.getElementById('user-role-display');
      const iconEl = document.getElementById('user-role-icon');
      
      if (nameEl) nameEl.textContent = session.fullname;
      
      let roleLabel = 'Público';
      let iconClass = 'fa-solid fa-user';
      let roleColorClass = 'role-publico';
      
      switch (session.role) {
        case 'operador':
          roleLabel = 'Operador Autorizado';
          iconClass = 'fa-solid fa-user-shield';
          roleColorClass = 'role-operador';
          break;
        case 'estudiante':
          roleLabel = 'Estudiante STEAM';
          iconClass = 'fa-solid fa-user-graduate';
          roleColorClass = 'role-estudiante';
          break;
        case 'docente':
          roleLabel = 'Docente';
          iconClass = 'fa-solid fa-chalkboard-user';
          roleColorClass = 'role-docente';
          break;
        case 'expert':
          roleLabel = 'Controlador Experto 🏆';
          iconClass = 'fa-solid fa-crown';
          roleColorClass = 'role-expert';
          break;
      }
      
      if (roleEl) {
        roleEl.textContent = roleLabel;
        roleEl.className = `user-role-display ${roleColorClass}`;
      }
      
      if (iconEl) {
        iconEl.className = `${iconClass} ${roleColorClass}`;
      }

      // Sync native select and trigger changes
      if (nativeProfileSelect) {
        nativeProfileSelect.value = session.role;
        nativeProfileSelect.dispatchEvent(new Event('change'));
      }
      
      // Update Panel Locks
      updatePanelLocks(session.role);
    } else {
      // User is logged out
      if (loggedOutDiv) loggedOutDiv.classList.remove('hidden');
      if (loggedInDiv) loggedInDiv.classList.add('hidden');

      // Revert native select to public mode
      if (nativeProfileSelect) {
        nativeProfileSelect.value = 'publico';
        nativeProfileSelect.dispatchEvent(new Event('change'));
      }
      
      // Update Panel Locks
      updatePanelLocks('publico');
    }
    
    // Attach sound events to any new elements dynamically
    setTimeout(attachAuthSounds, 200);
  }

  // Dynamic Register Modal Accent Colors based on role
  const registerRoleSelect = document.getElementById('register-role');
  const registerModalCard = registerModal ? registerModal.querySelector('.auth-modal-card') : null;
  
  if (registerRoleSelect && registerModalCard) {
    const resetRoleClasses = () => {
      registerModalCard.classList.remove('card-role-publico', 'card-role-operador', 'card-role-estudiante', 'card-role-docente');
    };
    
    registerRoleSelect.addEventListener('change', (e) => {
      resetRoleClasses();
      registerModalCard.classList.add(`card-role-${e.target.value}`);
      authSynth.beep(600, 'sine', 0.05);
    });
    
    // Set default initial state
    resetRoleClasses();
    registerModalCard.classList.add(`card-role-${registerRoleSelect.value}`);
  }

  // --- ACTIONS LOGIC (LOGIN / REGISTER / LOGOUT) ---
  
  // Submit Login
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const usernameInput = document.getElementById('login-username').value.trim();
      const passwordInput = document.getElementById('login-password').value;
      
      const users = getUsers();
      const matchedUser = users.find(u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.password === passwordInput);
      
      if (matchedUser) {
        // Success
        if (loginErrorMsg) loginErrorMsg.classList.add('hidden');
        setActiveSession(matchedUser);
        updateSessionUI(matchedUser);
        hideModal(loginModal);
        
        authSynth.beep(880, 'sine', 0.15);
        setTimeout(() => authSynth.beep(1100, 'sine', 0.25), 100);
        authSynth.speak(`Acceso concedido. Bienvenido al nodo, ${matchedUser.fullname.split(' ')[0]}.`);
      } else {
        // Fail
        if (loginErrorMsg) loginErrorMsg.classList.remove('hidden');
        authSynth.beep(150, 'sawtooth', 0.35);
      }
    });
  }

  // Submit Register
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const fullname = document.getElementById('register-fullname').value.trim();
      const username = document.getElementById('register-username').value.trim();
      const role = document.getElementById('register-role').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      
      // Verify passwords
      if (password !== confirmPassword) {
        if (registerErrorMsg) {
          registerErrorMsg.textContent = "Las contraseñas no coinciden.";
          registerErrorMsg.classList.remove('hidden');
        }
        authSynth.beep(150, 'sawtooth', 0.35);
        return;
      }
      
      // Verify username conflict
      const users = getUsers();
      const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
      
      if (userExists) {
        if (registerErrorMsg) {
          registerErrorMsg.textContent = "El nombre de usuario ya está registrado en el sistema.";
          registerErrorMsg.classList.remove('hidden');
        }
        authSynth.beep(150, 'sawtooth', 0.35);
        return;
      }
      
      // Save and Login
      if (registerErrorMsg) registerErrorMsg.classList.add('hidden');
      
      const newUser = { fullname, username, role, password };
      saveUser(newUser);
      setActiveSession(newUser);
      updateSessionUI(newUser);
      hideModal(registerModal);
      
      // Victory/Success chime
      authSynth.beep(523.25, 'sine', 0.1); // C5
      setTimeout(() => authSynth.beep(659.25, 'sine', 0.1), 100); // E5
      setTimeout(() => authSynth.beep(783.99, 'sine', 0.15), 200); // G5
      setTimeout(() => authSynth.beep(1046.50, 'sine', 0.3), 300); // C6
      
      authSynth.speak(`Registro exitoso. Se ha activado tu cuenta de ${fullname}.`);
    });
  }

  // Logout Click
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      const session = getActiveSession();
      const name = session ? session.fullname.split(' ')[0] : 'operador';
      
      removeActiveSession();
      updateSessionUI(null);
      
      authSynth.beep(400, 'sine', 0.15);
      setTimeout(() => authSynth.beep(300, 'sine', 0.25), 100);
      authSynth.speak(`Sesión cerrada. Hasta luego, ${name}.`);
    });
  }

  // --- INIT BOOTSTRAP ---
  // Run on startup
  checkAndInjectExpertRole();
  const initialSession = getActiveSession();
  
  if (initialSession) {
    // Session exists, configure select value early so app.js captures it
    if (nativeProfileSelect) {
      nativeProfileSelect.value = initialSession.role;
    }
    updateSessionUI(initialSession);
  } else {
    // Default guest mode is Public
    if (nativeProfileSelect) {
      nativeProfileSelect.value = 'publico';
    }
    updateSessionUI(null);
  }

});
