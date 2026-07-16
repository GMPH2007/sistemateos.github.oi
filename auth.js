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
  
  // Secure salted hash password function
  function hashPassword(password) {
    if (password.startsWith('argos_')) return password; // Already hashed
    const salt = "ARGOS_SECURE_SALT_2026_MISAEL_DAYRON";
    const salted = password + salt;
    let hash = 0;
    for (let i = 0; i < salted.length; i++) {
      const char = salted.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return 'argos_' + Math.abs(hash).toString(16) + btoa(unescape(encodeURIComponent(password))).replace(/=/g, '');
  }

  // HTML Input Sanitizer (Prevents XSS/HTML Injection)
  function sanitizeInput(str) {
    return str.replace(/[&<>"']/g, function(m) {
      switch (m) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#039;';
        default: return m;
      }
    });
  }

  // Brute Force Prevention state variables
  let loginAttempts = 0;
  let lockoutUntil = 0;

  const DEFAULT_USERS = [
    { fullname: "Carlos Mendoza (Operador)", username: "operador", password: hashPassword("123"), role: "operador" },
    { fullname: "Sofía Ruiz (Estudiante)", username: "estudiante", password: hashPassword("123"), role: "estudiante" },
    { fullname: "Prof. Alejandro Silva", username: "docente", password: hashPassword("123"), role: "docente" }
  ];

  const CLOUD_DB_URL = "https://extendsclass.com/api/json-storage/bin/dadaefb";
  const SECURITY_KEY = "ARGOS_SECURITY_TOKEN_2026";

  // Fetch and sync users from the cloud
  async function syncUsersFromCloud() {
    try {
      const response = await fetch(CLOUD_DB_URL);
      if (response.ok) {
        const cloudUsers = await response.json();
        if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
          const localUsers = getUsers();
          
          // Merge local and cloud, matching by username (case-insensitive)
          let merged = [...localUsers];
          cloudUsers.forEach(cu => {
            const index = merged.findIndex(lu => lu.username.toLowerCase() === cu.username.toLowerCase());
            if (index === -1) {
              merged.push(cu);
            } else {
              // Update local with cloud details
              merged[index] = cu;
            }
          });
          
          localStorage.setItem('argos_users', JSON.stringify(merged));
          console.log("[☁️ CLOUD SYNC] Sincronización de base de datos de usuarios completada con la nube.");
          return merged;
        }
      }
    } catch (e) {
      console.warn("[☁️ CLOUD SYNC] Error al sincronizar desde la nube. Usando base de datos local offline.", e);
    }
    return getUsers();
  }

  // Save and upload users to the cloud
  async function syncUsersToCloud(usersList) {
    try {
      const response = await fetch(CLOUD_DB_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Security-key': SECURITY_KEY
        },
        body: JSON.stringify(usersList)
      });
      if (response.ok) {
        console.log("[☁️ CLOUD SYNC] Base de datos respaldada en la nube con éxito.");
      } else {
        console.warn("[☁️ CLOUD SYNC] Error del servidor al guardar en la nube.");
      }
    } catch (e) {
      console.warn("[☁️ CLOUD SYNC] Error de red al guardar en la nube.", e);
    }
  }

  // Initialize simulated DB & Sync with error fallback
  try {
    const testParse = JSON.parse(localStorage.getItem('argos_users'));
    if (!Array.isArray(testParse) || testParse.length === 0) {
      localStorage.setItem('argos_users', JSON.stringify(DEFAULT_USERS));
    } else {
      migrateUserPasswords();
    }
  } catch (e) {
    localStorage.setItem('argos_users', JSON.stringify(DEFAULT_USERS));
  }
  
  // Trigger cloud sync asynchronously at startup
  syncUsersFromCloud();

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem('argos_users')) || [];
    } catch (e) {
      return [];
    }
  }

  function migrateUserPasswords() {
    const users = getUsers();
    let migrated = false;
    users.forEach(u => {
      if (!u.password.startsWith('argos_')) {
        u.password = hashPassword(u.password);
        migrated = true;
      }
    });
    if (migrated) {
      localStorage.setItem('argos_users', JSON.stringify(users));
    }
  }

  function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('argos_users', JSON.stringify(users));
    
    // Backup database to the cloud
    syncUsersToCloud(users);
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
  const licenseModal = document.getElementById('license-modal-overlay');
  const privacyModal = document.getElementById('privacy-modal-overlay');
  
  const btnOpenLicense = document.getElementById('btn-open-license');
  const btnOpenPrivacy = document.getElementById('btn-open-privacy');
  
  const btnCloseLogin = document.getElementById('btn-close-login');
  const btnCloseRegister = document.getElementById('btn-close-register');
  const btnCloseLicense = document.getElementById('btn-close-license');
  const btnClosePrivacy = document.getElementById('btn-close-privacy');
  
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  const linkToRegister = document.getElementById('link-to-register');
  const linkToLogin = document.getElementById('link-to-login');
  
  const loginErrorMsg = document.getElementById('login-error-msg');
  const registerErrorMsg = document.getElementById('register-error-msg');
  
  // Profile Selector link
  const nativeProfileSelect = document.getElementById('profile-select');

  // --- MODAL CONTROLS ---
  
  // Booting Log Console Terminal Simulator
  function runTerminalBoot(terminalElId, logsArray) {
    const el = document.getElementById(terminalElId);
    if (!el) return;
    el.innerHTML = '';
    let lineIdx = 0;
    
    // Add header
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
    header.style.paddingBottom = '4px';
    header.style.marginBottom = '6px';
    header.innerHTML = `<span><i class="fa-solid fa-terminal"></i> CONEXIÓN SEGURA</span><span style="color:#00ff66; animation: pulseFlashing 0.8s infinite alternate;"><i class="fa-solid fa-circle"></i> PROTEGIDO</span>`;
    el.appendChild(header);
    
    function printLine() {
      if (lineIdx >= logsArray.length) return;
      const line = document.createElement('div');
      line.style.color = '#888';
      line.textContent = logsArray[lineIdx];
      el.appendChild(line);
      lineIdx++;
      setTimeout(printLine, 120);
    }
    printLine();
  }

  function showModal(modalEl) {
    modalEl.classList.remove('hidden');
    authSynth.beep(500, 'sine', 0.1);
    
    // Trigger terminal animation if applicable
    if (modalEl.id === 'login-modal-overlay') {
      runTerminalBoot('login-terminal-logs', [
        "> INICIANDO PROTOCOLO SHIELD v5.20...",
        "> ENLACE DE DATOS ENCRIPTADO... [OK]",
        "> FIREWALL ACTIVO (DETECCION DDoS)... [OK]",
        "> VERIFICANDO INTEGRIDAD LOCAL... [COMPLETO]"
      ]);
      // Reset Captcha status
      const check = document.getElementById('login-human-check');
      if (check) check.checked = false;
      const status = document.getElementById('login-captcha-status');
      if (status) {
        status.textContent = '[ESPERANDO...]';
        status.style.color = '#ff8c00';
      }
    } else if (modalEl.id === 'register-modal-overlay') {
      runTerminalBoot('register-terminal-logs', [
        "> GENERANDO LLAVE PÚBLICA / PRIVADA...",
        "> CANAL CREADOR DE CUENTAS: SEGURO",
        "> AUDITANDO PARÁMETROS XSS... [INICIADO]",
        "> SISTEMA LISTO PARA ASIGNACIÓN DE ROL"
      ]);
      // Reset strength bar
      const strengthBar = document.getElementById('strength-bar-fill');
      if (strengthBar) strengthBar.style.width = '0%';
      const strengthLabel = document.getElementById('strength-label');
      if (strengthLabel) {
        strengthLabel.textContent = 'Ninguna';
        strengthLabel.style.color = '#888';
      }
    }
    
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
  if (btnOpenLicense) {
    btnOpenLicense.addEventListener('click', (e) => {
      e.preventDefault();
      showModal(licenseModal);
    });
  }
  if (btnOpenPrivacy) {
    btnOpenPrivacy.addEventListener('click', (e) => {
      e.preventDefault();
      showModal(privacyModal);
    });
  }
  
  // Bind Closers
  if (btnCloseLogin) btnCloseLogin.addEventListener('click', () => hideModal(loginModal));
  if (btnCloseRegister) btnCloseRegister.addEventListener('click', () => hideModal(registerModal));
  if (btnCloseLicense) btnCloseLicense.addEventListener('click', () => hideModal(licenseModal));
  if (btnClosePrivacy) btnClosePrivacy.addEventListener('click', () => hideModal(privacyModal));

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
  [loginModal, registerModal, licenseModal, privacyModal].forEach(modal => {
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
      if (licenseModal && !licenseModal.classList.contains('hidden')) hideModal(licenseModal);
      if (privacyModal && !privacyModal.classList.contains('hidden')) hideModal(privacyModal);
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
    
    // Flight Control Lock
    if (flightCard) {
      const lockOverlayFlight = document.getElementById('lock-overlay-flight');
      if (currentRole === 'operador' || currentRole === 'docente' || currentRole === 'expert') {
        flightCard.classList.remove('panel-locked');
      } else {
        flightCard.classList.add('panel-locked');
        if (lockOverlayFlight) {
          const title = lockOverlayFlight.querySelector('h4');
          const desc = lockOverlayFlight.querySelector('p');
          if (currentRole === 'estudiante') {
            if (title) title.innerHTML = '<i class="fa-solid fa-lock"></i> SEGURIDAD ACTIVA';
            if (desc) desc.textContent = "Los estudiantes no pueden operar la maquinaria física. Por favor accede a los simuladores de vuelo.";
          } else {
            if (title) title.innerHTML = 'ACCESO OPERADOR REQUERIDO';
            if (desc) desc.textContent = "Inicia sesión como Operador Autorizado para desbloquear y controlar la navegación terrestre y aérea del robot.";
          }
        }
      }
    }
    
    // Student Module (STEAM Labs) Lock
    if (studentModule) {
      const lockOverlayLabs = document.getElementById('lock-overlay-labs');
      if (currentRole !== 'publico') {
        studentModule.classList.remove('panel-locked');
      } else {
        studentModule.classList.add('panel-locked');
        if (lockOverlayLabs) {
          const title = lockOverlayLabs.querySelector('h4');
          const desc = lockOverlayLabs.querySelector('p');
          if (title) title.innerHTML = 'REGISTRO REQUERIDO';
          if (desc) desc.textContent = "Inicia sesión o regístrate en la plataforma para participar de la trivia y misiones STEAM.";
        }
      }
    }
    
    // Teacher Module Lock
    if (teacherModule) {
      const lockOverlayTeacher = document.getElementById('lock-overlay-teacher');
      if (currentRole === 'docente' || currentRole === 'expert') {
        teacherModule.classList.remove('panel-locked');
      } else {
        teacherModule.classList.add('panel-locked');
        if (lockOverlayTeacher) {
          const title = lockOverlayTeacher.querySelector('h4');
          const desc = lockOverlayTeacher.querySelector('p');
          if (title) title.innerHTML = 'ACCESO DOCENTE EXCLUSIVO';
          if (desc) desc.textContent = "Este panel administrativo está reservado para docentes certificados. Permite calificar y auditar registros.";
        }
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
      
      const usernameInput = sanitizeInput(document.getElementById('login-username').value.trim());
      const passwordInput = document.getElementById('login-password').value;
      
      // Captcha Human Check
      const loginHumanCheck = document.getElementById('login-human-check');
      if (loginHumanCheck && !loginHumanCheck.checked) {
        if (loginErrorMsg) {
          loginErrorMsg.textContent = "Por seguridad, confirma la autenticación humana (Anti-Bot).";
          loginErrorMsg.classList.remove('hidden');
        }
        authSynth.beep(150, 'sawtooth', 0.2);
        return;
      }

      // Brute force check
      if (Date.now() < lockoutUntil) {
        const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
        if (loginErrorMsg) {
          loginErrorMsg.textContent = `Acceso bloqueado por seguridad. Reintente en ${remaining}s.`;
          loginErrorMsg.classList.remove('hidden');
        }
        authSynth.beep(150, 'sawtooth', 0.2);
        return;
      }
      
      const users = getUsers();
      const hashedInput = hashPassword(passwordInput);
      const matchedUser = users.find(u => u.username.toLowerCase() === usernameInput.toLowerCase() && u.password === hashedInput);
      
      if (matchedUser) {
        // Success
        loginAttempts = 0;
        if (loginErrorMsg) loginErrorMsg.classList.add('hidden');
        setActiveSession(matchedUser);
        updateSessionUI(matchedUser);
        hideModal(loginModal);
        
        authSynth.beep(880, 'sine', 0.15);
        setTimeout(() => authSynth.beep(1100, 'sine', 0.25), 100);
        authSynth.speak(`Acceso concedido. Bienvenido al nodo, ${matchedUser.fullname.split(' ')[0]}.`);
      } else {
        // Fail
        loginAttempts++;
        if (loginAttempts >= 5) {
          lockoutUntil = Date.now() + 30000;
          if (loginErrorMsg) {
            loginErrorMsg.textContent = "Demasiados intentos fallidos. Cuenta bloqueada por 30s.";
            loginErrorMsg.classList.remove('hidden');
          }
          authSynth.speak("Bloqueo de seguridad activado por sospecha de fuerza bruta.");
        } else {
          if (loginErrorMsg) {
            loginErrorMsg.textContent = "Usuario o contraseña incorrectos.";
            loginErrorMsg.classList.remove('hidden');
          }
        }
        authSynth.beep(150, 'sawtooth', 0.35);
      }
    });
  }

  // Submit Register
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const fullname = sanitizeInput(document.getElementById('register-fullname').value.trim());
      const username = sanitizeInput(document.getElementById('register-username').value.trim());
      const role = document.getElementById('register-role').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      
      // Enforce secure password length
      if (password.length < 6) {
        if (registerErrorMsg) {
          registerErrorMsg.textContent = "La contraseña debe tener al menos 6 caracteres.";
          registerErrorMsg.classList.remove('hidden');
        }
        authSynth.beep(150, 'sawtooth', 0.35);
        return;
      }

      // Verify passwords match
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
          registerErrorMsg.textContent = "El nombre de usuario ya está registrado.";
          registerErrorMsg.classList.remove('hidden');
        }
        authSynth.beep(150, 'sawtooth', 0.35);
        return;
      }
      
      // Save and Login
      if (registerErrorMsg) registerErrorMsg.classList.add('hidden');
      
      const newUser = { fullname, username, role, password: hashPassword(password) };
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
  window.checkAndInjectExpertRole();
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
  // --- ENCRYPTED CYBER-SHIELD & ANTI-INTRUSION LAYER (AGPLv3 Compliant) ---
  (function(_0xabc, _0xdef) {
    const _0xdec = function(_0xstr) { return atob(_0xstr); };
    
    // Obfuscated Base64 messages to hide source checks
    const _0xkey1 = _0xdec("Y29udGV4dG1lbnU="); // contextmenu
    const _0xkey2 = _0xdec("a2V5ZG93bg==");     // keydown
    
    // 1. Right Click Block
    document.addEventListener(_0xkey1, (e) => {
      e.preventDefault();
      authSynth.beep(180, 'sawtooth', 0.4);
      console.warn('%c[🛡️ SHIELD] ' + _0xdec("Q2xpYyBkZXJlY2hvIGJsb3F1ZWFkby4="), 'color: #ff3e3e; font-weight: bold;');
    });

    // 2. Hotkey Block (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U, Ctrl+S)
    document.addEventListener(_0xkey2, (e) => {
      const isCtrlShift = e.ctrlKey && e.shiftKey;
      const isCtrl = e.ctrlKey;
      if (
        e.keyCode === 123 || 
        (isCtrlShift && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
        (isCtrl && (e.keyCode === 85 || e.keyCode === 83))
      ) {
        e.preventDefault();
        authSynth.beep(180, 'sawtooth', 0.4);
        console.warn('%c[🛡️ SHIELD] ' + _0xdec("QXRham8gZGUgaW5zcGVjY2nDs24gYmxvcXVlYWRvLg=="), 'color: #ff3e3e; font-weight: bold;');
      }
    });

  })();

  // ASCII Warn Console Banner
  console.log(`%c
   █████╗ ██████╗  ██████╗  ██████╗ ███████╗
  ██╔══██╗██╔══██╗██╔════╝ ██╔═══██╗██╔════╝
  ███████║██████╔╝██║  ███╗██║   ██║███████╗
  ██╔══██║██╔══██╗██║   ██║██║   ██║╚════██║
  ██║  ██║██║  ██║╚██████╔╝╚██████╔╝███████║
  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝
  %c¡ACCESO DE CÓDIGO RESTRINGIDO!
  -------------------------------------------------------------
  Software de Resiliencia Civil Protegido bajo Licencia GNU AGPLv3.
  Propiedad Intelectual y Diseño de Interfaz Exclusivo de:
  - Dayron Urbina Zapata (Diseño de Hardware y Robótica)
  - Misael Pintado (Co-Fundador y Programación de Mando)
  
  Cualquier copia, intrusión o ingeniería inversa no autorizada
  está estrictamente denegada por la arquitectura de red local.
  `, "color: #00f0ff; font-weight: bold; font-size: 13px;", "color: #ff3e3e; font-weight: bold; font-size: 12px;");

  // Anti-Bot scan event listener
  const loginHumanCheck = document.getElementById('login-human-check');
  const loginCaptchaStatus = document.getElementById('login-captcha-status');
  if (loginHumanCheck) {
    loginHumanCheck.addEventListener('change', (e) => {
      if (e.target.checked) {
        authSynth.beep(400, 'sine', 0.1);
        if (loginCaptchaStatus) {
          loginCaptchaStatus.textContent = '[ESCANEO DE SISTEMA...]';
          loginCaptchaStatus.style.color = '#ff8c00';
        }
        setTimeout(() => {
          if (loginHumanCheck.checked) {
            authSynth.beep(800, 'sine', 0.15);
            if (loginCaptchaStatus) {
              loginCaptchaStatus.textContent = '[HUMANO CONFIRMADO]';
              loginCaptchaStatus.style.color = '#00ff66';
            }
          }
        }, 1000);
      } else {
        if (loginCaptchaStatus) {
          loginCaptchaStatus.textContent = '[ESPERANDO...]';
          loginCaptchaStatus.style.color = '#ff8c00';
        }
      }
    });
  }

  // Password strength checker event listener
  const registerPwdInput = document.getElementById('register-password');
  const strengthBarFill = document.getElementById('strength-bar-fill');
  const strengthLabel = document.getElementById('strength-label');
  if (registerPwdInput) {
    registerPwdInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (!val) {
        if (strengthBarFill) strengthBarFill.style.width = '0%';
        if (strengthLabel) {
          strengthLabel.textContent = 'Ninguna';
          strengthLabel.style.color = '#888';
        }
        return;
      }
      
      let score = 0;
      if (val.length >= 6) score += 1;
      if (val.length >= 10) score += 1;
      if (/[0-9]/.test(val)) score += 1;
      if (/[A-Z]/.test(val)) score += 1;
      if (/[^A-Za-z0-9]/.test(val)) score += 1;
      
      if (score <= 1) {
        if (strengthBarFill) {
          strengthBarFill.style.width = '25%';
          strengthBarFill.style.background = '#ff3e3e';
        }
        if (strengthLabel) {
          strengthLabel.textContent = 'Insegura ⚠️';
          strengthLabel.style.color = '#ff3e3e';
        }
      } else if (score <= 3) {
        if (strengthBarFill) {
          strengthBarFill.style.width = '60%';
          strengthBarFill.style.background = '#ff8c00';
        }
        if (strengthLabel) {
          strengthLabel.textContent = 'Moderada ⚡';
          strengthLabel.style.color = '#ff8c00';
        }
      } else {
        if (strengthBarFill) {
          strengthBarFill.style.width = '100%';
          strengthBarFill.style.background = '#00ff66';
        }
        if (strengthLabel) {
          strengthLabel.textContent = 'Impenetrable 🔒';
          strengthLabel.style.color = '#00ff66';
        }
      }
    });
  }

});
