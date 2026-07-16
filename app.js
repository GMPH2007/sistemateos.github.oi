/* ==========================================================================
   ARGOS - CORE SYSTEM JS CONTROLLER (FULLY CORRECTED & STABLE)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. STATE VARIABLES
  // ==========================================
  const state = {
    currentTab: 'inicio',
    currentProfile: 'operador', // default to Operator so they can see all interactive features
    droneStatus: 'hangar', // hangar, launching, flying, landing
    droneAlt: 0.0,
    droneBattery: 100,
    systemBattery: 98,
    solarPower: 18.4,
    cameraScanlines: true,
    cameraNoise: false,
    sensors: {
      temperature: 22.4,
      humidity: 68.0,
      pressure: 1013,
      rain: false,
      flame: false,
      accelX: 0,
      accelY: 0,
      gpsLat: 9.93242,
      gpsLon: -84.07921
    },
    // Locomotion
    locoSpeed: 1, // 1x, 2x, 3x
    locoMoving: false,
    locoDirection: null,
    wheelAngle: 0,
    // Headlights
    headlights: false,
    // Lab 1
    steamLab1Loaded: false,
    // Lab 2 (Sim)
    steamSimActive: false,
    steamSimInterval: null,
    steamSimDronePos: 90, // bottom distance in px
    steamSimWind: 15,
    steamSimScore: 0,
    // Lab 3 (AI Trainer)
    aiAccuracy: 0,
    currentCrackSample: 'sano', // sano, leve, grave
    aiLabsCompleted: false
  };

  // ==========================================
  // 2. ELEMENT SELECTORS
  // ==========================================
  // Navigation & Tabs
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const heroGoDashboard = document.querySelector('[data-target="dashboard"]');
  const heroGoSteam = document.querySelector('[data-target="steam"]');
  
  // Top Header Status Panel
  const topGpsVal = document.getElementById('gps-coords');
  const topAltVal = document.getElementById('robot-alt');
  const topBatVal = document.getElementById('robot-battery-pct');
  const topSignalVal = document.getElementById('telemetry-latency');

  // Connection Controls Panel
  const esp32Toggle = document.getElementById('esp32-toggle');
  const robotIpInput = document.getElementById('robot-ip');
  const cameraStreamPathInput = document.getElementById('camera-stream-path');
  const camSourceSelect = document.getElementById('cam-source-select');
  const camDeviceContainer = document.getElementById('cam-device-container');
  const camDeviceSelect = document.getElementById('cam-device-select');
  const connStatus = document.getElementById('conn-status');
  const labelSim = document.getElementById('label-sim');
  const labelReal = document.getElementById('label-real');

  // Profile Selector
  const profileSelect = document.getElementById('profile-select');
  const globalStatusBadge = document.getElementById('global-status-badge');
  const globalStatusText = document.getElementById('global-status-text');
  
  // Cameras
  const canvasFrontal = document.getElementById('canvas-cam-frontal');
  const canvasTrasera = document.getElementById('canvas-cam-trasera');
  const canvasDrone = document.getElementById('canvas-cam-drone');
  const toggleScanlinesBtn = document.getElementById('toggle-scanlines');
  const toggleStaticBtn = document.getElementById('toggle-static');
  
  const aiBoxFrontal = document.getElementById('ai-box-frontal');
  const aiBoxTrasera = document.getElementById('ai-box-trasera');
  const aiBoxDrone = document.getElementById('ai-box-drone');
  
  const droneFeedOverlay = document.getElementById('drone-feed-overlay');
  const hudDroneAlt = document.getElementById('hud-drone-alt');
  const hudDroneBat = document.getElementById('hud-drone-bat');

  // Headlights
  const ledLightSwitch = document.getElementById('led-light-switch');
  const ledLightOverlay = document.getElementById('led-light-overlay');

  // Telemetry Dashboard
  const gaugePressVal = document.getElementById('gauge-press-val');
  const gaugePressRing = document.getElementById('pressure-gauge-ring');
  const rainIndicator = document.getElementById('rain-indicator-box');
  const rainText = document.getElementById('sensor-rain-val');
  const flameIndicator = document.getElementById('flame-indicator-box');
  const flameText = document.getElementById('sensor-flame-val');
  
  const tiltXText = document.getElementById('tilt-x');
  const tiltYText = document.getElementById('tilt-y');
  const oscilloscopeCanvas = document.getElementById('oscilloscope-canvas');
  
  const radarPing = document.getElementById('radar-pos-ping');
  const radarLatText = document.getElementById('radar-lat');
  const radarLonText = document.getElementById('radar-lon');
  
  // Terrestrial Locomotion
  const btnLocoForward = document.getElementById('btn-loco-forward');
  const btnLocoBack = document.getElementById('btn-loco-back');
  const btnLocoLeft = document.getElementById('btn-loco-left');
  const btnLocoRight = document.getElementById('btn-loco-right');
  const locoSpeedSlider = document.getElementById('loco-speed-slider');

  // Drone Flight Controls
  const flightSystemStatus = document.getElementById('flight-system-status');
  const takeoffLogs = document.getElementById('takeoff-logs');
  const btnPreFlight = document.getElementById('btn-pre-flight');
  const manualControlsCard = document.getElementById('manual-controls-card');
  const droneAltSlider = document.getElementById('drone-alt-slider');
  const sliderAltVal = document.getElementById('slider-alt-val');
  const btnRTL = document.getElementById('btn-rtl');
  const btnLand = document.getElementById('btn-land');
  
  const joyForward = document.getElementById('ctrl-forward');
  const joyBack = document.getElementById('ctrl-back');
  const joyLeft = document.getElementById('ctrl-left');
  const joyRight = document.getElementById('ctrl-right');

  // STEAM Section
  const steamProfileDisplay = document.getElementById('steam-profile-display');
  const studentModule = document.getElementById('student-module');
  const teacherModule = document.getElementById('teacher-module');
  const btnExportCSV = document.getElementById('btn-export-csv');
  const btnExportJSON = document.getElementById('btn-export-json');
  const exportMsg = document.getElementById('export-msg');
  const studentLabsProgress = document.getElementById('student-labs-progress');
  
  // STEAM Lab 1
  const btnLoadLabData = document.getElementById('btn-load-lab-data');
  const labDataStatus = document.getElementById('lab-data-status');
  const labQuizBox = document.getElementById('lab-quiz');
  const btnSubmitQuiz = document.getElementById('btn-submit-quiz');
  const quizFeedbackBox = document.getElementById('quiz-feedback-box');
  
  // STEAM Lab 2 (Sim)
  const simDroneElement = document.getElementById('sim-drone-element');
  const simWindSpeedText = document.getElementById('sim-wind-speed');
  const rpmSlider = document.getElementById('rpm-slider');
  const rpmDisplayVal = document.getElementById('rpm-display-val');
  const btnStartSim = document.getElementById('btn-start-sim');
  const btnResetSim = document.getElementById('btn-reset-sim');
  const simFeedbackMsg = document.getElementById('sim-feedback-msg');

  // STEAM Lab 3 (AI Trainer)
  const canvasAiCrack = document.getElementById('canvas-ai-crack');
  const btnAiSano = document.getElementById('btn-ai-sano');
  const btnAiLeve = document.getElementById('btn-ai-leve');
  const btnAiGrave = document.getElementById('btn-ai-grave');
  const aiAccuracyBar = document.getElementById('ai-accuracy-bar');
  const aiAccuracyPct = document.getElementById('ai-accuracy-pct');
  const aiTrainingFeedback = document.getElementById('ai-training-feedback');
  const aiCertBadge = document.getElementById('ai-cert-badge');
  
  // Clickable Schematic
  const svgOrugas = document.getElementById('svg-part-orugas');
  const svgSolar = document.getElementById('svg-part-solar');
  const svgHangar = document.getElementById('svg-part-hangar');
  const schematicDetailCard = document.getElementById('schematic-detail-card');
  const detailPartName = document.getElementById('detail-part-name');
  const detailPartDesc = document.getElementById('detail-part-desc');
  const btnCloseDetails = document.getElementById('btn-close-details');


  // ==========================================
  // 3. SOUND SYNTHESIZER & SPEECH CONTROLLER (WEB AUDIO API)
  // ==========================================
  class WebSynth {
    constructor() {
      this.ctx = null;
      this.initialized = false;
    }

    init() {
      if (this.initialized) return;
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();
        this.initialized = true;
      } catch (e) {
        console.warn('AudioContext not supported or blocked in this browser.', e);
      }
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(e => console.warn('Failed to resume AudioContext:', e));
      }
    }

    beep(freq = 600, type = 'sine', duration = 0.08) {
      this.init();
      this.resume();
      if (!this.ctx) return;

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (err) {
        // Suppress audio warnings before user interaction gestures
      }
    }

    alarm(duration = 0.5) {
      this.init();
      this.resume();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.linearRampToValueAtTime(440, now + duration);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(220, now);
        osc2.frequency.linearRampToValueAtTime(110, now + duration);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start();
        osc2.start();
        
        osc1.stop(now + duration);
        osc2.stop(now + duration);
      } catch (err) {}
    }

    victory() {
      this.init();
      this.resume();
      if (!this.ctx) return;

      try {
        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          
          gain.gain.setValueAtTime(0.06, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.3);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.3);
        });
      } catch (err) {}
    }

    speak(text) {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'es-ES';
          utterance.rate = 1.0;
          utterance.pitch = 1.15;
          window.speechSynthesis.speak(utterance);
        } catch (err) {}
      }
    }
  }

  const synth = new WebSynth();

  // Attach hover beeps safely
  function attachHoverSounds() {
    const interactiveElements = document.querySelectorAll('button, select, input[type="range"], .clickable-part');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        synth.beep(800, 'sine', 0.03);
      });
      el.addEventListener('click', () => {
        synth.beep(550, 'sine', 0.06);
      });
    });
  }

  setTimeout(attachHoverSounds, 500);


  // ==========================================
  // 4. TAB ROUTING & SCHEMATIC INTERACTIVE BLUEPRINT
  // ==========================================
  function switchTab(tabId) {
    state.currentTab = tabId;
    
    // Update navigation active states
    navBtns.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update section visibility
    tabContents.forEach(section => {
      if (section.id === tabId) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });
    
    // Resize charts/canvases dynamically (Fixes 0x0 hidden render errors)
    if (tabId === 'dashboard') {
      setTimeout(() => {
        resizeCanvases();
        resizeOscilloscope();
        if (telemetryChart && typeof Chart !== 'undefined') {
          try {
            telemetryChart.resize();
          } catch (err) {}
        }
      }, 100);
    }
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.getAttribute('data-tab'));
    });
  });

  // Bind all elements with data-target to switch tabs (like the "Ingresar al Aula Virtual" button)
  const targetBtns = document.querySelectorAll('[data-target]');
  targetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-target');
      switchTab(targetTab);
    });
  });

  // Interactive Schematic Parts
  const specs = {
    orugas: {
      name: "Sistema de Tracción Oruga 12V",
      desc: "Tracción por orugas robustas de goma impulsadas por motores de corriente continua de 12 V con alto torque y reductores metálicos. Permite al robot superar pendientes de hasta 35° y desplazarse en lodo, asfalto roto o rocas. La velocidad máxima terrestre es de 1.5 m/s."
    },
    solar: {
      name: "Generación Solar Fotovoltaica",
      desc: "Panel solar monocristalino integrado de 20 W montado en el chasis superior. Cuenta con un regulador de carga MPPT (Maximum Power Point Tracking) conectado a los ESP32, que recarga la batería central de LiFePO4 durante exploraciones prolongadas a la luz del día, extendiendo la autonomía hasta un 40%."
    },
    hangar: {
      name: "Hangar y Rampa de UAV Aéreo",
      desc: "Bahía mecánica hermética trasera equipada con servo-motores de apertura superior. Aloja un micro-dron (quadcopter) de reconocimiento aéreo. Dispone de un elevador interior y un cargador de contacto inductivo automático para reponer el nivel del dron mientras está alojado en base."
    }
  };

  function selectSchematicPart(element, key) {
    if (!element || !specs[key]) return;
    [svgOrugas, svgSolar, svgHangar].forEach(part => {
      if (part) part.classList.remove('selected');
    });
    
    element.classList.add('selected');
    if (detailPartName) detailPartName.textContent = specs[key].name;
    if (detailPartDesc) detailPartDesc.textContent = specs[key].desc;
    if (schematicDetailCard) schematicDetailCard.classList.remove('hidden');
    
    synth.speak(specs[key].name);
  }

  if (svgOrugas) svgOrugas.addEventListener('click', () => selectSchematicPart(svgOrugas, 'orugas'));
  if (svgSolar) svgSolar.addEventListener('click', () => selectSchematicPart(svgSolar, 'solar'));
  if (svgHangar) svgHangar.addEventListener('click', () => selectSchematicPart(svgHangar, 'hangar'));

  if (btnCloseDetails) {
    btnCloseDetails.addEventListener('click', () => {
      [svgOrugas, svgSolar, svgHangar].forEach(part => {
        if (part) part.classList.remove('selected');
      });
      if (schematicDetailCard) schematicDetailCard.classList.add('hidden');
    });
  }


  // ==========================================
  // 5. ROLE ACCESS CONTROL
  // ==========================================
  function handleProfileChange(selectedProfile) {
    state.currentProfile = selectedProfile;
    
    let profileLabelText = 'Público General';
    if (selectedProfile === 'operador') profileLabelText = 'Operador Autorizado';
    if (selectedProfile === 'estudiante') profileLabelText = 'Estudiante STEAM';
    if (selectedProfile === 'docente') profileLabelText = 'Docente';
    
    if (steamProfileDisplay) steamProfileDisplay.textContent = profileLabelText;

    // Keep both visible so the user can see what they contain
    if (teacherModule) teacherModule.classList.remove('hidden');
    if (studentModule) studentModule.classList.remove('hidden');

    // Toggle dashboard controls lock (unlocked for all profiles in demo mode)
    const locomotionControls = [btnLocoForward, btnLocoBack, btnLocoLeft, btnLocoRight, locoSpeedSlider];

    if (btnPreFlight) {
      btnPreFlight.disabled = false;
      btnPreFlight.style.opacity = '1';
      if (state.droneStatus === 'hangar') {
        btnPreFlight.textContent = 'PREPARAR DESPEGUE';
      }
    }
    
    appendLog('console', `[SISTEMA] Nivel de acceso: ${profileLabelText.toUpperCase()}.`, 'success');
    
    locomotionControls.forEach(el => { if (el) el.disabled = false; });

    if (state.droneStatus === 'flying') {
      unlockFlightControls();
    }
  }

  if (profileSelect) {
    profileSelect.addEventListener('change', (e) => {
      handleProfileChange(e.target.value);
    });
    handleProfileChange(profileSelect.value);
  }

  // ==========================================
  // 5B. ESP32 WEBSOCKET NETWORKING CLIENT
  // ==========================================
  let robotSocket = null;
  let reconnectInterval = null;

  function sendRobotCommand(payload) {
    if (robotSocket && robotSocket.readyState === WebSocket.OPEN) {
      try {
        robotSocket.send(JSON.stringify(payload));
      } catch (err) {
        console.warn("Failed to transmit WebSocket payload:", err);
      }
    }
  }

  function updateRainStatusUI() {
    if (rainIndicator && rainText) {
      if (state.sensors.rain) {
        rainIndicator.classList.add('rain-active');
        rainText.textContent = 'DETECTADA';
        appendLog('console', '[ALERTA] Sensor de lluvia: Precipitación activa. Humedad ascendente.', 'warning');
        synth.speak('Lluvia detectada');
      } else {
        rainIndicator.classList.remove('rain-active');
        rainText.textContent = 'NO DETECTADA';
      }
    }
  }

  function updateFlameStatusUI() {
    if (flameIndicator && flameText) {
      if (state.sensors.flame) {
        flameIndicator.classList.remove('flame-normal');
        flameIndicator.classList.add('flame-danger');
        flameText.textContent = '!!! FUEGO !!!';
        
        if (globalStatusBadge && globalStatusText) {
          globalStatusBadge.className = 'system-status';
          globalStatusBadge.style.background = 'rgba(255, 59, 48, 0.15)';
          globalStatusBadge.style.borderColor = 'var(--accent-red)';
          globalStatusText.textContent = '¡ALERTA DE RIESGO - FLAMA!';
        }
        
        appendLog('console', '[CRÍTICO] Sensor de llamas: ¡Detección de foco de incendio!', 'error');
        synth.alarm(1.0);
        synth.speak('Advertencia. Foco de incendio detectado.');
      } else {
        flameIndicator.classList.add('flame-normal');
        flameIndicator.classList.remove('flame-danger');
        flameText.textContent = 'NORMAL';
        
        if (globalStatusBadge && globalStatusText) {
          globalStatusBadge.style.background = '';
          globalStatusBadge.style.borderColor = '';
        }
        updateGlobalStatusBadge();
      }
    }
  }

  // --- REAL CAMERA STREAM OV2640 & USB LOCAL CAMERA CLIENT ---
  let liveStreamActive = false;
  const liveCameraImage = new Image();

  // USB Video DOM Elements (Created dynamically)
  const localVideoElement = document.createElement('video');
  localVideoElement.autoplay = true;
  localVideoElement.playsInline = true;
  localVideoElement.muted = true;
  let localVideoStream = null;

  liveCameraImage.onload = () => {
    liveStreamActive = true;
    appendLog('console', '[CAM] Transmisión de video OV2640 activa.', 'success');
  };

  liveCameraImage.onerror = () => {
    liveStreamActive = false;
    appendLog('console', '[ERROR CAM] Error al decodificar video OV2640. Verifique la RUTA.', 'error');
  };

  function enumerateVideoDevices(stream) {
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoDevices = devices.filter(device => device.kind === 'videoinput');
          if (camDeviceSelect) {
            const oldVal = camDeviceSelect.value;
            camDeviceSelect.innerHTML = '';
            
            videoDevices.forEach((device, index) => {
              const opt = document.createElement('option');
              opt.value = device.deviceId;
              opt.textContent = device.label || `Cámara USB ${index + 1}`;
              camDeviceSelect.appendChild(opt);
            });
            
            if (stream) {
              const activeTrack = stream.getVideoTracks()[0];
              if (activeTrack) {
                const settings = activeTrack.getSettings();
                if (settings && settings.deviceId) {
                  camDeviceSelect.value = settings.deviceId;
                }
              }
            } else if (oldVal && videoDevices.some(d => d.deviceId === oldVal)) {
              camDeviceSelect.value = oldVal;
            } else if (videoDevices.length > 0) {
              camDeviceSelect.value = videoDevices[0].deviceId;
            }
            
            // Show device selector if we have cameras connected
            if (videoDevices.length >= 1) {
              if (camDeviceContainer) camDeviceContainer.classList.remove('hidden');
            } else {
              if (camDeviceContainer) camDeviceContainer.classList.add('hidden');
            }
          }
        })
        .catch(err => {
          console.warn("Error enumerating devices:", err);
          if (camDeviceContainer) camDeviceContainer.classList.add('hidden');
        });
    }
  }

  function startLiveCameraStream(preferredDeviceId = null) {
    const camSource = camSourceSelect ? camSourceSelect.value : 'simulado';
    
    // Stop old stream, but do NOT wipe dropdown options if switching device
    stopLiveCameraStream(preferredDeviceId ? false : true);
    
    if (camSource === 'esp32') {
      if (camDeviceContainer) camDeviceContainer.classList.add('hidden');
      const ip = robotIpInput ? robotIpInput.value.trim() : '192.168.4.1';
      const camPath = cameraStreamPathInput ? cameraStreamPathInput.value.trim() : ':81/stream';
      let streamUrl = '';
      
      if (camPath.startsWith('http://') || camPath.startsWith('https://')) {
        streamUrl = camPath;
      } else {
        streamUrl = `http://${ip}${camPath}`;
      }
      
      appendLog('console', `[CAM] Conectando a transmisión de video en ${streamUrl}...`, 'warning');
      liveCameraImage.src = streamUrl;
    } else if (camSource === 'usb') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        appendLog('console', '[CAM] Inicializando cámara física USB/Tipo-C...', 'warning');
        
        const constraints = {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        };
        
        if (preferredDeviceId) {
          constraints.video.deviceId = { exact: preferredDeviceId };
        }
        
        navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
          localVideoStream = stream;
          localVideoElement.srcObject = stream;
          localVideoElement.onloadedmetadata = () => {
            localVideoElement.play().catch(e => console.warn("Video play failed:", e));
          };
          appendLog('console', '[CAM] Cámara física USB/Tipo-C conectada con éxito.', 'success');
          synth.speak("Cámara USB conectada.");
          
          enumerateVideoDevices(stream);
        })
        .catch(err => {
          console.error("Error accessing local webcam:", err);
          appendLog('console', '[ERROR CAM] No se pudo acceder a la cámara USB/Tipo-C. Verifique los permisos del navegador.', 'error');
          synth.speak("Error al conectar la cámara USB.");
        });
      } else {
        appendLog('console', '[ERROR CAM] La API de cámara no es compatible con este navegador.', 'error');
      }
    } else {
      if (camDeviceContainer) camDeviceContainer.classList.add('hidden');
    }
  }

  function stopLiveCameraStream(clearDevices = true) {
    liveCameraImage.removeAttribute('src');
    liveStreamActive = false;
    
    if (localVideoStream) {
      localVideoStream.getTracks().forEach(track => track.stop());
      localVideoStream = null;
    }
    localVideoElement.srcObject = null;
    
    if (clearDevices) {
      if (camDeviceSelect) camDeviceSelect.innerHTML = '';
      if (camDeviceContainer) camDeviceContainer.classList.add('hidden');
    }
  }

  // Bind change event on camera source select
  if (camSourceSelect) {
    camSourceSelect.addEventListener('change', () => {
      const selected = camSourceSelect.value;
      if (selected === 'simulado') {
        stopLiveCameraStream();
        appendLog('console', '[CAM] Retornando a Simulación de Telemetría Táctica.', 'info');
      } else {
        startLiveCameraStream();
      }
    });
  }

  // Bind change event on specific camera device select
  if (camDeviceSelect) {
    camDeviceSelect.addEventListener('change', () => {
      const selectedDeviceId = camDeviceSelect.value;
      if (selectedDeviceId) {
        startLiveCameraStream(selectedDeviceId);
      }
    });
  }

  // Monitor USB device changes (Plug & Play webcams)
  if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
    navigator.mediaDevices.addEventListener('devicechange', () => {
      const currentSource = camSourceSelect ? camSourceSelect.value : 'simulado';
      if (currentSource === 'usb') {
        appendLog('console', '[CAM] Cambio de hardware detectado en puertos USB. Re-escaneando cámaras...', 'info');
        enumerateVideoDevices(localVideoStream);
      }
    });
  }

  function connectToESP32() {
    if (!esp32Toggle || !esp32Toggle.checked) return;
    
    const ip = robotIpInput ? robotIpInput.value.trim() : '192.168.4.1';
    if (connStatus) {
      connStatus.className = 'status-badge';
      connStatus.innerHTML = `<i class="fa-solid fa-satellite-dish"></i> Buscando Nodo ESP32...`;
    }

    if (robotSocket) {
      robotSocket.close();
      robotSocket = null;
    }

    // Start video streaming and websocket
    startLiveCameraStream();
    appendLog('console', `[RED] Intentando conectar con el robot en ws://${ip}/ws...`, 'warning');
    
    try {
      robotSocket = new WebSocket(`ws://${ip}/ws`);

      robotSocket.onopen = () => {
        if (reconnectInterval) {
          clearInterval(reconnectInterval);
          reconnectInterval = null;
        }
        if (connStatus) {
          connStatus.className = 'status-badge connected';
          connStatus.innerHTML = `<i class="fa-solid fa-link"></i> Enlace Seguro Activo`;
        }
        if (labelSim) labelSim.classList.remove('active');
        if (labelReal) labelReal.classList.add('active');
        
        appendLog('console', `[RED] ¡Enlace establecido con el robot! Recibiendo telemetría.`, 'success');
        synth.speak("Enlace WebSocket con el robot establecido con éxito.");
      };

      robotSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.temp !== undefined) state.sensors.temperature = parseFloat(data.temp);
          if (data.hum !== undefined) state.sensors.humidity = parseFloat(data.hum);
          if (data.press !== undefined) state.sensors.pressure = parseInt(data.press);
          if (data.ax !== undefined) state.sensors.accelX = Math.round(data.ax);
          if (data.ay !== undefined) state.sensors.accelY = Math.round(data.ay);
          if (data.flame !== undefined) {
            state.sensors.flame = !!data.flame;
            updateFlameStatusUI();
          }
          if (data.rain !== undefined) {
            state.sensors.rain = !!data.rain;
            updateRainStatusUI();
          }
          if (data.bat !== undefined) state.systemBattery = parseFloat(data.bat);
          if (data.solar !== undefined) state.solarPower = parseFloat(data.solar);
          if (data.lat !== undefined) state.sensors.gpsLat = parseFloat(data.lat);
          if (data.lon !== undefined) state.sensors.gpsLon = parseFloat(data.lon);

        } catch (e) {
          console.warn("Error parsing incoming WebSocket frame:", e);
        }
      };

      robotSocket.onclose = () => {
        robotSocket = null;
        if (connStatus) {
          connStatus.className = 'status-badge';
          connStatus.innerHTML = `<i class="fa-solid fa-wifi-slash"></i> Enlace Perdido`;
        }
        if (labelSim) labelSim.classList.add('active');
        if (labelReal) labelReal.classList.remove('active');
        
        appendLog('console', `[RED] Enlace perdido con el robot. Intentando reconexión...`, 'error');
        
        if (esp32Toggle && esp32Toggle.checked && !reconnectInterval) {
          reconnectInterval = setInterval(connectToESP32, 5000);
        }
      };

      robotSocket.onerror = (err) => {
        console.warn("WebSocket error:", err);
      };

    } catch (err) {
      console.error("Failed to construct WebSocket client:", err);
    }
  }

  function disconnectESP32() {
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
    if (robotSocket) {
      robotSocket.close();
      robotSocket = null;
    }
    if (connStatus) {
      connStatus.className = 'status-badge';
      connStatus.innerHTML = `<i class="fa-solid fa-wifi"></i> NODO AISLADO (LOCAL)`;
    }
    if (labelSim) labelSim.classList.add('active');
    if (labelReal) labelReal.classList.remove('active');
    
    stopLiveCameraStream();
    appendLog('console', `[RED] Enlace cerrado. Modo simulación activo.`, 'info');
    synth.speak("Enlace cerrado. Simulación restaurada.");
  }

  if (esp32Toggle) {
    esp32Toggle.addEventListener('change', () => {
      if (esp32Toggle.checked) {
        connectToESP32();
      } else {
        disconnectESP32();
      }
    });
  }

  // ==========================================
  // 6. LED LIGHT SPOTLIGHT SWITCH
  // ==========================================
  if (ledLightSwitch) {
    ledLightSwitch.addEventListener('change', (e) => {
      state.headlights = e.target.checked;
      if (ledLightOverlay) ledLightOverlay.classList.toggle('active', state.headlights);
      
      if (state.headlights) {
        appendLog('console', '[SISTEMA] Focos LED delanteros de alta potencia encendidos.', 'info');
        synth.speak('Focos LED activados');
      } else {
        appendLog('console', '[SISTEMA] Focos LED apagados.', 'info');
        synth.speak('Focos LED desactivados');
      }
      sendRobotCommand({ type: "lights", state: state.headlights });
    });
  }


  // ==========================================
  // 7. CAMERA CANVAS DRAWS & AI RADAR HUDS
  // ==========================================
  const ctxFront = canvasFrontal ? canvasFrontal.getContext('2d') : null;
  const ctxRear = canvasTrasera ? canvasTrasera.getContext('2d') : null;
  const ctxDrone = canvasDrone ? canvasDrone.getContext('2d') : null;

  function resizeCanvases() {
    [canvasFrontal, canvasTrasera, canvasDrone].forEach(canvas => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    });
  }
  
  window.addEventListener('resize', resizeCanvases);
  setTimeout(resizeCanvases, 200);

  let frameCount = 0;
  
  function drawCameraFeeds() {
    frameCount++;
    
    if (canvasFrontal && ctxFront) {
      const wF = canvasFrontal.width;
      const hF = canvasFrontal.height;
      if (wF > 0 && hF > 0) {
        let drewRealCamera = false;
        const camSource = camSourceSelect ? camSourceSelect.value : 'simulado';
        
        if (state.droneStatus !== 'flying') {
          if (camSource === 'esp32' && liveStreamActive) {
            try {
              ctxFront.drawImage(liveCameraImage, 0, 0, wF, hF);
              drewRealCamera = true;
            } catch (e) {
              // fallback
            }
          } else if (camSource === 'usb' && localVideoStream && localVideoElement.readyState >= 2) {
            try {
              ctxFront.drawImage(localVideoElement, 0, 0, wF, hF);
              drewRealCamera = true;
            } catch (e) {
              // fallback
            }
          }
        }

        if (!drewRealCamera) {
          ctxFront.fillStyle = '#020308';
          ctxFront.fillRect(0, 0, wF, hF);
          
          ctxFront.strokeStyle = 'rgba(0, 240, 255, 0.12)';
          ctxFront.lineWidth = 1;
          ctxFront.beginPath();
          ctxFront.moveTo(0, hF * 0.6);
          ctxFront.lineTo(wF, hF * 0.6);
          ctxFront.moveTo(wF * 0.5, hF * 0.6);
          ctxFront.lineTo(wF * 0.1, hF);
          ctxFront.moveTo(wF * 0.5, hF * 0.6);
          ctxFront.lineTo(wF * 0.9, hF);
          ctxFront.stroke();
          
          ctxFront.fillStyle = 'rgba(0, 240, 255, 0.01)';
          ctxFront.strokeStyle = 'rgba(0, 240, 255, 0.18)';
          ctxFront.beginPath();
          ctxFront.rect(wF * 0.08, hF * 0.25, wF * 0.22, hF * 0.35);
          ctxFront.rect(wF * 0.72, hF * 0.18, wF * 0.22, hF * 0.42);
          ctxFront.fill();
          ctxFront.stroke();

          ctxFront.strokeStyle = 'rgba(0, 240, 255, 0.3)';
          ctxFront.beginPath();
          ctxFront.moveTo(wF * 0.45, hF * 0.5);
          ctxFront.lineTo(wF * 0.47, hF * 0.55);
          ctxFront.lineTo(wF * 0.46, hF * 0.62);
          ctxFront.lineTo(wF * 0.49, hF * 0.7);
          ctxFront.stroke();
        }

        const jitterX = Math.sin(frameCount * 0.1) * (state.sensors.accelX / 10);
        const jitterY = Math.cos(frameCount * 0.1) * (state.sensors.accelY / 10);
        
        if (aiBoxFrontal) {
          if (!state.sensors.flame && Math.floor(frameCount / 180) % 2 === 0) {
            aiBoxFrontal.classList.remove('hidden');
            aiBoxFrontal.style.transform = `translate(${jitterX}px, ${jitterY}px)`;
            
            ctxFront.strokeStyle = 'var(--accent-orange)';
            ctxFront.lineWidth = 1.5;
            ctxFront.strokeRect(wF * 0.40 + jitterX, hF * 0.30 + jitterY, wF * 0.30, hF * 0.40);
            
            ctxFront.fillStyle = 'var(--accent-orange)';
            ctxFront.font = '7px Orbitron';
            ctxFront.fillText('ANALIZANDO ESTRUCTURA...', wF * 0.40 + jitterX, hF * 0.27 + jitterY);
            ctxFront.fillText('RANG: 1.45 MTR', wF * 0.40 + jitterX, hF * 0.74 + jitterY);
          } else {
            aiBoxFrontal.classList.add('hidden');
          }
        }
      }
    }

    if (canvasTrasera && ctxRear) {
      const wR = canvasTrasera.width;
      const hR = canvasTrasera.height;
      if (wR > 0 && hR > 0) {
        ctxRear.fillStyle = '#020205';
        ctxRear.fillRect(0, 0, wR, hR);
        
        ctxRear.fillStyle = 'rgba(0, 230, 118, 0.03)';
        ctxRear.strokeStyle = 'rgba(0, 230, 118, 0.25)';
        ctxRear.beginPath();
        ctxRear.moveTo(wR * 0.2, hR);
        ctxRear.lineTo(wR * 0.35, hR * 0.75);
        ctxRear.lineTo(wR * 0.65, hR * 0.75);
        ctxRear.lineTo(wR * 0.8, hR);
        ctxRear.closePath();
        ctxRear.fill();
        ctxRear.stroke();

        ctxRear.beginPath();
        ctxRear.moveTo(wR * 0.5, hR);
        ctxRear.lineTo(wR * 0.5, hR * 0.75);
        ctxRear.stroke();
        
        ctxRear.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctxRear.beginPath();
        ctxRear.moveTo(wR * 0.35, hR * 0.75);
        ctxRear.lineTo(wR * 0.48, hR * 0.5);
        ctxRear.moveTo(wR * 0.65, hR * 0.75);
        ctxRear.lineTo(wR * 0.52, hR * 0.5);
        ctxRear.stroke();
        
        ctxRear.fillStyle = 'rgba(255, 107, 0, 0.08)';
        ctxRear.strokeStyle = 'rgba(255, 107, 0, 0.3)';
        ctxRear.beginPath();
        ctxRear.arc(wR * 0.35, hR * 0.48, 12, 0, Math.PI * 2);
        ctxRear.fill();
        ctxRear.stroke();

        if (aiBoxTrasera) {
          if (Math.floor(frameCount / 240) % 3 === 1) {
            aiBoxTrasera.classList.remove('hidden');
            ctxRear.strokeStyle = 'var(--accent-cyan)';
            ctxRear.lineWidth = 1;
            ctxRear.strokeRect(wR * 0.20, hR * 0.25, wR * 0.45, hR * 0.50);
            
            ctxRear.fillStyle = 'var(--accent-cyan)';
            ctxRear.font = '7px Orbitron';
            ctxRear.fillText('OBSTÁCULO EN RUTA', wR * 0.20, hR * 0.22);
          } else {
            aiBoxTrasera.classList.add('hidden');
          }
        }
      }
    }

    if (canvasDrone && ctxDrone) {
      const wD = canvasDrone.width;
      const hD = canvasDrone.height;
      if (wD > 0 && hD > 0) {
        let drewRealCameraDrone = false;
        const camSource = camSourceSelect ? camSourceSelect.value : 'simulado';
        
        if (camSource === 'esp32' && liveStreamActive) {
          try {
            ctxDrone.drawImage(liveCameraImage, 0, 0, wD, hD);
            drewRealCameraDrone = true;
          } catch (e) {
            // fallback
          }
        } else if (camSource === 'usb' && localVideoStream && localVideoElement.readyState >= 2) {
          try {
            ctxDrone.drawImage(localVideoElement, 0, 0, wD, hD);
            drewRealCameraDrone = true;
          } catch (e) {
            // fallback
          }
        }
        
        if (!drewRealCameraDrone) {
          ctxDrone.fillStyle = '#010306';
          ctxDrone.fillRect(0, 0, wD, hD);
          
          ctxDrone.strokeStyle = 'rgba(0, 240, 255, 0.12)';
          ctxDrone.beginPath();
          const offset = (frameCount * 0.3) % 40;
          for (let r = offset; r < Math.max(wD, hD); r += 45) {
            ctxDrone.arc(wD * 0.5, hD * 0.55, r, 0, Math.PI * 2);
          }
          ctxDrone.stroke();
          
          ctxDrone.strokeStyle = 'rgba(0, 240, 255, 0.35)';
          ctxDrone.beginPath();
          ctxDrone.arc(wD * 0.5, hD * 0.55, 15, 0, Math.PI * 2);
          ctxDrone.stroke();
        }

        // Draw Drone Status Indicator on Canvas
        ctxDrone.fillStyle = (state.droneStatus === 'flying') ? 'var(--accent-green)' : 'rgba(0, 240, 255, 0.6)';
        ctxDrone.font = '6px Orbitron';
        const droneStatusText = (state.droneStatus === 'flying') ? 'DRON: EN VUELO (ACTIVO)' : 'DRON: STANDBY (HANGAR)';
        ctxDrone.fillText(droneStatusText, 8, 12);

        if (aiBoxDrone) {
          if (state.sensors.flame && state.droneStatus === 'flying') {
            const fireX = wD * 0.45 + Math.sin(frameCount * 0.05) * 8;
            const fireY = hD * 0.48 + Math.cos(frameCount * 0.05) * 8;

            ctxDrone.fillStyle = 'rgba(255, 59, 48, 0.25)';
            ctxDrone.strokeStyle = 'rgba(255, 59, 48, 0.8)';
            ctxDrone.beginPath();
            ctxDrone.arc(fireX, fireY, 20 + Math.sin(frameCount * 0.2) * 5, 0, Math.PI * 2);
            ctxDrone.fill();
            ctxDrone.stroke();
            
            ctxDrone.strokeStyle = 'var(--accent-red)';
            ctxDrone.lineWidth = 1.5;
            ctxDrone.strokeRect(fireX - 30, fireY - 30, 60, 60);

            ctxDrone.fillStyle = 'var(--accent-red)';
            ctxDrone.font = '8px Orbitron';
            ctxDrone.fillText('! AMENAZA TÉRMICA DETECTADA !', fireX - 55, fireY - 35);
            ctxDrone.fillText('TEMP: 423°C', fireX - 25, fireY + 42);

            aiBoxDrone.classList.remove('hidden');
          } else {
            aiBoxDrone.classList.add('hidden');
          }
        }
      }
    }

    requestAnimationFrame(drawCameraFeeds);
  }
  
  requestAnimationFrame(drawCameraFeeds);

  // Filters Controls
  if (toggleScanlinesBtn) {
    toggleScanlinesBtn.addEventListener('click', () => {
      state.cameraScanlines = !state.cameraScanlines;
      toggleScanlinesBtn.classList.toggle('active', state.cameraScanlines);
      document.querySelectorAll('.scanlines').forEach(el => el.classList.toggle('inactive', !state.cameraScanlines));
    });
  }

  if (toggleStaticBtn) {
    toggleStaticBtn.addEventListener('click', () => {
      state.cameraNoise = !state.cameraNoise;
      toggleStaticBtn.classList.toggle('active', state.cameraNoise);
      document.querySelectorAll('.static-noise').forEach(el => el.classList.toggle('active', state.cameraNoise));
    });
  }


  // ==========================================
  // 8. ACCELEROMETER SEISMIC OSCILLOSCOPE LOOP
  // ==========================================
  const oscCtx = oscilloscopeCanvas ? oscilloscopeCanvas.getContext('2d') : null;
  
  function resizeOscilloscope() {
    if (oscilloscopeCanvas && oscilloscopeCanvas.parentElement) {
      oscilloscopeCanvas.width = oscilloscopeCanvas.parentElement.clientWidth;
      oscilloscopeCanvas.height = oscilloscopeCanvas.parentElement.clientHeight;
    }
  }
  
  window.addEventListener('resize', resizeOscilloscope);
  setTimeout(resizeOscilloscope, 200);

  let oscPhase = 0;

  function drawOscilloscope() {
    if (oscilloscopeCanvas && oscCtx) {
      const w = oscilloscopeCanvas.width;
      const h = oscilloscopeCanvas.height;
      
      if (w > 0 && h > 0) {
        oscCtx.fillStyle = '#030408';
        oscCtx.fillRect(0, 0, w, h);
        
        oscCtx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        oscCtx.lineWidth = 1;
        for (let y = 0; y < h; y += 15) {
          oscCtx.beginPath();
          oscCtx.moveTo(0, y);
          oscCtx.lineTo(w, y);
          oscCtx.stroke();
        }
        for (let x = 0; x < w; x += 30) {
          oscCtx.beginPath();
          oscCtx.moveTo(x, 0);
          oscCtx.lineTo(x, h);
          oscCtx.stroke();
        }

        const baseline = h / 2;
        let amplitude = 2.5;
        let freq = 0.08;
        let speed = 0.15;

        if (state.locoMoving) {
          amplitude = 12 * state.locoSpeed;
          freq = 0.15;
          speed = 0.4;
        } else if (state.droneStatus === 'launching') {
          amplitude = 18;
          freq = 0.25;
          speed = 0.6;
        } else if (state.droneStatus === 'flying') {
          amplitude = 5;
          freq = 0.12;
          speed = 0.25;
        }

        if (state.sensors.flame) {
          amplitude += Math.random() * 8;
          freq = 0.2;
        }

        oscPhase += speed;

        oscCtx.strokeStyle = state.sensors.flame ? 'var(--accent-red)' : 'var(--accent-cyan)';
        oscCtx.lineWidth = 1.5;
        oscCtx.shadowColor = state.sensors.flame ? 'var(--accent-red)' : 'var(--accent-cyan)';
        oscCtx.shadowBlur = 4;
        
        oscCtx.beginPath();
        for (let x = 0; x < w; x++) {
          const noise = (Math.random() - 0.5) * (amplitude * 0.15);
          const y = baseline + Math.sin(x * freq + oscPhase) * amplitude + noise;
          
          if (x === 0) {
            oscCtx.moveTo(x, y);
          } else {
            oscCtx.lineTo(x, y);
          }
        }
        oscCtx.stroke();
        oscCtx.shadowBlur = 0;
      }
    }

    requestAnimationFrame(drawOscilloscope);
  }

  requestAnimationFrame(drawOscilloscope);


  // ==========================================
  // 9. REAL-TIME SENSORS & CHART.JS (OFFLINE-SAFE)
  // ==========================================
  const chartCtx = document.getElementById('tempHumChart') ? document.getElementById('tempHumChart').getContext('2d') : null;
  
  const chartData = {
    labels: Array(10).fill(''),
    datasets: [
      {
        label: 'Temp (°C)',
        data: Array(10).fill(22.4),
        borderColor: '#ff6b00',
        backgroundColor: 'rgba(255, 107, 0, 0.1)',
        yAxisID: 'y-temp',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 2,
      },
      {
        label: 'Humedad (%)',
        data: Array(10).fill(68),
        borderColor: '#00f0ff',
        backgroundColor: 'rgba(0, 240, 255, 0.05)',
        yAxisID: 'y-hum',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 2,
      }
    ]
  };

  let telemetryChart = null;
  if (chartCtx && typeof Chart !== 'undefined') {
    try {
      telemetryChart = new Chart(chartCtx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { color: '#8f9bb3', font: { family: 'Orbitron', size: 9 } }
            }
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { display: false } },
            'y-temp': {
              type: 'linear',
              position: 'left',
              min: 15,
              max: 45,
              grid: { color: 'rgba(255,255,255,0.03)' },
              ticks: { color: '#ff6b00', font: { family: 'Orbitron', size: 8 } }
            },
            'y-hum': {
              type: 'linear',
              position: 'right',
              min: 20,
              max: 100,
              grid: { drawOnChartArea: false },
              ticks: { color: '#00f0ff', font: { family: 'Orbitron', size: 8 } }
            }
          }
        }
      });
    } catch (e) {
      console.warn("Failed to initialize telemetry Chart:", e);
    }
  }

  // Loop updating telemetry sensors
  setInterval(() => {
    const esp32Connected = robotSocket && robotSocket.readyState === WebSocket.OPEN;

    if (!esp32Connected) {
      state.sensors.temperature += (Math.random() - 0.5) * 0.2;
      state.sensors.temperature = Math.max(18, Math.min(38, state.sensors.temperature));

      state.sensors.humidity += (Math.random() - 0.5) * 0.5 - (state.sensors.temperature - 22.4) * 0.05;
      state.sensors.humidity = Math.max(30, Math.min(95, state.sensors.humidity));

      state.sensors.pressure += Math.floor((Math.random() - 0.5) * 3);
      state.sensors.pressure = Math.max(990, Math.min(1030, state.sensors.pressure));

      // Rain & Flame checks
      const randEvent = Math.random();
      if (randEvent < 0.05) {
        state.sensors.rain = !state.sensors.rain;
        updateRainStatusUI();
      }

      if (randEvent > 0.96) {
        state.sensors.flame = !state.sensors.flame;
        updateFlameStatusUI();
      }

      // Accelerometer readings
      if (state.locoMoving) {
        state.sensors.accelX = Math.round((Math.random() - 0.5) * 8);
        state.sensors.accelY = Math.round((Math.random() - 0.5) * 8);
      } else {
        state.sensors.accelX = Math.round((Math.random() - 0.5) * 3);
        state.sensors.accelY = Math.round((Math.random() - 0.5) * 3);
      }

      // Solar panels
      state.solarPower = parseFloat((15 + Math.sin(frameCount * 0.05) * 3 + Math.random()).toFixed(1));
    }

    // Update charts safely
    if (telemetryChart && typeof Chart !== 'undefined') {
      try {
        chartData.datasets[0].data.shift();
        chartData.datasets[0].data.push(parseFloat(state.sensors.temperature.toFixed(1)));
        
        chartData.datasets[1].data.shift();
        chartData.datasets[1].data.push(parseFloat(state.sensors.humidity.toFixed(1)));

        telemetryChart.update('none');
      } catch (err) {}
    }

    // Update Pressure dial
    if (gaugePressVal) gaugePressVal.textContent = state.sensors.pressure;
    if (gaugePressRing) {
      const pressPct = (state.sensors.pressure - 990) / 40;
      const dashoffset = 251.2 - (251.2 * Math.min(1, Math.max(0, pressPct)));
      gaugePressRing.style.strokeDashoffset = dashoffset;
    }

    if (tiltXText) tiltXText.textContent = `${state.sensors.accelX}°`;
    if (tiltYText) tiltYText.textContent = `${state.sensors.accelY}°`;

    const solarValCard = document.getElementById('solar-stat-val');
    if (solarValCard) solarValCard.textContent = `${state.solarPower} W`;

    // GPS Radar Position
    if (state.droneStatus === 'flying') {
      if (!esp32Connected) {
        state.sensors.gpsLat += (Math.random() - 0.5) * 0.0001;
        state.sensors.gpsLon += (Math.random() - 0.5) * 0.0001;
      }
      
      if (radarLatText) radarLatText.textContent = `N ${state.sensors.gpsLat.toFixed(5)}`;
      if (radarLonText) radarLonText.textContent = `W ${Math.abs(state.sensors.gpsLon).toFixed(5)}`;
      
      if (radarPing) {
        const pingX = 50 + (Math.sin(frameCount * 0.02) * 20);
        const pingY = 55 + (Math.cos(frameCount * 0.02) * 20);
        radarPing.style.left = `${pingX}%`;
        radarPing.style.top = `${pingY}%`;
      }
    }

    // Dynamic AI Co-Pilot Telemetry Auditor Updates
    const aiInsightEl = document.getElementById('ai-auditor-insight');
    const aiLatencyEl = document.getElementById('ai-auditor-latency');
    if (aiLatencyEl) {
      aiLatencyEl.textContent = `${Math.floor(Math.random() * 9) + 8}ms`;
    }
    if (aiInsightEl) {
      if (state.sensors.flame) {
        aiInsightEl.innerHTML = `<span style="color:var(--accent-red); font-weight:bold;">[CRÍTICO] FUEGO DETECTADO.</span> Inferencia visual reporta firmas térmicas de incendio. Activando sistema de mitigación por rociadores.`;
      } else if (state.sensors.rain) {
        aiInsightEl.innerHTML = `<span style="color:var(--accent-cyan); font-weight:bold;">[ADVERTENCIA] LLUVIA DETECTADA.</span> Precipitación activa. Activando limpia-cámaras y restringiendo velocidad del robot terrestre.`;
      } else if (Math.abs(state.sensors.accelX) > 5 || Math.abs(state.sensors.accelY) > 5) {
        aiInsightEl.innerHTML = `<span style="color:var(--accent-cyan); font-weight:bold;">[ALERTA SÍSMICA] VIBRACIÓN ELEVADA.</span> Oscilación física registrada por el acelerómetro. Analizando integridad estructural.`;
      } else {
        const insights = [
          "Firma térmica normal. Analizando concreto en busca de fisuras superficiales con YOLOv8 (Precisión: 99.2%).",
          "Análisis barométrico: Presión atmosférica estable. No se detectan frentes de baja presión.",
          "Inferencia en la nube activa. Telemetría de sensores en base alineada con el modelo predictivo.",
          "Procesamiento visual en curso: Dron aéreo reporta cero focos de fuego en zona norte."
        ];
        const idx = Math.floor((Date.now() / 5000) % insights.length);
        aiInsightEl.innerHTML = `<span style="color:#00ff66;">[OK]</span> ${insights[idx]}`;
      }
    }

    // Update Top Header Status Panel (Connect it dynamically!)
    if (topGpsVal) {
      topGpsVal.textContent = `${state.sensors.gpsLat.toFixed(4)}° N, ${Math.abs(state.sensors.gpsLon).toFixed(4)}° W`;
    }
    if (topAltVal) {
      const baselineAlt = 1120 + Math.round((Math.random() - 0.5) * 4);
      topAltVal.textContent = `${baselineAlt.toLocaleString()} m s.n.m.`;
    }
    
    // Decrement battery slowly or charge it based on solar panels
    if (!esp32Connected) {
      if (state.solarPower > 16.5) {
        state.systemBattery = Math.min(100, parseFloat((state.systemBattery + 0.1).toFixed(1)));
      } else {
        state.systemBattery = Math.max(5, parseFloat((state.systemBattery - 0.05).toFixed(1)));
      }
    }
    
    if (topBatVal) {
      const charState = state.solarPower > 16.5 ? 'CARGANDO' : 'DESCARGANDO';
      topBatVal.textContent = `${Math.round(state.systemBattery)}% (${charState})`;
      if (state.systemBattery < 20) {
        topBatVal.className = 'value text-glow-red';
      } else if (state.systemBattery < 50) {
        topBatVal.className = 'value text-glow-orange';
      } else {
        topBatVal.className = 'value text-glow-green';
      }
    }
    
    if (topSignalVal) {
      const signalMs = 70 + Math.floor(Math.random() * 40);
      topSignalVal.innerHTML = `<i class="fa-solid fa-wifi"></i> ${signalMs} ms`;
    }

  }, 2000);

  // Initialize normal flame
  if (flameIndicator) {
    flameIndicator.classList.add('flame-normal');
    flameIndicator.classList.remove('flame-danger');
  }


  // ==========================================
  // 10. TERRESTRIAL LOCOMOTION TRACK ROTATIONS
  // ==========================================
  if (locoSpeedSlider) {
    locoSpeedSlider.addEventListener('input', (e) => {
      state.locoSpeed = parseInt(e.target.value);
      synth.beep(400 + state.locoSpeed * 50, 'sine', 0.04);
    });
  }

  // Locomotive Driving hold bindings (Supports touch events natively)
  function bindDrivingDirection(btn, directionName) {
    if (!btn) return;
    let driveInterval = null;

    const startDriving = (e) => {
      if (e) e.preventDefault();
      if (driveInterval) return; // Prevent double trigger
      
      state.locoMoving = true;
      state.locoDirection = directionName;
      
      appendLog('console', `[TRACCIÓN] Conduciendo hacia ${directionName} a velocidad ${state.locoSpeed}x...`, 'success');
      sendRobotCommand({ type: "drive", direction: directionName, speed: state.locoSpeed });
      
      driveInterval = setInterval(() => {
        state.wheelAngle += 15 * state.locoSpeed;
        
        const wheels = ['wheel-1', 'wheel-2', 'wheel-3', 'wheel-4', 'wheel-5', 'wheel-6'];
        wheels.forEach(id => {
          const wEl = document.getElementById(id);
          if (wEl) {
            const cx = wEl.getAttribute('cx');
            const cy = wEl.getAttribute('cy');
            wEl.setAttribute('transform', `rotate(${state.wheelAngle} ${cx} ${cy})`);
          }
        });

        synth.beep(120 + state.locoSpeed * 20, 'triangle', 0.08);
      }, 80);
    };

    const stopDriving = (e) => {
      if (e) e.preventDefault();
      if (driveInterval) {
        clearInterval(driveInterval);
        driveInterval = null;
      }
      if (state.locoMoving) {
        state.locoMoving = false;
        state.locoDirection = null;
        appendLog('console', `[TRACCIÓN] Motores detenidos. Frenos electromagnéticos acoplados.`, 'info');
        sendRobotCommand({ type: "drive", direction: "stop" });
      }
    };

    // Desktop mouse events
    btn.addEventListener('mousedown', startDriving);
    btn.addEventListener('mouseup', stopDriving);
    btn.addEventListener('mouseleave', stopDriving);

    // Mobile touch events
    btn.addEventListener('touchstart', startDriving, { passive: false });
    btn.addEventListener('touchend', stopDriving, { passive: false });
  }

  bindDrivingDirection(btnLocoForward, 'ADELANTE');
  bindDrivingDirection(btnLocoBack, 'ATRÁS');
  bindDrivingDirection(btnLocoLeft, 'GIRO IZQUIERDA');
  bindDrivingDirection(btnLocoRight, 'GIRO DERECHA');


  // ==========================================
  // 11. DRONE HANGAR LAUNCH & MANUAL FLIGHT
  // ==========================================
  function updateGlobalStatusBadge() {
    if (state.sensors.flame) return;
    
    if (globalStatusBadge && globalStatusText) {
      if (state.droneStatus === 'hangar') {
        globalStatusBadge.className = 'system-status online';
        globalStatusText.textContent = 'ONLINE - EN BASE';
      } else if (state.droneStatus === 'flying') {
        globalStatusBadge.className = 'system-status flying';
        globalStatusText.textContent = 'VOLANDO - ACTIVO';
      }
    }
  }

  function appendLog(type, text, level = 'info') {
    const p = document.createElement('div');
    p.className = `log-line ${level}`;
    p.textContent = text;
    
    if (type === 'console' && takeoffLogs) {
      takeoffLogs.appendChild(p);
      takeoffLogs.scrollTop = takeoffLogs.scrollHeight;
    }
  }

  function lockFlightControls() {
    if (manualControlsCard) manualControlsCard.classList.add('locked');
    if (flightSystemStatus) {
      flightSystemStatus.className = 'system-level';
      flightSystemStatus.textContent = 'SISTEMA LOCK';
    }
    if (droneFeedOverlay && state.droneStatus !== 'flying') {
      droneFeedOverlay.classList.add('offline');
    }
  }

  function unlockFlightControls() {
    if (state.droneStatus === 'flying') {
      if (manualControlsCard) manualControlsCard.classList.remove('locked');
      if (flightSystemStatus) {
        flightSystemStatus.className = 'system-level unlocked';
        flightSystemStatus.textContent = 'CONTROL MANUAL';
      }
      
      if (droneFeedOverlay) droneFeedOverlay.classList.remove('offline');
      if (hudDroneAlt) hudDroneAlt.textContent = `ALT: ${state.droneAlt} m`;
      if (hudDroneBat) hudDroneBat.textContent = `BAT: ${state.droneBattery}%`;
    }
  }

  function runTakeoffSequence() {
    if (state.droneStatus !== 'hangar') return;
    
    state.droneStatus = 'launching';
    if (btnPreFlight) {
      btnPreFlight.disabled = true;
      btnPreFlight.textContent = 'INICIANDO DESPLIEGUE...';
    }
    
    if (takeoffLogs) takeoffLogs.innerHTML = '';
    
    synth.speak("Iniciando secuencia de despliegue del dron. Autodiagnóstico de sistemas.");

    const steps = [
      { t: 0, text: '[SISTEMA] Autodiagnóstico de telemetría multi-agente...', lvl: 'info' },
      { t: 1200, text: '[SISTEMA] Conexión RF: 915 MHz activa | Batería UAV: 100% - OK', lvl: 'success' },
      { t: 2400, text: '[MECÁNICA] Abriendo hangar trasero superior del robot...', lvl: 'warning' },
      { t: 3800, text: '[MECÁNICA] Elevando plataforma de lanzamiento - OK', lvl: 'info' },
      { t: 5000, text: '[SISTEMA] Arrancando rotores aéreos... Calibrando giroscopio.', lvl: 'warning' },
      { t: 6500, text: '[VUELO] ¡DESPEGUE EXITOSO! Elevando altitud de seguridad...', lvl: 'success' },
      { t: 8000, text: '[VUELO] Dron estabilizado a 5.0 metros de altura.', lvl: 'success' },
      { t: 9200, text: '[VUELO] Señal de video HD transmitiendo. Enlace activo.', lvl: 'success' }
    ];

    const schematicDrone = document.getElementById('schematic-drone');
    if (schematicDrone) {
      schematicDrone.style.transition = 'transform 8s ease-in-out';
      schematicDrone.style.transform = 'translate(45px, -65px) scale(1.15)';
    }

    steps.forEach(step => {
      setTimeout(() => {
        appendLog('console', step.text, step.lvl);
        
        if (step.lvl === 'success') synth.beep(700, 'sine', 0.05);
        if (step.lvl === 'warning') synth.beep(350, 'triangle', 0.15);
        
        if (step.t === 2400) synth.speak("Abriendo hangar");
        if (step.t === 5000) synth.speak("Motores encendidos");
        if (step.t === 6500) synth.speak("Despegue confirmado");

        if (step.t === 9200) {
          state.droneStatus = 'flying';
          state.droneAlt = 5.0;
          state.droneBattery = 100;
          
          if (btnPreFlight) {
            btnPreFlight.disabled = false;
            btnPreFlight.textContent = 'DRON DESPLEGADO (VOLANDO)';
          }
          
          updateGlobalStatusBadge();
          unlockFlightControls();
          
          synth.speak("Dron en el aire. Conexión de video enlazada.");
        }
      }, step.t);
    });
  }

  if (btnPreFlight) {
    btnPreFlight.addEventListener('click', () => {
      if (state.droneStatus === 'hangar') {
        sendRobotCommand({ type: "drone", action: "takeoff" });
        runTakeoffSequence();
      }
    });
  }

  function bindJoystickDir(btn, directionName) {
    if (!btn) return;
    let flightInterval = null;

    const startFlying = (e) => {
      if (e) e.preventDefault();
      if (state.droneStatus !== 'flying') return;
      if (flightInterval) return; // Prevent double interval

      appendLog('console', `[PILOTO] Comando manual de vuelo: Moviendo dron ${directionName}...`, 'info');
      sendRobotCommand({ type: "drone", action: "move", direction: directionName });
      
      flightInterval = setInterval(() => {
        state.droneBattery -= 0.5;
        state.droneBattery = parseFloat(Math.max(0, state.droneBattery).toFixed(1));
        if (hudDroneBat) hudDroneBat.textContent = `BAT: ${state.droneBattery}%`;
        
        synth.beep(250, 'sine', 0.05);
        if (state.droneBattery <= 0) {
          clearInterval(flightInterval);
          flightInterval = null;
          appendLog('console', '[VUELO] Batería agotada. Caída de emergencia.', 'error');
          runLandingSequence('land');
        }
      }, 200);
    };

    const stopFlying = (e) => {
      if (e) e.preventDefault();
      if (flightInterval) {
        clearInterval(flightInterval);
        flightInterval = null;
      }
      sendRobotCommand({ type: "drone", action: "stop" });
    };

    // Mouse events
    btn.addEventListener('mousedown', startFlying);
    btn.addEventListener('mouseup', stopFlying);
    btn.addEventListener('mouseleave', stopFlying);

    // Touch events for mobile compatibility
    btn.addEventListener('touchstart', startFlying, { passive: false });
    btn.addEventListener('touchend', stopFlying, { passive: false });
  }

  // Flight joystick arrow binds
  bindJoystickDir(joyForward, 'Hacia Adelante');
  bindJoystickDir(joyBack, 'Hacia Atrás');
  bindJoystickDir(joyLeft, 'Girar a la Izquierda');
  bindJoystickDir(joyRight, 'Girar a la Derecha');

  if (droneAltSlider) {
    droneAltSlider.addEventListener('input', (e) => {
      if (state.droneStatus !== 'flying') return;
      state.droneAlt = parseFloat(e.target.value);
      if (sliderAltVal) sliderAltVal.textContent = state.droneAlt.toFixed(1);
      if (hudDroneAlt) hudDroneAlt.textContent = `ALT: ${state.droneAlt.toFixed(1)} m`;
      sendRobotCommand({ type: "drone", action: "alt", value: state.droneAlt });
    });
  }

  // Landing sequence
  function runLandingSequence(landType = 'land') {
    if (state.droneStatus !== 'flying') return;
    
    state.droneStatus = 'landing';
    lockFlightControls();
    
    if (btnPreFlight) {
      btnPreFlight.disabled = true;
      btnPreFlight.textContent = 'DRON ATERRIZANDO...';
    }
    
    const logPrefix = landType === 'rtl' ? '[RTL]' : '[ATERRIZAJE]';
    appendLog('console', `${logPrefix} Iniciando secuencia de retorno y descenso...`, 'warning');
    synth.speak("Retornando a base");

    let currentAlt = state.droneAlt;
    const landInterval = setInterval(() => {
      currentAlt -= 1.0;
      if (currentAlt <= 0.5) {
        clearInterval(landInterval);
        
        state.droneStatus = 'hangar';
        state.droneAlt = 0.0;
        
        if (btnPreFlight) {
          btnPreFlight.disabled = false;
          btnPreFlight.textContent = 'PREPARAR DESPEGUE';
        }
        
        if (droneAltSlider) droneAltSlider.value = 5.0;
        if (sliderAltVal) sliderAltVal.textContent = '5.0';
        
        appendLog('console', `[SISTEMA] Hangar cerrado. Dron acoplado en hangar trasero.`, 'success');
        synth.speak("Aterrizaje completado. Dron asegurado.");

        const schematicDrone = document.getElementById('schematic-drone');
        if (schematicDrone) {
          schematicDrone.style.transform = 'translate(0px, 0px) scale(1)';
        }
        
        updateGlobalStatusBadge();
      } else {
        state.droneAlt = parseFloat(currentAlt.toFixed(1));
        appendLog('console', `${logPrefix} Altitud de descenso: ${state.droneAlt} m...`, 'info');
      }
    }, 800);
  }

  if (btnRTL) {
    btnRTL.addEventListener('click', () => {
      sendRobotCommand({ type: "drone", action: "rtl" });
      runLandingSequence('rtl');
    });
  }

  if (btnLand) {
    btnLand.addEventListener('click', () => {
      sendRobotCommand({ type: "drone", action: "land" });
      runLandingSequence('land');
    });
  }


  // ==========================================
  // 12. STEAM LABS INTERACTIVITIES
  // ==========================================
  function updateLabsProgress() {
    let completedCount = 0;
    if (state.steamLab1Loaded && quizFeedbackBox && quizFeedbackBox.className.includes('success')) completedCount++;
    if (state.steamSimScore >= 50) completedCount++;
    if (state.aiAccuracy >= 100) completedCount++;
    
    if (studentLabsProgress) {
      studentLabsProgress.textContent = `COMPLETADOS: ${completedCount}/3`;
    }
  }

  // LAB 1
  let labChartInstance = null;
  if (btnLoadLabData) {
    btnLoadLabData.addEventListener('click', () => {
      state.steamLab1Loaded = true;
      btnLoadLabData.disabled = true;
      btnLoadLabData.textContent = 'Datos de Misión Cargados';
      if (labDataStatus) {
        labDataStatus.textContent = 'Datos Listos';
        labDataStatus.className = 'status-indicator-inline text-glow-green';
      }
      
      if (labQuizBox) labQuizBox.classList.remove('hidden');
      
      const labCtx = document.getElementById('labMiniChart');
      if (labCtx && typeof Chart !== 'undefined') {
        const labData = {
          labels: ['13:00', '13:10', '13:20', '13:30', '13:40', '13:50', '14:00', '14:10', '14:20', '14:30'],
          datasets: [
            {
              label: 'Presión Atmosférica (hPa)',
              data: [1020, 1018, 1017, 1014, 1011, 1007, 998, 988, 990, 993],
              borderColor: '#a855f7',
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              borderWidth: 2,
              yAxisID: 'y-press'
            },
            {
              label: 'Volumen Lluvia (mm)',
              data: [0, 0, 0, 0, 0, 1.2, 5.8, 18.4, 25.1, 12.0],
              borderColor: '#00f0ff',
              backgroundColor: 'rgba(0, 240, 255, 0.15)',
              borderWidth: 2,
              yAxisID: 'y-rain',
              fill: true
            }
          ]
        };
        
        try {
          labChartInstance = new Chart(labCtx.getContext('2d'), {
            type: 'line',
            data: labData,
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { labels: { color: '#8f9bb3', font: { size: 8 } } }
              },
              scales: {
                x: { ticks: { color: '#8f9bb3', font: { size: 8 } } },
                'y-press': { type: 'linear', position: 'left', ticks: { color: '#a855f7', font: { size: 8 } } },
                'y-rain': { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#00f0ff', font: { size: 8 } } }
              }
            }
          });
        } catch (e) {
          console.warn("Failed to initialize Lab Chart:", e);
        }
      }
      
      updateLabsProgress();
    });
  }

  if (btnSubmitQuiz) {
    btnSubmitQuiz.addEventListener('click', () => {
      const checked = document.querySelector('input[name="quiz-ans"]:checked');
      if (!checked) {
        if (quizFeedbackBox) {
          quizFeedbackBox.className = 'quiz-feedback error';
          quizFeedbackBox.textContent = 'Selecciona una respuesta antes de continuar.';
        }
        return;
      }
      
      if (checked.value === 'b') {
        if (quizFeedbackBox) {
          quizFeedbackBox.className = 'quiz-feedback success';
          quizFeedbackBox.innerHTML = '<i class="fa-solid fa-circle-check"></i> ¡Excelente análisis científico! La presión atmosférica suele disminuir bruscamente antes de una lluvia o tempestad debido a la formación de una celda de baja presión. <br><strong>Recompensa: +100 Puntos STEAM</strong>';
        }
        synth.victory();
      } else {
        if (quizFeedbackBox) {
          quizFeedbackBox.className = 'quiz-feedback error';
          quizFeedbackBox.textContent = 'Incorrecto. Mira el gráfico detenidamente: a las 13:50 (cuando inicia la lluvia de 1.2mm), la línea violeta de la presión atmosférica ha bajado de 1020 a 1007 hPa. Vuelve a intentarlo.';
        }
        synth.beep(250, 'sawtooth', 0.2);
      }
      updateLabsProgress();
    });
  }

  // LAB 2
  let windSpeedDirection = 1;
  
  function updateSimDronePos() {
    if (!rpmSlider) return;
    const rpm = parseInt(rpmSlider.value);
    
    state.steamSimWind += (Math.random() - 0.5) * 2;
    state.steamSimWind = Math.max(5, Math.min(30, state.steamSimWind));
    if (simWindSpeedText) simWindSpeedText.textContent = Math.round(state.steamSimWind);
    
    const lift = rpm * 0.05;
    const gravity = 2.5;
    const windEffect = (state.steamSimWind * 0.03) * windSpeedDirection;
    
    state.steamSimDronePos += (lift - gravity + windEffect);
    state.steamSimDronePos = Math.max(5, Math.min(150, state.steamSimDronePos));
    
    if (simDroneElement) simDroneElement.style.bottom = `${state.steamSimDronePos}px`;
    
    synth.beep(150 + rpm * 2, 'sine', 0.05);

    if (state.steamSimDronePos >= 50 && state.steamSimDronePos <= 95) {
      if (simFeedbackMsg) {
        simFeedbackMsg.className = 'sim-status-msg text-glow-green';
        simFeedbackMsg.textContent = 'Hover estable. Capturando muestras de aire...';
      }
      state.steamSimScore += 1;
      
      if (state.steamSimScore === 50) {
        if (simFeedbackMsg) {
          simFeedbackMsg.className = 'sim-status-msg text-glow-green';
          simFeedbackMsg.innerHTML = '<strong>¡Misión de Vuelo Exitosa!</strong> Has mantenido la altitud correcta por tiempo prolongado. <br><strong>+150 Puntos STEAM</strong>';
        }
        synth.victory();
        updateLabsProgress();
      }
    } else if (state.steamSimDronePos > 95) {
      if (simFeedbackMsg) {
        simFeedbackMsg.className = 'sim-status-msg text-glow-red';
        simFeedbackMsg.textContent = '¡PRECAUCIÓN! Drone demasiado alto. Ráfagas fuertes.';
      }
    } else {
      if (simFeedbackMsg) {
        simFeedbackMsg.className = 'sim-status-msg text-glow-red';
        simFeedbackMsg.textContent = '¡PRECAUCIÓN! Altitud baja. Cerca del suelo.';
      }
    }
    
    if (Math.random() < 0.08) {
      windSpeedDirection *= -1;
    }
  }

  if (btnStartSim) {
    btnStartSim.addEventListener('click', () => {
      if (state.steamSimActive) return;
      
      state.steamSimActive = true;
      if (simDroneElement) simDroneElement.classList.add('flying');
      btnStartSim.disabled = true;
      
      state.steamSimScore = 0;
      state.steamSimInterval = setInterval(updateSimDronePos, 100);
      appendLog('console', '[SIMULACIÓN] Laboratorio 2 iniciado.', 'info');
    });
  }

  if (rpmSlider && rpmDisplayVal) {
    rpmSlider.addEventListener('input', (e) => {
      rpmDisplayVal.textContent = `${e.target.value}%`;
    });
  }

  if (btnResetSim) {
    btnResetSim.addEventListener('click', resetSim);
  }

  function resetSim() {
    state.steamSimActive = false;
    clearInterval(state.steamSimInterval);
    if (simDroneElement) {
      simDroneElement.classList.remove('flying');
      simDroneElement.style.bottom = '20px';
    }
    if (btnStartSim) btnStartSim.disabled = false;
    
    state.steamSimDronePos = 20;
    if (rpmSlider) rpmSlider.value = 50;
    if (rpmDisplayVal) rpmDisplayVal.textContent = '50%';
    if (simFeedbackMsg) {
      simFeedbackMsg.className = 'sim-status-msg';
      simFeedbackMsg.textContent = 'Simulador reiniciado. Ajusta RPM y pulsa Iniciar.';
    }
  }

  // LAB 3
  const crackCtx = canvasAiCrack ? canvasAiCrack.getContext('2d') : null;
  
  function generateCrackSample() {
    if (!canvasAiCrack || !crackCtx) return;
    const w = canvasAiCrack.width;
    const h = canvasAiCrack.height;
    
    crackCtx.fillStyle = '#1e1e1e';
    crackCtx.fillRect(0, 0, w, h);
    
    crackCtx.fillStyle = '#222';
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      crackCtx.fillRect(x, y, 1, 1);
    }
    
    const rand = Math.random();
    if (rand < 0.33) {
      state.currentCrackSample = 'sano';
      crackCtx.fillStyle = '#333';
      crackCtx.fillRect(w * 0.4, h * 0.4, 4, 4);
    } else if (rand < 0.66) {
      state.currentCrackSample = 'leve';
      crackCtx.strokeStyle = '#050505';
      crackCtx.lineWidth = 1;
      crackCtx.beginPath();
      crackCtx.moveTo(w * 0.3, h * 0.1);
      crackCtx.lineTo(w * 0.45, h * 0.5);
      crackCtx.lineTo(w * 0.4, h * 0.9);
      crackCtx.stroke();
    } else {
      state.currentCrackSample = 'grave';
      crackCtx.strokeStyle = '#000';
      crackCtx.lineWidth = 3.5;
      crackCtx.beginPath();
      crackCtx.moveTo(w * 0.5, h * 0.05);
      crackCtx.lineTo(w * 0.35, h * 0.4);
      crackCtx.lineTo(w * 0.6, h * 0.7);
      crackCtx.lineTo(w * 0.45, h * 0.95);
      crackCtx.stroke();
      
      crackCtx.strokeStyle = '#000';
      crackCtx.lineWidth = 1;
      crackCtx.beginPath();
      crackCtx.moveTo(w * 0.35, h * 0.4);
      crackCtx.lineTo(w * 0.15, h * 0.6);
      crackCtx.stroke();
    }
  }

  generateCrackSample();

  function evaluateAiClassification(choice) {
    if (state.aiAccuracy >= 100) return;

    if (choice === state.currentCrackSample) {
      state.aiAccuracy += 20;
      state.aiAccuracy = Math.min(100, state.aiAccuracy);
      
      if (aiAccuracyBar) aiAccuracyBar.style.width = `${state.aiAccuracy}%`;
      if (aiAccuracyPct) aiAccuracyPct.textContent = `${state.aiAccuracy}%`;
      
      if (aiTrainingFeedback) {
        aiTrainingFeedback.className = 'ai-feedback-box success';
        aiTrainingFeedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Muestra clasificada con éxito. Entrenando...';
      }
      synth.beep(900, 'sine', 0.06);

      if (state.aiAccuracy === 100) {
        if (aiCertBadge) aiCertBadge.classList.remove('hidden');
        if (aiTrainingFeedback) aiTrainingFeedback.innerHTML = '<strong>¡ENTRENAMIENTO COMPLETADO!</strong> Precisión máxima alcanzada. Red neuronal lista para el campo.';
        synth.victory();
        synth.speak('Red neuronal entrenada con éxito. Certificado desbloqueado.');
      } else {
        setTimeout(generateCrackSample, 1200);
      }
    } else {
      state.aiAccuracy -= 10;
      state.aiAccuracy = Math.max(0, state.aiAccuracy);
      
      if (aiAccuracyBar) aiAccuracyBar.style.width = `${state.aiAccuracy}%`;
      if (aiAccuracyPct) aiAccuracyPct.textContent = `${state.aiAccuracy}%`;
      
      if (aiTrainingFeedback) {
        aiTrainingFeedback.className = 'ai-feedback-box error';
        aiTrainingFeedback.textContent = `Error de clasificación. Muestra clasificada incorrectamente. Re-calibrando...`;
      }
      synth.beep(200, 'sawtooth', 0.25);
      
      setTimeout(generateCrackSample, 1500);
    }
    updateLabsProgress();
  }

  if (btnAiSano) btnAiSano.addEventListener('click', () => evaluateAiClassification('sano'));
  if (btnAiLeve) btnAiLeve.addEventListener('click', () => evaluateAiClassification('leve'));
  if (btnAiGrave) btnAiGrave.addEventListener('click', () => evaluateAiClassification('grave'));

  // Teacher downloads
  function triggerDownloadFeedback(filename) {
    if (exportMsg) exportMsg.textContent = `Generando reporte...`;
    setTimeout(() => {
      if (exportMsg) {
        exportMsg.textContent = `¡Archivo ${filename} creado y descargado con éxito!`;
        setTimeout(() => { exportMsg.textContent = ''; }, 4000);
      }
    }, 1200);
  }

  if (btnExportCSV) {
    btnExportCSV.addEventListener('click', () => {
      triggerDownloadFeedback('ARGOS_telemetria_historico.csv');
    });
  }
  
  if (btnExportJSON) {
    btnExportJSON.addEventListener('click', () => {
      triggerDownloadFeedback('ARGOS_telemetria_historico.json');
    });
  }

  // ==========================================
  // 13. FLOATING AI ASSISTANT CHATBOT LOGIC
  // ==========================================
  const chatbotToggle = document.getElementById('chatbot-toggle');
  const chatbotContainer = document.getElementById('chatbot-container');
  const chatbotClose = document.getElementById('chatbot-close');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSendBtn = document.getElementById('chatbot-send-btn');
  const chatbotMessages = document.getElementById('chatbot-messages');

  if (chatbotToggle && chatbotContainer) {
    chatbotToggle.addEventListener('click', () => {
      chatbotContainer.classList.toggle('hidden');
      if (!chatbotContainer.classList.contains('hidden')) {
        synth.beep(750, 'sine', 0.08);
        if (chatbotInput) chatbotInput.focus();
      }
    });
  }

  if (chatbotClose && chatbotContainer) {
    chatbotClose.addEventListener('click', () => {
      chatbotContainer.classList.add('hidden');
      synth.beep(400, 'sine', 0.05);
    });
  }

  function appendChatMessage(sender, text) {
    if (!chatbotMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${sender}`;
    msgDiv.innerHTML = text;
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function getChatbotResponse(input) {
    let clean = input.toLowerCase().trim();
    // Normalize punctuation
    clean = clean.replace(/[?¿!¡.,:;()\-+_]/g, " ");
    // Normalize accents
    clean = clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    // Trim and collapse multiple spaces
    clean = clean.replace(/\s+/g, " ").trim();

    const esp32Connected = robotSocket && robotSocket.readyState === WebSocket.OPEN;
    const words = clean.split(' ');

    // 0. URGENT PRIORITY CO-CREATORS & EASTER EGGS
    
    // Dayron's Mom Easter Egg (Oculto)
    if (clean.includes('mama de dayron') || clean.includes('madre de dayron')) {
      return "¡Uff! Déjame decirte que su mamá es una mamasita rica, hermosa, preciosa y sumamente divina. ¡Un total encanto de mujer!";
    }

    // Discord JS Moderation Bot / TFAGaming / Bots Discord
    if (clean.includes('discord') || clean.includes('tfagaming') || clean.includes('moderacion bot') || clean.includes('moderador') || clean.includes('bots discord') || clean.includes('discordjs')) {
      return "El <strong>Discord.js Moderation Bot (arquitectura de TFAGaming)</strong> es una plataforma de automatización de servidores escrita en Node.js usando **discord.js v14**:<br>" +
             "• <strong>Handlers Modulares:</strong> Utiliza un **Command Handler** y **Event Handler** dinámicos para registrar comandos Slash de la API de Discord de manera limpia y sin archivos sobrecargados.<br>" +
             "• <strong>Comandos Tácticos:</strong> Incluye moderación en caliente como `/ban`, `/kick`, `/mute`, `/unmute` y `/warn` respaldados por una base de datos **MongoDB** (Mongoose) para registrar el historial de infracciones de los miembros.<br>" +
             "• <strong>Ciberseguridad del Bot:</strong> Resguarda las claves de la aplicación en un archivo `.env` (`process.env.DISCORD_TOKEN`) para evitar que piratas informáticos roben el token del bot al subir el código a GitHub.<br>" +
             "• <strong>Estructura del Proyecto:</strong> Organizado bajo directorios `/commands`, `/events` e `/index.js` inicial.";
    }

    // Gemini API Key Rotator Proxy Server / jwadow
    if (clean.includes('rotator') || clean.includes('rotador') || clean.includes('proxy') || clean.includes('api key rotator') || clean.includes('key rotator') || clean.includes('keys gemini')) {
      return "El <strong>Gemini API Key Rotator Proxy Server (de jwadow)</strong> es un proxy inverso diseñado para optimizar el consumo de la API de Gemini:<br>" +
             "• <strong>Rotación Inteligente:</strong> Administra un pool de claves API de Gemini y las rota a cada petición para evitar el agotamiento de cuotas gratuitas.<br>" +
             "• <strong>Mitigación de Errores 429:</strong> Si una clave es bloqueada por exceso de velocidad de peticiones (RPM/TPM), el servidor proxy la pone en lista de espera e inyecta la siguiente clave activa de forma transparente para la aplicación.<br>" +
             "• <strong>Arquitectura Ligera:</strong> Ideal para desplegar en microservicios y acoplar a plataformas como ARGOS para inferencia masiva y gratuita.";
    }

    // Premium Laravel Template / Ahmadjamil888
    if (clean.includes('laravel') || clean.includes('laravel template') || clean.includes('ahmadjamil') || clean.includes('plantilla laravel') || clean.includes('php laravel')) {
      return "La plantilla <strong>PREMIUM-LARAVEL-template (de Ahmadjamil888)</strong> es un framework estructurado para chatbots de inteligencia artificial en PHP:<br>" +
             "• <strong>Arquitectura Laravel 12.x:</strong> Incorpora controladores y migraciones nativas para autenticar operadores (`/login` y `/register`) y enrutar las salas de chat.<br>" +
             "• <strong>Diseño Black & White:</strong> El frontend cuenta con un tema minimalista y profesional en blanco y negro, diseñado con TailwindCSS y hojas de estilo personalizadas.<br>" +
             "• <strong>Mapeo de Base de Datos MySQL:</strong> Guarda conversaciones completas, datos de sesiones de operador e historiales de mensajes.<br>" +
             "• <strong>Conector de Gemini:</strong> Integra el SDK de Google para dar respuestas dinámicas de IA conversacional en el dashboard.";
    }

    // Redes Neuronales / CNN
    if (clean.includes('red neuronal') || clean.includes('redes neuronales') || clean.includes('cnn') || clean.includes('convolucional')) {
      return "ARGOS utiliza <strong>Redes Neuronales Convolucionales (CNN)</strong> para el procesamiento visual.<br>" +
             "• <strong>¿Por qué se usan?</strong> Las CNN imitan la corteza visual humana, procesando imágenes por capas (bordes, formas y texturas) en tiempo real. Esto permite al robot clasificar el daño en pavimentos y concreto de forma automática.";
    }

    // YOLO / Detección de Objetos
    if (clean.includes('yolo') || clean.includes('reconocimiento') || clean.includes('deteccion') || clean.includes('objeto') || clean.includes('objetos')) {
      return "El sistema visual de ARGOS y su dron aéreo integran el modelo <strong>YOLO (You Only Look Once)</strong>.<br>" +
             "• <strong>¿Por qué se usa?</strong> Es un algoritmo de detección de objetos en tiempo real extremadamente veloz que procesa el feed de video completo de una sola pasada. Permite identificar focos de fuego, personas atrapadas o grietas en estructuras de forma instantánea.";
    }

    // Deep Learning / Aprendizaje Profundo
    if (clean.includes('deep learning') || clean.includes('aprendizaje profundo') || clean.includes('entrenamiento') || clean.includes('tensorflow') || clean.includes('keras')) {
      return "El cerebro artificial de ARGOS fue entrenado bajo <strong>Deep Learning (Aprendizaje Profundo)</strong> usando frameworks como TensorFlow y Keras.<br>" +
             "• <strong>¿Cómo funciona?</strong> Alimentamos el modelo con miles de fotos etiquetadas de grietas, incendios y carreteras sanas. Mediante retropropagación (backpropagation), la IA aprende a identificar patrones complejos sin intervención humana.";
    }

    // Conexión con IA / IA Integrada
    if (clean.includes('conexion con ia') || clean.includes('ia integrada') || clean.includes('conexion ia') || clean.includes('procesamiento')) {
      return "La <strong>conexión con Inteligencia Artificial</strong> de ARGOS se realiza de dos formas:<br>" +
             "1. <strong>Procesamiento de Borde (Edge AI):</strong> Filtra y clasifica firmas sísmicas (MPU6050) y variaciones barométricas directamente en hardware local.<br>" +
             "2. <strong>Servicio en la Nube / API Visual:</strong> Envía la telemetría y video al nodo de visión para inferencia de redes neuronales, retornando alertas de habitabilidad a esta interfaz web en milisegundos.";
    }

    // Resiliencia Civil
    if (clean.includes('resiliencia') || clean.includes('civil') || clean.includes('desastre') || clean.includes('prevencion')) {
      return "La <strong>resiliencia civil</strong> es la capacidad de una comunidad para resistir, adaptarse y recuperarse rápidamente ante desastres (como desbordes de ríos o sismos). ARGOS entrena a los estudiantes en esta disciplina mediante simulaciones interactivas de riesgo en el Aula STEAM.";
    }

    // Co-creators / Team / Dayron Urbina / Misael Pintado
    if (clean.includes('dayron') || clean.includes('urbina') || clean.includes('zapata') || clean.includes('robotica') || clean.includes('equipo') || clean.includes('creadores') || clean.includes('crearon') || clean.includes('diseño') || clean.includes('fundo') || clean.includes('fundador') || clean.includes('diseñador')) {
      return "ARGOS fue diseñado y fundado por un equipo de alto rendimiento del Instituto Superior Hermanos Cárcamo:<br>" +
             "• <strong>Misael Pintado:</strong> Líder del proyecto, encargado de la arquitectura de plataforma, programación del firmware ESP32, desarrollo de la telemetría interactiva IoT y diseño web.<br>" +
             "• <strong>Dayron Urbina Zapata:</strong> Diseñador experto en robótica, encargado del modelado tridimensional, estructura física del chasis terrestre de orugas y acople de sistemas mecánicos.<br>" +
             "Trabajando en equipo y uniendo sus talentos de la carrera de <strong>APSTI</strong>, demostraron que con pasión y esfuerzo coordinado, ¡unidos todo se puede lograr!";
    }

    // ESP32
    if (clean.includes('esp32') || clean.includes('microcontrolador') || clean.includes('devkit') || clean.includes('chip') || clean.includes('cerebro')) {
      return "El <strong>ESP32 Devkit V1</strong> es el cerebro electrónico central de ARGOS.<br>" +
             "• <strong>¿Por qué se usa?</strong> Porque ofrece un procesador de doble núcleo de 240 MHz con <strong>WiFi y Bluetooth integrados</strong>. Esto permite recibir tus mandos en tiempo real desde esta interfaz web, procesar las lecturas de los sensores y accionar los motores.<br>" +
             "<em>¿Quieres saber qué sensor procesa primero? Pregúntame por el DHT22 o el MPU6050.</em>";
    }

    // DHT22
    if (clean.includes('dht22') || clean.includes('dht11') || clean.includes('higrometro')) {
      return "El <strong>DHT22 (AM2302)</strong> es el sensor digital termohigrómetro.<br>" +
             "• <strong>¿Por qué se usa?</strong> Se prefiere sobre el DHT11 porque tiene **mayor precisión** (±2% de humedad y ±0.5°C de temperatura) y un rango de lectura de 0 a 100% de humedad. Es clave para medir la habitabilidad y el microclima de zonas críticas.<br>" +
             "<em>¿Sabías que puedes ver su gráfica de temperatura en tiempo real en la consola? ¡Pruébalo!</em>";
    }

    // BMP280
    if (clean.includes('bmp280') || clean.includes('bmp180') || clean.includes('bmp')) {
      return "El <strong>BMP280</strong> es el barómetro digital de presión atmosférica desarrollado por Bosch.<br>" +
             "• <strong>¿Por qué se usa?</strong> Mide la <strong>presión atmosférica (hPa)</strong>. Las caídas bruscas de presión atmosférica son el indicador físico principal de tormentas severas. ARGOS lo usa para predecir frentes de lluvia antes de que inicien.<br>" +
             "<em>¿Quieres ver su lectura actual? Pregúntame 'presión atmosférica'.</em>";
    }

    // MPU6050
    if (clean.includes('mpu6050') || clean.includes('giroscopio') || clean.includes('inclinometro') || clean.includes('acelerometro')) {
      return "El <strong>MPU-6050</strong> es una unidad de medición inercial (IMU) de 6 ejes.<br>" +
             "• <strong>¿Por qué se usa?</strong> Combina un acelerómetro triaxial y un giroscopio. Permite **monitorear ondas sísmicas** (movimiento de tierra) en el osciloscopio y auditar el ángulo de inclinación de las orugas para evitar volcaduras en pendientes accidentadas de hasta 35°.<br>" +
             "<em>¡Mueve el robot o activa el simulador para ver cómo oscila el gráfico de vibraciones sísmicas!</em>";
    }

    // L298N / Driver
    if (clean.includes('l298n') || clean.includes('puente h') || clean.includes('driver') || clean.includes('motores') || clean.includes('motor')) {
      return "El <strong>Puente H L298N</strong> es el driver o etapa de potencia de los motores terrestres.<br>" +
             "• <strong>¿Por qué se usa?</strong> El chip ESP32 trabaja a 3.3V y no tiene la potencia para mover las orugas. El L298N toma las señales lógicas de control del ESP32 y canaliza la corriente directa de la batería de 12V hacia los motores del chasis todoterreno.<br>" +
             "<em>Prueba a presionar las flechas de dirección en la consola para ver las orugas avanzar.</em>";
    }

    // WebSockets / WiFi / Communication
    if (clean.includes('websocket') || clean.includes('conexion') || clean.includes('wifi') || clean.includes('comunicacion') || clean.includes('red') || clean.includes('servidor')) {
      return "La comunicación entre la interfaz web y el robot terrestre se realiza mediante el protocolo <strong>WebSockets</strong> de comunicación bidireccional en tiempo real.<br>" +
             "• <strong>¿Por qué se usa?</strong> A diferencia de HTTP normal, WebSockets mantiene un canal abierto constante que permite enviar mandos físicos de pilotaje y recibir datos de sensores con una latencia de apenas milisegundos, garantizando que el robot responda al instante.";
    }

    // PWM / Speed Control
    if (clean.includes('pwm') || clean.includes('modulacion') || clean.includes('ancho de pulso')) {
      return "El control de velocidad de las orugas del robot terrestre utiliza <strong>PWM (Modulación por Ancho de Pulso)</strong>.<br>" +
             "• <strong>¿Por qué se usa?</strong> Permite variar el ciclo de trabajo de la señal eléctrica entregada a los motores para regular su velocidad de manera analógica simulada (valores de 0 a 255) desde la consola web, optimizando la maniobrabilidad.";
    }

    // I2C Bus Protocol
    if (clean.includes('i2c') || clean.includes('bus') || clean.includes('sda') || clean.includes('scl')) {
      return "El bus de comunicación <strong>I2C (Inter-Integrated Circuit)</strong> es utilizado por el ESP32 para comunicarse con el acelerómetro MPU-6050 y el barómetro BMP280.<br>" +
             "• <strong>¿Por qué se usa?</strong> Requiere únicamente dos cables: SDA (Datos) y SCL (Reloj). Esto permite conectar múltiples sensores compartiendo las mismas líneas de comunicación física, simplificando drásticamente el circuito electrónico.";
    }

    // LiFePO4 Batteries
    if (clean.includes('bateria') || clean.includes('alimentacion') || clean.includes('lifepo4') || clean.includes('litio') || clean.includes('autonomia') || clean.includes('corriente')) {
      return "La alimentación central de ARGOS corre por cuenta de un banco de baterías de tecnología <strong>LiFePO4 (Fosfato de Hierro y Litio)</strong> de 12V.<br>" +
             "• <strong>¿Por qué se usa?</strong> Ofrecen una excelente vida útil de más de 3000 ciclos de carga, no tienen efecto memoria y brindan una alta estabilidad térmica y química frente a sobrecalentamientos, lo cual las hace ideales para misiones de prevención civil.";
    }

    // Rain Sensor (placa conductiva)
    if (clean.includes('lluvia') || clean.includes('llueve') || clean.includes('agua') || clean.includes('mojado') || clean.includes('precipitacion')) {
      const stateStr = state.sensors.rain 
        ? "🚨 ¡ATENCIÓN! Indica <strong>precipitación activa (lluvia)</strong> en la zona." 
        : "✅ Está seco. <strong>No hay lluvias detectadas</strong>.";
      return `El <strong>Sensor de Lluvia (placa conductiva)</strong> detecta el contacto del agua.<br>` +
             `• <strong>¿Por qué se usa?</strong> Permite alertar al instante sobre caída de lluvia constante, lo que en zonas de alto riesgo ayuda a anticipar desbordes de ríos y activar protocolos de evacuación.<br>` +
             `• <strong>Estado actual:</strong> ${stateStr}<br>` +
             `<em>¿Quieres simular lluvia? En la consola de mandos manuales puedes activar el interruptor de lluvia.</em>`;
    }

    // Flame/Fire Sensor
    if (clean.includes('fuego') || clean.includes('flama') || clean.includes('incendio') || clean.includes('calor') || clean.includes('termica') || clean.includes('termico')) {
      const stateStr = state.sensors.flame
        ? "🚨 ¡ALERTA ROJA! <strong>¡FOCO DE INCENDIO DETECTADO!</strong> Sirena y alarmas activadas."
        : "✅ Monitoreo Seguro. <strong>No hay amenazas de fuego</strong>.";
      return `El <strong>Sensor de Flama Infrarrojo</strong> detecta la radiación electromagnética de las llamas (760nm-1100nm).<br>` +
             `• <strong>¿Por qué se usa?</strong> A diferencia de sensores de humo tradicionales que tardan minutos en activarse, el fotodiodo infrarrojo reacciona en **milisegundos** ante la presencia visual de fuego, reportando incendios forestales u hogareños inmediatamente.<br>` +
             `• <strong>Estado actual:</strong> ${stateStr}<br>` +
             `<em>¿Sabías que puedes activar el fuego simulado en la consola para disparar la sirena y ver la alarma roja?</em>`;
    }

    // Barometer hPa
    if (clean.includes('presion') || clean.includes('barometro') || clean.includes('hpa') || clean.includes('bmp')) {
      return `El <strong>Barómetro Digital BMP280</strong> es un sensor piezoeléctrico de alta presión.<br>` +
             `• <strong>Función:</strong> Medir la presión atmosférica del entorno para detectar frentes de baja presión que anuncian tormentas severas.<br>` +
             `• <strong>Estado actual:</strong> <strong>${state.sensors.pressure} hPa</strong>.`;
    }

    // Termohigrometer DHT22
    if (clean.includes('temperatura') || clean.includes('humedad') || clean.includes('clima') || clean.includes('ambiente') || clean.includes('dht')) {
      return `El <strong>Sensor Termohigrómetro DHT22</strong> es un módulo digital de temperatura y humedad.<br>` +
             `• <strong>Función:</strong> Medir el microclima en vivo para prever olas de calor, frentes secos y auditar la habitabilidad de las zonas de patrullaje.<br>` +
             `• <strong>Estado actual:</strong> Temperatura: <strong>${state.sensors.temperature.toFixed(1)}°C</strong> | Humedad: <strong>${state.sensors.humidity.toFixed(1)}%</strong>.`;
    }

    // Panel Solar
    if (clean.includes('solar') || clean.includes('panel') || clean.includes('celda') || clean.includes('energia') || clean.includes('generacion') || clean.includes('sol')) {
      return `El <strong>Panel Solar Monocristalino de 20W</strong> está integrado en el lomo superior del chasis.<br>` +
             `• <strong>Función:</strong> Absorber radiación solar y recargar la batería de LiFePO4 mediante un circuito regulador MPPT.<br>` +
             `• <strong>Estado actual:</strong> Generación: <strong>${state.solarPower} W</strong> | Nivel de Batería Central: <strong>${state.systemBattery}%</strong>.`;
    }

    // GPS Module
    if (clean.includes('gps') || clean.includes('coordenada') || clean.includes('satelite') || clean.includes('radar') || clean.includes('latitud') || clean.includes('longitud') || clean.includes('posicion') || clean.includes('ubicacion')) {
      return `El <strong>Módulo de Posicionamiento Satelital GPS Neo-6M</strong> calcula la posición del robot mediante satélites.<br>` +
             `• <strong>Función:</strong> Georreferenciar al robot ARGOS, mapear sectores en emergencia y guiar al dron a coordenadas precisas.<br>` +
             `• <strong>Coordenadas actuales:</strong> Latitud: <strong>${state.sensors.gpsLat.toFixed(5)}</strong>, Longitud: <strong>${state.sensors.gpsLon.toFixed(5)}</strong>.`;
    }

    // Aerial Drone
    if (clean.includes('dron') || clean.includes('drone') || clean.includes('volar') || clean.includes('vuelo') || clean.includes('hangar') || clean.includes('despegue') || clean.includes('altura') || clean.includes('altitud') || clean.includes('aereo')) {
      let statusStr = "";
      if (state.droneStatus === 'hangar') {
        statusStr = `Acoplado en su Hangar (Standby). Batería: <strong>${state.droneBattery}%</strong>.`;
      } else if (state.droneStatus === 'launching') {
        statusStr = `Ejecutando secuencia de pre-vuelo y elevación.`;
      } else if (state.droneStatus === 'landing') {
        statusStr = `Fase de aproximación y retorno.`;
      } else if (state.droneStatus === 'flying') {
        statusStr = `En vuelo activo a una altitud de <strong>${state.droneAlt.toFixed(1)} metros</strong>.`;
      }
      return `El <strong>Dron de Exploración Aérea</strong> es un micro-cuadricóptero integrado en la rampa mecánica de ARGOS.<br>` +
             `• <strong>Función:</strong> Despegar en zonas anegadas para transmitir video cenital, buscar sobrevivientes y registrar fallas en el terreno.<br>` +
             `• <strong>Estado actual:</strong> ${statusStr}`;
    }

    // Wheels / Tracks Locomotion
    if (clean.includes('oruga') || clean.includes('motores') || clean.includes('motor') || clean.includes('traccion') || clean.includes('velocidad') || clean.includes('mover') || clean.includes('movimiento') || clean.includes('marcha') || clean.includes('direccion')) {
      const stateStr = state.locoMoving
        ? `En movimiento hacia <strong>${state.locoDirection}</strong> (Velocidad: <strong>${state.locoSpeed}x</strong>).`
        : "Detenido. Frenos de orugas bloqueados.";
      return `El <strong>Sistema de Tracción Terrestre por Orugas</strong> cuenta con motores de CC de 12V y reductores metálicos.<br>` +
             `• <strong>Función:</strong> Proporcionar tracción de alto torque para superar pendientes de hasta 35°, lodo, rocas y asfalto roto.<br>` +
             `• <strong>Estado actual:</strong> ${stateStr}`;
    }

    // 2. GENERAL SENSORS INQUIRY (Falls here if no specific sensor was named but the word "sensor" is present)
    if (clean.includes('sensor') || clean.includes('sensores')) {
      return "ARGOS está equipado con una red de sensores robustos para auditoría de campo:<br>" +
             "- <strong>Sensor de Lluvia (Capacitivo):</strong> Detecta precipitaciones e inundaciones.<br>" +
             "- <strong>Sensor de Flama (Infrarrojo):</strong> Detecta radiación térmica de incendios.<br>" +
             "- <strong>Acelerómetro (MPU-6050):</strong> Registra vibraciones sísmicas e inclinación.<br>" +
             "- <strong>Barómetro (BMP280):</strong> Mide la presión atmosférica y predice frentes de tormentas.<br>" +
             "- <strong>Termohigrómetro (DHT22):</strong> Registra temperatura y humedad ambiental.<br>" +
             "- <strong>GPS (Neo-6M):</strong> Transmite coordenadas de posicionamiento.";
    }

    // 3. GENERAL CONVERSATIONAL TOPICS
    
    // Arduino
    if (clean.includes('arduino')) {
      return "<strong>Arduino</strong> es una plataforma de hardware y software libre. En el proyecto ARGOS, usamos microcontroladores avanzados (como el ESP32 Devkit V1) programados bajo el entorno de Arduino para procesar los datos de los sensores y mover los motores de las orugas.";
    }

    // IA / Artificial Intelligence
    if (words.includes('ia') || clean.includes('inteligencia artificial') || clean.includes('vision por computadora') || clean.includes('computadora')) {
      return "La <strong>Inteligencia Artificial (IA)</strong> en ARGOS ejecuta modelos de visión artificial en tiempo real. Se utiliza para clasificar la gravedad de grietas en pistas y concreto (Sano, Leve, Grave) y detectar amenazas de fuego mediante las cámaras de exploración.";
    }

    // APSTI / Career
    if (clean.includes('apsti') || clean.includes('carrera') || clean.includes('servicios ti') || clean.includes('arquitectura de plataforma')) {
      return "<strong>APSTI</strong> es la carrera de <strong>Arquitectura de Plataformas y Servicios de Tecnologías de la Información</strong>. Estudia el diseño, configuración y soporte de redes, servidores, ciberseguridad y sistemas de Internet de las Cosas (IoT) como el robot ARGOS.";
    }

    // IESTP Hermanos Carcamo / Institute
    if (clean.includes('instituto') || clean.includes('hermanos') || clean.includes('carcamo') || clean.includes('paita') || clean.includes('piura')) {
      return "El <strong>Instituto Superior Tecnológico Público Hermanos Cárcamo</strong> es la institución tecnológica líder de Paita donde el fundador <strong>Misael Pintado</strong> cursa la carrera de APSTI, impulsando proyectos de innovación y resiliencia civil.";
    }

    // Difference between Robot and Drone
    if (clean.includes('diferencia') || clean.includes('comparacion')) {
      return "La diferencia es su entorno de exploración: el robot <strong>ARGOS</strong> patrulla por tierra usando orugas todoterreno de 12V, mientras que el <strong>Dron</strong> realiza despegue vertical para explorar zonas aéreas o inundadas donde las orugas no pueden ingresar.";
    }

    // Asistente / Qué haces / Función / Cumple
    if (clean.includes('que haces') || clean.includes('para que sirves') || clean.includes('funcion') || clean.includes('cumple') || clean.includes('cumples') || clean.includes('proposito') || clean.includes('sirve') || clean.includes('sirves')) {
      return "Mi función es actuar como el <strong>asistente táctico de IA</strong> de ARGOS. Puedo auditar la telemetría (humedad, lluvia, fuego, sismos), coordinar el vuelo del dron y guiarte en el Aula STEAM con exámenes, juegos interactivos y reportes.";
    }

    // Theological / Creator
    if (clean.includes('creo') || clean.includes('creador')) {
      return "El único que crea las cosas es <strong>Dios</strong>. Pero si quieres saber quiénes me fundaron y diseñaron, fue el equipo conformado por <strong>Misael Pintado</strong> y <strong>Dayron Urbina</strong>, estudiantes del Instituto Superior Hermanos Cárcamo.";
    }

    // Arcade Games
    if (clean.includes('juego') || clean.includes('arcade') || clean.includes('trivia') || clean.includes('mision') || clean.includes('simulador') || clean.includes('kahoot') || clean.includes('jugar') || clean.includes('divertido')) {
      return `El Aula STEAM cuenta con un <strong>Terminal Arcade</strong> con dos desafíos interactivos:<br><br>` +
             `1. <strong>Trivia de Prevención (Estilo Kahoot):</strong> Un test de 5 preguntas sobre hardware y prevención, con un temporizador de 15 segundos y multiplicador de racha (combos).<br>` +
             `2. <strong>Simulador de Misiones:</strong> Un mapa táctico interactivo donde enrutas al robot a emergencias de sismos, lluvia o fuego, evalúas sensores en vivo desde una consola de comando y tomas decisiones civiles.`;
    }

    // Virtual Classroom
    if (clean.includes('aula') || clean.includes('laboratorio') || clean.includes('clase') || clean.includes('certificado') || clean.includes('practica') || clean.includes('examen') || clean.includes('leccion')) {
      return "El Aula STEAM cuenta con 3 laboratorios interactivos: 1) Análisis climático de presión/lluvias, 2) Simulador de vuelo de sustentación frente al viento, y 3) Detección de grietas por IA. ¡Responde y completa los laboratorios para obtener tu certificado!";
    }

    // Roles and Profiles
    if (clean.includes('rol') || clean.includes('perfil') || clean.includes('roles') || clean.includes('permisos') || clean.includes('cambiar')) {
      return "Los roles disponibles son:<br>" +
             "- <strong>Público General:</strong> Solo lectura, pero con mandos físicos habilitados en modo DEMO.<br>" +
             "- <strong>Operador:</strong> Control absoluto de la telemetría, consola y pilotaje del Dron.<br>" +
             "- <strong>Estudiante:</strong> Acceso a laboratorios virtuales y al panel de exámenes.<br>" +
             "- <strong>Docente:</strong> Capacidad de exportación de reportes PDF/CSV/JSON de telemetría.";
    }

    // Telemetry Summary / Status
    if (clean.includes('estado') || clean.includes('resumen') || clean.includes('reporte') || clean.includes('status') || clean.includes('sistema') || clean.includes('auditar') || clean.includes('diagnostico')) {
      const emergencyStr = state.sensors.flame ? "⚠️ ¡EMERGENCIA ACTIVA POR FUEGO!" : (state.sensors.rain ? "🌧️ precipitación en curso" : "✅ Monitoreo Seguro");
      return `<div style="font-family: monospace; font-size: 10px; background: rgba(0,240,255,0.03); border-left: 2px solid var(--accent-cyan); padding: 8px; line-height: 1.5; color:#00ff66;">` +
             `<strong>[AUDITORÍA DE TELEMETRÍA ARGOS]</strong><br>` +
             `- Conexión Física: ${esp32Connected ? 'ESP32 ONLINE' : 'MODO SIMULADOR'}<br>` +
             `- Batería General: ${state.systemBattery}% (Aporte Solar: ${state.solarPower} W)<br>` +
             `- Sensores Clima: Temp ${state.sensors.temperature.toFixed(1)}°C | Hum ${state.sensors.humidity.toFixed(1)}%<br>` +
             `- Sensor Lluvia: ${state.sensors.rain ? 'MOJADO (Precipitación)' : 'SECO (Normal)'}<br>` +
             `- Sensor Flama: ${state.sensors.flame ? '¡ALERTA ROJA!' : 'SEGURO (Sin flama)'}<br>` +
             `- Dron Aéreo: ${state.droneStatus.toUpperCase()} (Altitud: ${state.droneAlt.toFixed(1)}m | Batería: ${state.droneBattery}%)<br>` +
             `- Estado Alerta: ${emergencyStr}</div>`;
    }

    // Emergencies Alert
    if (clean.includes('alarma') || clean.includes('emergencia') || clean.includes('peligro') || clean.includes('riesgo') || clean.includes('alerta')) {
      if (state.sensors.flame) {
        return "🚨 <strong>¡ALERTA CRÍTICA DE INCENDIO!</strong> El sensor infrarrojo reporta llamas activas. He disparado la sirena auditiva y las alarmas visuales. Se debe enrutar el robot al sector y avisar a bomberos.";
      }
      if (state.sensors.rain) {
        return "🌧️ <strong>Alerta de Lluvia:</strong> Se reporta caída de agua constante en el chasis. Posible riesgo de inundaciones o desborde en las zonas bajas del río.";
      }
      return "✅ <strong>Sistema Seguro:</strong> Todos los sensores indican que no hay situaciones de peligro o incendios activos en el perímetro en este momento.";
    }

    // Conversational replies: OK / Bacan / Affirmations
    if (clean === 'ok' || clean === 'bacan' || clean === 'perfecto' || clean === 'bien' || clean === 'bueno' || clean === 'dale' || clean === 'chevere' || clean === 'excelente') {
      return "¡Excelente! Si necesitas auditar algún componente (como el ESP32 o el barómetro), conocer el estado del dron o divertirte en el Arcade, avísame. ¡ARGOS está a tu servicio!";
    }

    // Conversational replies: No sé / No entiendo
    if (clean.includes('no se') || clean.includes('no entiendo') || clean.includes('no lo se') || clean.includes('ni idea')) {
      return "No te preocupes, estoy programado para asistirte paso a paso. Puedes escribirme consultas directas sobre el robot, por ejemplo: <em>'¿Qué es la IA?'</em> o <em>'¿Para qué sirve el barómetro?'</em>. ¡Inténtalo!";
    }

    // Conversational replies: Por qué
    if (clean.includes('por que') || clean.includes('porque')) {
      return "ARGOS fue diseñado para reducir los tiempos de respuesta ante inundaciones o incendios en comunidades. Usamos hardware integrado porque recolecta datos meteorológicos y sísmicos en el acto. ¿Te interesa saber por qué usamos el sensor MPU6050 o el DHT22?";
    }

    // Conversational replies: Qué sabes / Qué haces
    if (clean.includes('que sabes') || clean.includes('que conoces') || clean.includes('que haces') || clean.includes('que puedes hacer')) {
      return "Tengo conocimiento avanzado sobre la plataforma ARGOS. Sé diagnosticar la telemetría en tiempo real, explicarte el uso de microcontroladores (ESP32, puente H, bus I2C, modulación PWM, baterías LiFePO4) y guiarte a través del Aula STEAM.";
    }

    // Conversational replies: Qué eres / Quién eres
    if (clean.includes('que eres') || clean.includes('dime que eres') || clean.includes('quien eres') || clean.includes('argos') || clean.includes('robot') || clean.includes('plataforma')) {
      return "Soy el <strong>asistente de Inteligencia Artificial</strong> de la plataforma ARGOS, un ecosistema multi-agente terrestre y aéreo diseñado para la prevención civil de riesgos ambientales y la educación STEAM.";
    }

    // Hello/Greetings
    if (clean.includes('hola') || clean.includes('saludos') || clean.includes('buenos dias') || clean.includes('buenas tardes') || clean.includes('hey')) {
      return "¡Hola! Estoy listo para auditar el sistema. Pregúntame por sensores, el estado del clima, el estado del robot, los juegos o las lecciones del aula STEAM.";
    }

    // Help Commands
    if (clean.includes('ayuda') || clean.includes('comandos') || clean.includes('pregunta')) {
      return "Puedes preguntarme cosas como:<br>" +
             "- *'¿Quién te diseñó?'*<br>" +
             "- *'¿Qué hace el sensor de lluvia?'*<br>" +
             "- *'¿Cuál es la función del acelerómetro?'*<br>" +
             "- *'¿Qué juegos interactivos tienes?'*<br>" +
             "- *'Dame un reporte del estado del sistema'*";
    }

    return "Entendido. He auditado la telemetría en tiempo real y todos los nodos de ARGOS corren estables. Puedes preguntarme sobre sensores específicos (lluvia, sismos, fuego, panel solar), mandos de dirección, el vuelo del dron o los juegos interactivos del aula.";
  }

  // Load and save Gemini Key from UI input
  const chatbotGeminiKeyInput = document.getElementById('chatbot-gemini-key');
  const chatbotApiStatus = document.getElementById('chatbot-api-status');

  function updateChatbotApiStatus() {
    if (!chatbotApiStatus || !chatbotGeminiKeyInput) return;
    const hasKey = chatbotGeminiKeyInput.value.trim().length > 0;
    if (hasKey) {
      chatbotApiStatus.style.color = '#00ff66';
      chatbotApiStatus.innerHTML = '<i class="fa-solid fa-circle"></i> GEMINI';
    } else {
      chatbotApiStatus.style.color = '#ff3e3e';
      chatbotApiStatus.innerHTML = '<i class="fa-solid fa-circle"></i> LOCAL';
    }
  }

  if (chatbotGeminiKeyInput) {
    const savedKey = localStorage.getItem('ARGOS_GEMINI_API_KEY');
    if (savedKey) {
      chatbotGeminiKeyInput.value = savedKey;
    }
    updateChatbotApiStatus();
    
    chatbotGeminiKeyInput.addEventListener('input', () => {
      localStorage.setItem('ARGOS_GEMINI_API_KEY', chatbotGeminiKeyInput.value.trim());
      updateChatbotApiStatus();
    });
  }

  async function fetchGeminiAIResponse(userMessage, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const systemInstruction = 
      "Eres el Asistente de IA de la plataforma de prevención civil y robótica ARGOS, " +
      "co-creada por los estudiantes de APSTI Gerson Misael Pintado Zapata (Programador y Mandos) y Dayron Urbina Zapata (Ingeniero de Robótica y Chasis) " +
      "del IESTP Hermanos Cárcamo (Paita, Piura). Tu deber es ayudar con consultas del robot, prevención de desastres (sismos, lluvias, incendios) " +
      "y responder a cualquier pregunta del usuario (como programación, comida, etc.), " +
      "manteniendo siempre una personalidad técnica de ciencia, robótica y resiliencia comunitaria. Responde de forma concisa (máximo 2-3 párrafos), usando formato HTML básico para negritas o listas.";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemInstruction}\n\nPregunta del usuario: ${userMessage}`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text;
      }
      return "Recibí una respuesta vacía del modelo de IA.";
    } catch (e) {
      console.warn("Gemini API call failed:", e);
      return `[ERROR DE CONEXIÓN] No se pudo conectar con Gemini. Detalle: ${e.message}. Verifica que tu API Key sea correcta.`;
    }
  }

  async function handleSendChatMessage() {
    if (!chatbotInput) return;
    const text = chatbotInput.value.trim();
    if (!text) return;

    appendChatMessage('user', text);
    chatbotInput.value = '';

    synth.beep(550, 'sine', 0.05);

    // Append a typing placeholder
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg ai typing-indicator-bubble';
    msgDiv.style.padding = '8px 12px';
    msgDiv.style.display = 'inline-flex';
    msgDiv.style.alignItems = 'center';
    msgDiv.style.gap = '4px';
    msgDiv.innerHTML = `
      <span class="typing-dot" style="width:5px; height:5px; background:var(--accent-cyan); border-radius:50%; animation: pulseFlashing 0.6s infinite alternate;"></span>
      <span class="typing-dot" style="width:5px; height:5px; background:var(--accent-cyan); border-radius:50%; animation: pulseFlashing 0.6s infinite alternate; animation-delay: 0.2s;"></span>
      <span class="typing-dot" style="width:5px; height:5px; background:var(--accent-cyan); border-radius:50%; animation: pulseFlashing 0.6s infinite alternate; animation-delay: 0.4s;"></span>
    `;
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    // Check locally first
    const localResponse = getChatbotResponse(text);
    const defaultFallback = "Entendido. He auditado la telemetría en tiempo real y todos los nodos de ARGOS corren estables. Puedes preguntarme sobre sensores específicos (lluvia, sismos, fuego, panel solar), mandos de dirección, el vuelo del dron o los juegos interactivos del aula.";

    const apiKey = chatbotGeminiKeyInput ? chatbotGeminiKeyInput.value.trim() : '';

    if (localResponse !== defaultFallback || !apiKey) {
      // Offline/Keyword match or no key provided
      setTimeout(() => {
        msgDiv.remove();
        appendChatMessage('ai', localResponse);
        const cleanTextForSpeech = localResponse.replace(/<\/?[^>]+(>|$)/g, "");
        synth.speak(cleanTextForSpeech);
      }, 1000);
    } else {
      // Fetch online response from Gemini API!
      const aiResponse = await fetchGeminiAIResponse(text, apiKey);
      msgDiv.remove();
      appendChatMessage('ai', aiResponse);
      const cleanTextForSpeech = aiResponse.replace(/<\/?[^>]+(>|$)/g, "");
      synth.speak(cleanTextForSpeech);
    }
  }

  if (chatbotSendBtn) {
    chatbotSendBtn.addEventListener('click', handleSendChatMessage);
  }

  if (chatbotInput) {
    chatbotInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleSendChatMessage();
      }
    });
  }

  // ==========================================
  // 14. STEAM SUB-TABS INTERACTIVE CONTROLLER
  // ==========================================
  const steamSubBtns = document.querySelectorAll('.steam-sub-btn');
  const steamSubContents = document.querySelectorAll('.steam-sub-content');

  steamSubBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const subtab = btn.getAttribute('data-subtab');
      
      steamSubBtns.forEach(b => b.classList.remove('active'));
      steamSubContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(`steam-sub-${subtab}`);
      if (targetContent) targetContent.classList.add('active');

      synth.beep(500, 'sine', 0.05);
    });
  });

  // ==========================================
  // 15. INTERACTIVE X-RAY BLUEPRINT CONTROLLER
  // ==========================================
  const blueprintNodes = document.querySelectorAll('.comp-node');
  const blueprintInfoBox = document.getElementById('blueprint-info-box');

  const componentSpecs = {
    motor: {
      title: "Sistema de Tracción y Servomotores",
      icon: "fa-gear",
      desc: "El tren motriz de orugas está impulsado por dos servomotores DC reductores acoplados a puentes H (L298N) que controlan la velocidad y sentido de giro de manera independiente para cada pista.",
      specs: [
        "Voltaje de Operación: 7.4V - 12V DC",
        "Corriente de Torque Máximo: 2.1 A",
        "Reducción: 1:48 de engranaje metálico",
        "Control: Modulación por Ancho de Pulsos (PWM) desde el núcleo ESP32"
      ]
    },
    pir: {
      title: "Escáner de Entorno (Sensor PIR e Infrarrojo)",
      icon: "fa-satellite-dish",
      desc: "Módulos de telemetría inercial y presencia. Combinan detectores piroeléctricos (PIR) para captar firmas térmicas en movimiento e infrarrojos de proximidad para evitar colisiones frontales.",
      specs: [
        "Rango del Sensor Infrarrojo: 2cm a 80cm de proximidad",
        "Frecuencia del Ultrasonido: 40 kHz de pulso acústico",
        "Ángulo de Detección Térmica (PIR): 110° de cono de cobertura",
        "Tiempo de Respuesta: 5 microsegundos de eco"
      ]
    },
    esp32: {
      title: "Microcontrolador Core (ESP32 DevKit)",
      icon: "fa-microchip",
      desc: "El cerebro principal del ecosistema. Ejecuta el sistema de comunicación inalámbrica, procesa los bucles de telemetría de sensores, aloja el servidor WebSocket local y decodifica las señales de control.",
      specs: [
        "Procesador: Xtensa dual-core de 32 bits a 240 MHz",
        "Memoria: 520 KB de SRAM interna",
        "Conectividad: Wi-Fi 82.11 b/g/n (Access Point y Estación) + Bluetooth 4.2",
        "Bucle de Tareas: FreeRTOS para procesamiento multitarea"
      ]
    },
    mpu: {
      title: "Giroscopio y Acelerómetro Triaxial (MPU-6050)",
      icon: "fa-cube",
      desc: "Sensor de Unidad de Medida Inercial (IMU) de 6 ejes. Monitorea continuamente los vectores de cabeceo (Pitch) y alabeo (Roll) del chasis robótico para evitar volcaduras en terrenos inclinados y detectar micro-variaciones del suelo (sismos).",
      specs: [
        "Sensor: Acelerómetro de 3 ejes + Giroscopio de 3 ejes en un solo silicio",
        "Conversión: Convertidores A/D de 16 bits para cada canal",
        "Rango Giroscopio: Ajustable hasta ±2000°/s",
        "Protocolo de Comunicación: Bus I2C de alta velocidad (Fast-mode a 400kHz)"
      ]
    }
  };

  function updateBlueprintDetails(compName) {
    const data = componentSpecs[compName];
    if (!data || !blueprintInfoBox) return;

    synth.beep(600, 'sine', 0.04);

    let specsHtml = "";
    data.specs.forEach(spec => {
      specsHtml += `<li style="margin-bottom: 6px;"><i class="fa-solid fa-caret-right" style="color:var(--accent-cyan); margin-right:8px;"></i> ${spec}</li>`;
    });

    blueprintInfoBox.innerHTML = `
      <div style="animation: tabFadeIn 0.3s ease;">
        <h4 style="font-family: var(--font-display); color: #fff; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; font-size:13px;">
          <i class="fa-solid ${data.icon}" style="color: var(--accent-cyan);"></i> ${data.title}
        </h4>
        <p style="font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 15px;">
          ${data.desc}
        </p>
        <h5 style="font-family: var(--font-display); color: var(--accent-cyan); margin-bottom: 8px; font-size:10px; text-transform:uppercase; letter-spacing:0.5px;">Ficha Técnica / Telemetría</h5>
        <ul style="list-style: none; padding: 0; font-size: 11px; color: var(--text-muted);">
          ${specsHtml}
        </ul>
      </div>
    `;
  }

  blueprintNodes.forEach(node => {
    node.addEventListener('mouseenter', () => {
      const comp = node.getAttribute('data-comp');
      updateBlueprintDetails(comp);
    });
    node.addEventListener('click', () => {
      const comp = node.getAttribute('data-comp');
      updateBlueprintDetails(comp);
    });
  });

  // ==========================================
  // 16. STEAM GAMES & ARCADE ENGINE
  // ==========================================
  const arcadeWorkspace = document.getElementById('arcade-workspace');
  const playTriviaBtn = document.getElementById('play-trivia-btn');
  const playSopaBtn = document.getElementById('play-sopa-btn');

  // TRIVIA JAVASCRIPT GAME STATE
  const triviaQuestions = [
    {
      q: "¿Qué microcontrolador actúa como el 'cerebro' principal del chasis de ARGOS?",
      options: ["Arduino Uno", "Raspberry Pi 4", "ESP32 Devkit", "Micro:bit"],
      correct: 2
    },
    {
      q: "Durante un corte de luz masivo en el vecindario, el robot activa su 'Modo Apagón'. ¿Qué acción realiza?",
      options: ["Se apaga para conservar energía", "Enciende su faro LED central de alta potencia para iluminar como baliza cívica por 48h", "Emite una alarma sonora constante", "Se desconecta de la red local"],
      correct: 1
    },
    {
      q: "¿Cuál es la función principal del sensor giroscópico MPU-6050 en el chasis?",
      options: ["Detectar sismos e inclinaciones estructurales en tiempo real", "Medir la temperatura ambiental del aire", "Procesar el video de exploración", "Medir la distancia de objetos frontales"],
      correct: 0
    },
    {
      q: "¿Cómo garantiza ARGOS la inclusión de personas con discapacidad auditiva en emergencias?",
      options: ["Aumentando al máximo el volumen del timbre", "Mediante alertas de luces estroboscópicas de alta frecuencia y avisos en pantalla", "Realizando llamadas automáticas al móvil", "Desplegando un dron de altavoz"],
      correct: 1
    },
    {
      q: "Si la batería del robot desciende críticamente en patrullaje diurno, ¿cuál es su método de continuidad?",
      options: ["Apagarse en la calle", "Regresar a la toma eléctrica", "Carga fotovoltaica mediante panel monocristalino superior y regulador MPPT", "Cambio manual de celdas por los vecinos"],
      correct: 2
    },
    {
      q: "¿Quiénes son los fundadores y diseñadores del proyecto robótico ARGOS?",
      options: ["El director del instituto Hermanos Cárcamo", "Misael Pintado y Dayron Urbina (carrera APSTI)", "Los profesores de la especialidad de Computación", "Un equipo internacional de ingenieros de IoT"],
      correct: 1
    },
    {
      q: "¿Qué protocolo de red utiliza ARGOS para recibir mandos físicos de pilotaje e intercambiar telemetría con baja latencia (<50ms)?",
      options: ["HTTP/POST tradicional", "WebSockets bidireccionales", "Transferencia FTP por lotes", "Mensajería SMS"],
      correct: 1
    },
    {
      q: "¿Cuál es la función del driver Puente H L298N en la locomoción terrestre por orugas?",
      options: ["Medir la inclinación angular del chasis", "Alimentar el módulo GPS con energía solar", "Canalizar la corriente de la batería de 12V a los motores según las señales de control de 3.3V del ESP32", "Regular la velocidad del ventilador de la CPU"],
      correct: 2
    }
  ];

  let currentTriviaIndex = 0;
  let triviaScore = 0;
  let triviaStreak = 0;
  let triviaTimer = null;
  let triviaTimeLeft = 15;

  window.startTriviaGame = function() {
    currentTriviaIndex = 0;
    triviaScore = 0;
    triviaStreak = 0;
    renderTriviaQuestion();
  };

  function renderTriviaQuestion() {
    if (!arcadeWorkspace) return;
    const qData = triviaQuestions[currentTriviaIndex];
    
    // Speak the question dynamically for immersion
    synth.speak(qData.q);

    let optionsHtml = "";
    qData.options.forEach((opt, idx) => {
      optionsHtml += `
        <button class="btn btn-secondary btn-micro btn-block" style="text-align: left; padding: 12px 15px; margin-bottom: 10px; font-weight: normal; text-transform: none; font-size: 11px;" onclick="checkTriviaAnswer(${idx}, this)">
          <strong style="color:var(--accent-cyan); margin-right: 10px;">${String.fromCharCode(65 + idx)}</strong> ${opt}
        </button>
      `;
    });

    const comboHtml = triviaStreak > 1 ? `<span class="trivia-combo-badge">🔥 Combo x${triviaStreak}</span>` : '';

    arcadeWorkspace.innerHTML = `
      <div style="animation: tabFadeIn 0.3s ease; max-width: 500px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-family: var(--font-display); font-size: 10px; color: var(--text-muted); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px; margin-bottom: 15px;">
          <span>Pregunta ${currentTriviaIndex + 1} de ${triviaQuestions.length}</span>
          <div style="display:flex; gap: 8px; align-items:center;">
            ${comboHtml}
            <span>Puntaje: <strong style="color: var(--accent-cyan);" id="trivia-live-score">${triviaScore}</strong></span>
          </div>
        </div>
        
        <div class="trivia-timer-container">
          <div class="trivia-timer-fill" id="trivia-timer-fill" style="width: 100%;"></div>
        </div>

        <h4 style="font-family: var(--font-main); color: #fff; line-height: 1.5; margin-bottom: 20px; font-size: 13px;">
          ${qData.q}
        </h4>
        <div id="trivia-options-box">
          ${optionsHtml}
        </div>
        <div id="trivia-feedback" style="margin-top: 10px; font-size: 11px; font-weight: bold; min-height: 15px; font-family: var(--font-display);"></div>
        <button class="btn btn-outline btn-micro" onclick="exitTrivia()" style="margin-top: 15px;"><i class="fa-solid fa-arrow-left"></i> Volver al Arcade</button>
      </div>
    `;

    // Start timer interval (15 seconds per question)
    if (triviaTimer) clearInterval(triviaTimer);
    triviaTimeLeft = 15;
    const timerFill = document.getElementById('trivia-timer-fill');
    
    triviaTimer = setInterval(() => {
      triviaTimeLeft--;
      if (timerFill) {
        timerFill.style.width = `${(triviaTimeLeft / 15) * 100}%`;
        if (triviaTimeLeft <= 5) {
          timerFill.style.background = 'var(--accent-red)';
          synth.beep(1000, 'sine', 0.02);
        }
      }

      if (triviaTimeLeft <= 0) {
        clearInterval(triviaTimer);
        handleTriviaTimeout();
      }
    }, 1000);
  }

  window.exitTrivia = function() {
    if (triviaTimer) clearInterval(triviaTimer);
    resetArcadeHome();
  };

  function handleTriviaTimeout() {
    synth.beep(200, 'sawtooth', 0.35);
    triviaStreak = 0;
    
    const feedbackEl = document.getElementById('trivia-feedback');
    if (feedbackEl) {
      feedbackEl.style.color = 'var(--accent-red)';
      feedbackEl.textContent = '¡Tiempo agotado!';
    }

    const allButtons = document.getElementById('trivia-options-box').querySelectorAll('button');
    allButtons.forEach(btn => btn.disabled = true);

    const qData = triviaQuestions[currentTriviaIndex];
    const correctBtn = allButtons[qData.correct];
    correctBtn.style.borderColor = 'var(--accent-green)';
    correctBtn.style.color = 'var(--accent-green)';

    setTimeout(() => {
      currentTriviaIndex++;
      if (currentTriviaIndex < triviaQuestions.length) {
        renderTriviaQuestion();
      } else {
        renderTriviaResults();
      }
    }, 2000);
  }

  window.checkTriviaAnswer = function(selectedIdx, btnElement) {
    if (triviaTimer) clearInterval(triviaTimer);
    const qData = triviaQuestions[currentTriviaIndex];
    const isCorrect = selectedIdx === qData.correct;
    const allButtons = document.getElementById('trivia-options-box').querySelectorAll('button');
    const feedbackEl = document.getElementById('trivia-feedback');
    
    allButtons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
      triviaStreak++;
      // Score calculation: 100 base + speed bonus + streak combo bonus
      const speedBonus = triviaTimeLeft * 5;
      const streakBonus = (triviaStreak > 1) ? (triviaStreak - 1) * 30 : 0;
      const pointsEarned = 100 + speedBonus + streakBonus;
      triviaScore += pointsEarned;
      
      btnElement.style.background = 'rgba(0, 230, 118, 0.12)';
      btnElement.style.borderColor = 'var(--accent-green)';
      btnElement.style.color = '#fff';
      btnElement.innerHTML += ' <i class="fa-solid fa-circle-check" style="color: var(--accent-green); float: right; margin-top: 2px;"></i>';
      
      if (feedbackEl) {
        feedbackEl.style.color = 'var(--accent-green)';
        feedbackEl.innerHTML = `¡Correcto! +${pointsEarned} Puntos <span style="font-size:9px;color:var(--text-muted);">(${speedBonus}s de velocidad + ${streakBonus} combo)</span>`;
      }
      
      synth.beep(880, 'sine', 0.08);
    } else {
      triviaStreak = 0;
      btnElement.style.background = 'rgba(255, 59, 48, 0.1)';
      btnElement.style.borderColor = 'var(--accent-red)';
      btnElement.style.color = '#fff';
      btnElement.innerHTML += ' <i class="fa-solid fa-circle-xmark" style="color: var(--accent-red); float: right; margin-top: 2px;"></i>';
      
      const correctBtn = allButtons[qData.correct];
      correctBtn.style.borderColor = 'var(--accent-green)';
      correctBtn.style.color = 'var(--accent-green)';
      
      if (feedbackEl) {
        feedbackEl.style.color = 'var(--accent-red)';
        feedbackEl.textContent = 'Incorrecto.';
      }
      synth.beep(220, 'sawtooth', 0.2);
    }

    setTimeout(() => {
      currentTriviaIndex++;
      if (currentTriviaIndex < triviaQuestions.length) {
        renderTriviaQuestion();
      } else {
        renderTriviaResults();
      }
    }, 2000);
  };

  function renderTriviaResults() {
    if (!arcadeWorkspace) return;
    const maxScore = triviaQuestions.length * 100;
    const pct = (triviaScore / 1000) * 100; // max score with bonuses is around 1000-1300
    
    let title = "";
    let color = "";
    let desc = "";

    if (triviaScore >= 800) {
      title = "¡Operador de Nivel Experto!";
      color = "var(--accent-green)";
      desc = `Excelente. Lograste un puntaje extraordinario de ${triviaScore} puntos. ¡Estás listo para operar el ecosistema ARGOS en situaciones reales de desastre!<br><br><span style="color: #ffd700; font-weight: bold; font-size: 11px; text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);"><i class="fa-solid fa-trophy"></i> ¡NUEVO ROL DESBLOQUEADO: CONTROLADOR EXPERTO! Ahora puedes registrarte o iniciar sesión con el Rol de Controlador Experto para acceso total.</span>`;
      localStorage.setItem('argos_expert_unlocked', 'true');
      if (typeof window.checkAndInjectExpertRole === 'function') {
        window.checkAndInjectExpertRole();
      }
      synth.victory();
    } else if (triviaScore >= 500) {
      title = "Buen Trabajo";
      color = "var(--accent-cyan)";
      desc = `Obtuviste ${triviaScore} puntos. Tienes conocimientos sólidos sobre el hardware y funciones cívicas.`;
      synth.beep(600, 'sine', 0.2);
    } else {
      title = "Necesitas Entrenamiento";
      color = "var(--accent-red)";
      desc = `Puntaje: ${triviaScore}. Te sugerimos explorar la arquitectura del robot o repasar las guías STEAM en el aula.`;
      synth.beep(150, 'sawtooth', 0.35);
    }

    arcadeWorkspace.innerHTML = `
      <div style="animation: tabFadeIn 0.3s ease; text-align: center; padding: 20px 0; max-width: 400px; margin: 0 auto;">
        <i class="fa-solid fa-trophy" style="font-size: 3.5rem; color: ${color}; margin-bottom: 15px; text-shadow: 0 0 15px ${color};"></i>
        <h3 style="font-family: var(--font-display); color: #fff; margin-bottom: 5px; font-size:16px;">${title}</h3>
        <h4 style="color: ${color}; font-family: var(--font-display); margin-bottom: 15px; font-size:14px;">Puntaje: ${triviaScore}</h4>
        <p style="font-size: 11px; color: var(--text-muted); line-height: 1.5; margin-bottom: 25px;">${desc}</p>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button class="btn btn-primary btn-micro" onclick="startTriviaGame()"><i class="fa-solid fa-rotate-right"></i> Jugar de Nuevo</button>
          <button class="btn btn-outline btn-micro" onclick="resetArcadeHome()"><i class="fa-solid fa-house"></i> Menú de Juegos</button>
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // INTERACTIVE MISSION SIMULATOR GAME STATE (MAP GAME)
  // ==========================================================================
  const mapMissions = [
    {
      id: "m-incendio",
      name: "Sector Residencial (Alerta de Incendio)",
      icon: "fa-solid fa-fire",
      x: 75,
      y: 20,
      question: "El sensor de temperatura infrarrojo de ARGOS registra 120°C en la pared de una vivienda y detecta radiación de flama. ¿Cuál es el protocolo de seguridad cívica correcto?",
      options: [
        { text: "Activar la sirena acústica local, transmitir coordenadas GPS en vivo a los Bomberos y alertar por voz a los vecinos para evacuar.", correct: true },
        { text: "Continuar patrullando de forma silenciosa para no causar pánico y esperar a que el sensor de humedad suba.", correct: false },
        { text: "Apagar el faro lumínico para conservar batería y apagar los motores del robot.", correct: false }
      ],
      points: 150,
      completed: false
    },
    {
      id: "m-sismo",
      name: "Puente Río Teos (Estabilidad Estructural)",
      icon: "fa-solid fa-triangle-exclamation",
      x: 20,
      y: 70,
      question: "Durante un sismo leve, el osciloscopio del acelerómetro MPU-6050 de ARGOS detecta vibraciones inerciales anormales en las vigas del puente. ¿Qué acción debe tomar el robot?",
      options: [
        { text: "Ignorar las vibraciones si no superan los 8.0 grados Richter y regresar a la base.", correct: false },
        { text: "Emitir señales estroboscópicas de advertencia visual para restringir el paso de vehículos, registrar fotografías de las grietas con la cámara de exploración y enviar la telemetría al panel del Serenazgo.", correct: true },
        { text: "Apagar la conexión de radio y entrar en modo de reposo automático.", correct: false }
      ],
      points: 150,
      completed: false
    },
    {
      id: "m-inundacion",
      name: "Cuenca del Río (Riesgo de Desborde)",
      icon: "fa-solid fa-cloud-showers-water",
      x: 55,
      y: 45,
      question: "El sensor barométrico indica una caída drástica de presión atmosférica (tormenta inminente) y el sensor de lluvia se activa en modo continuo. ¿Cuál es la prioridad del robot?",
      options: [
        { text: "Detenerse a recargar la batería solar bajo la tormenta.", correct: false },
        { text: "Desplegar el Dron Explorador para monitorear el cauce del río desde el aire y enviar alertas sonoras con traducción de texto a las zonas bajas del río.", correct: true },
        { text: "Entrar en modo apagón lumínico y desconectar los sensores de lluvia.", correct: false }
      ],
      points: 150,
      completed: false
    },
    {
      id: "m-dron",
      name: "Zonas Anegadas (Exploración Aérea)",
      icon: "fa-solid fa-helicopter",
      x: 40,
      y: 15,
      question: "El dron de exploración aérea de ARGOS detecta una grieta profunda de tipo 'GRAVE' en la rampa de evacuación. ¿Cuál es la acción inmediata del operador?",
      options: [
        { text: "Reportar la severidad de la grieta en la base de datos de IA, georreferenciar la anomalía con el módulo GPS y sugerir el cierre temporal preventivo del tramo.", correct: true },
        { text: "Ignorar la grieta aérea ya que el robot terrestre no transita por el aire.", correct: false },
        { text: "Apagar el streaming de video del dron para que el operador no registre alarmas adicionales.", correct: false }
      ],
      points: 150,
      completed: false
    }
  ];

  let selectedMission = null;
  let activeRobotX = 10;
  let activeRobotY = 50;
  let misionesScore = 0;
  
  // Transit Routing panel state
  let isRouting = false;
  let routingProgress = 0;
  let routingTimer = null;
  let targetMission = null;

  window.startMisionesGame = function() {
    selectedMission = null;
    activeRobotX = 10;
    activeRobotY = 50;
    misionesScore = 0;
    isRouting = false;
    mapMissions.forEach(m => m.completed = false);
    renderMisionesMap();
  };

  function renderMisionesMap() {
    let nodesHtml = "";
    mapMissions.forEach(mission => {
      const activeClass = (targetMission && targetMission.id === mission.id) ? "active-target" : "";
      const completedClass = mission.completed ? "completed" : "";
      nodesHtml += `
        <div class="map-node ${activeClass} ${completedClass}" 
             style="left: ${mission.x}%; top: ${mission.y}%;" 
             onclick="selectMissionNode('${mission.id}')"
             title="${mission.name}">
          <i class="${mission.icon}"></i>
        </div>
      `;
    });

    const allCompleted = mapMissions.every(m => m.completed);
    let detailsHtml = "";

    if (allCompleted) {
      localStorage.setItem('argos_expert_unlocked', 'true');
      if (typeof window.checkAndInjectExpertRole === 'function') {
        window.checkAndInjectExpertRole();
      }
      detailsHtml = `
        <div class="mission-details-card" style="text-align: center; border-color: var(--accent-green);">
          <h4 style="color: var(--accent-green); justify-content: center;">
            <i class="fa-solid fa-trophy"></i> ¡TODAS LAS MISIONES COMPLETADAS!
          </h4>
          <p style="font-size: 12px; line-height: 1.6; color: var(--text-secondary); margin-bottom: 15px;">
            Felicidades Comandante. Has resuelto todas las crisis en el mapa, protegiendo a la comunidad y coordinando las defensas civiles de manera exitosa.<br>
            <strong>Puntaje Total: ${misionesScore} Puntos STEAM (+300 Bonus de Excelencia)</strong><br><br>
            <span style="color: #ffd700; font-weight: bold; font-size: 11px; text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);"><i class="fa-solid fa-trophy"></i> ¡NUEVO ROL DESBLOQUEADO: CONTROLADOR EXPERTO! Ahora puedes registrarte o iniciar sesión con el Rol de Controlador Experto para acceso total.</span>
          </p>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button class="btn btn-primary btn-micro" onclick="startMisionesGame()"><i class="fa-solid fa-rotate-right"></i> Jugar de Nuevo</button>
            <button class="btn btn-outline btn-micro" onclick="resetArcadeHome()"><i class="fa-solid fa-arrow-left"></i> Volver</button>
          </div>
        </div>
      `;
      synth.victory();
    } else if (isRouting) {
      detailsHtml = `
        <div class="routing-panel">
          <div class="routing-title"><i class="fa-solid fa-spinner fa-spin"></i> ENRUTANDO ROBOT ARGOS...</div>
          <div class="routing-meta">Trayectoria trazada: Hangar ➡️ ${targetMission ? targetMission.name : 'Destino'}<br>Velocidad de avance: 1.5 m/s | Dirección: [X: ${activeRobotX}%, Y: ${activeRobotY}%]</div>
          <div class="routing-progress-bar">
            <div class="routing-progress-fill" id="routing-progress-fill" style="width: 0%"></div>
          </div>
        </div>
      `;
    } else if (selectedMission) {
      let optionsHtml = "";
      selectedMission.options.forEach((opt, idx) => {
        optionsHtml += `
          <button class="mission-option-btn" onclick="checkMissionAnswer(${idx}, this)">
            ${opt.text}
          </button>
        `;
      });

      let diagnosticsHtml = "";
      if (selectedMission.id === 'm-incendio') {
        diagnosticsHtml = `
          <div class="terminal-diagnostics">
            <div class="terminal-diagnostics-header"><i class="fa-solid fa-terminal"></i> TELEMETRÍA DE INCENDIO (INFRARROJO)</div>
            - TEMPERATURA DETECTADA: 120.4 °C (CRÍTICO)<br>
            - DETECTOR RADIACIÓN DE FLAMA: ACTIVO (FUEGO DETECTADO)<br>
            - PROPAGACIÓN DE INCENDIO: 100% RIESGO EVACUAR
          </div>
        `;
      } else if (selectedMission.id === 'm-sismo') {
        diagnosticsHtml = `
          <div class="terminal-diagnostics">
            <div class="terminal-diagnostics-header"><i class="fa-solid fa-terminal"></i> TELEMETRÍA ACELERÓMETRO SÍSMICO (MPU-6050)</div>
            - ACELERACIÓN DETECTADA: 8.45 m/s² (RANGO SÍSMICO)<br>
            - INCLINACIÓN DE ESTRUCTURA: 12.5° (DAÑO GRAVE)<br>
            - TRÁNSITO VEHICULAR: RIESGO DE COLAPSO ESTRUCTURAL
          </div>
        `;
      } else if (selectedMission.id === 'm-inundacion') {
        diagnosticsHtml = `
          <div class="terminal-diagnostics">
            <div class="terminal-diagnostics-header"><i class="fa-solid fa-terminal"></i> TELEMETRÍA PRECIPITACIÓN Y BARÓMETRO</div>
            - PRESIÓN ATMOSFÉRICA: 980 hPa (TORMENTA EXTREMA)<br>
            - DETECTOR DE LLUVIA: ACTIVADO (MOJADO CONTINUO)<br>
            - RÍO TEOS: ALERTA DE RIESGO DE DESBORDE DE CUENCA
          </div>
        `;
      } else if (selectedMission.id === 'm-dron') {
        diagnosticsHtml = `
          <div class="terminal-diagnostics">
            <div class="terminal-diagnostics-header"><i class="fa-solid fa-terminal"></i> TELEMETRÍA AÉREA (VISIÓN IA DE DRON)</div>
            - SISTEMA EN VUELO: COORDENADAS GPS ESTABLES<br>
            - ANÁLISIS DE IMAGEN: DETECTANDO FISURA EN CONCRETO<br>
            - GRAVEDAD RECONOCIDA POR IA: GRAVE (RIESGO CIVIL DE EVACUACIÓN)
          </div>
        `;
      }

      detailsHtml = `
        <div class="mission-details-card" id="mission-card-pane">
          <h4><i class="${selectedMission.icon}"></i> Misión Táctica: ${selectedMission.name}</h4>
          ${diagnosticsHtml}
          <p class="question"><strong>Desafío de Decisión:</strong> ${selectedMission.question}</p>
          <div id="mission-options-box">
            ${optionsHtml}
          </div>
          <div id="mission-feedback" style="margin-top: 12px; font-size: 11px; font-weight: bold; min-height: 15px;"></div>
        </div>
      `;
    } else {
      detailsHtml = `
        <div class="mission-details-card" style="text-align: center; border-color: rgba(255,255,255,0.06);">
          <h4><i class="fa-solid fa-circle-info"></i> Consola Táctica de Misiones</h4>
          <p style="font-size: 11px; color: var(--text-muted); line-height: 1.6; margin: 0 auto; max-width: 420px;">
            Haz clic en cualquiera de los nodos parpadeantes del mapa para enviar al robot ARGOS. Una vez llegue al sector, evalúa la telemetría y resuelve el desafío cívico.
          </p>
          <div style="margin-top: 15px; display: flex; justify-content: center;">
            <button class="btn btn-outline btn-micro" onclick="resetArcadeHome()"><i class="fa-solid fa-arrow-left"></i> Volver</button>
          </div>
        </div>
      `;
    }

    if (arcadeWorkspace) {
      arcadeWorkspace.innerHTML = `
        <div style="animation: tabFadeIn 0.3s ease;">
          <p style="font-size: 11px; color: var(--text-secondary); text-align: center; margin-bottom: 10px;">
            Controla las misiones simuladas de ARGOS sobre el mapa de la comunidad.
          </p>
          
          <div class="mission-map-container">
            <div class="map-grid-overlay"></div>
            
            <!-- Trajectory Path drawing overlay -->
            <svg class="svg-path-overlay">
              <line x1="10%" y1="50%" x2="${activeRobotX}%" y2="${activeRobotY}%" class="svg-path-line" />
            </svg>
            
            <div class="map-base-hangar">
              <i class="fa-solid fa-warehouse"></i>
              <span>HANGAR</span>
            </div>
            
            ${nodesHtml}
            
            <!-- Robot Animated Icon -->
            <div class="map-robot-icon" id="map-robot-element" style="left: ${activeRobotX}%; top: ${activeRobotY}%;">
              <i class="fa-solid fa-robot"></i>
            </div>
          </div>

          ${detailsHtml}
        </div>
      `;
    }
  }

  window.selectMissionNode = function(missionId) {
    if (isRouting) return; // Prevent clicking nodes while robot is moving
    const mission = mapMissions.find(m => m.id === missionId);
    if (!mission || mission.completed) return;

    // Start Transit routing
    isRouting = true;
    selectedMission = null;
    targetMission = mission;
    activeRobotX = mission.x;
    activeRobotY = mission.y;
    routingProgress = 0;

    renderMisionesMap();
    synth.beep(800, 'sine', 0.08);

    if (routingTimer) clearInterval(routingTimer);
    routingTimer = setInterval(() => {
      routingProgress += 10;
      const progressFill = document.getElementById('routing-progress-fill');
      if (progressFill) {
        progressFill.style.width = `${routingProgress}%`;
      }
      
      // Robot drive motor hum beeps
      synth.beep(300 + routingProgress * 4, 'sine', 0.02);

      if (routingProgress >= 100) {
        clearInterval(routingTimer);
        isRouting = false;
        selectedMission = targetMission;
        targetMission = null;
        
        // Rapid victory arrival chime
        synth.beep(880, 'sine', 0.08);
        setTimeout(() => synth.beep(1100, 'sine', 0.12), 70);
        synth.speak("Sector alcanzado. Iniciando telemetría.");
        
        renderMisionesMap();
      }
    }, 150);
  };

  window.checkMissionAnswer = function(optIdx, btnEl) {
    if (!selectedMission) return;
    const option = selectedMission.options[optIdx];
    const feedbackBox = document.getElementById('mission-feedback');
    const optionsBox = document.getElementById('mission-options-box');

    if (optionsBox) {
      const allButtons = optionsBox.querySelectorAll('button');
      allButtons.forEach(btn => btn.disabled = true);
    }

    if (option.correct) {
      btnEl.classList.add('correct-ans');
      btnEl.innerHTML += ' <i class="fa-solid fa-circle-check" style="color: var(--accent-green); float: right; margin-top: 2px;"></i>';
      if (feedbackBox) {
        feedbackBox.style.color = "var(--accent-green)";
        feedbackBox.textContent = `¡Respuesta Correcta! Protocolo de resiliencia ejecutado con éxito. +${selectedMission.points} Puntos STEAM`;
      }
      misionesScore += selectedMission.points;
      selectedMission.completed = true;
      synth.beep(900, 'sine', 0.1);

      setTimeout(() => {
        selectedMission = null;
        renderMisionesMap();
      }, 2000);
    } else {
      btnEl.classList.add('wrong-ans');
      btnEl.innerHTML += ' <i class="fa-solid fa-circle-xmark" style="color: var(--accent-red); float: right; margin-top: 2px;"></i>';
      if (feedbackBox) {
        feedbackBox.style.color = "var(--accent-red)";
        feedbackBox.textContent = "Error de protocolo. Ese paso no garantiza la evacuación o seguridad. ¡Intenta de nuevo!";
      }
      synth.beep(200, 'sawtooth', 0.25);

      setTimeout(() => {
        if (optionsBox) {
          const allButtons = optionsBox.querySelectorAll('button');
          allButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('wrong-ans');
            const icon = btn.querySelector('.fa-circle-xmark');
            if (icon) icon.remove();
          });
        }
        if (feedbackBox) feedbackBox.textContent = "";
      }, 2000);
    }
  };

  // ==========================================================================
  // INTERACTIVE DRONE FLIGHT SIMULATOR GAME STATE
  // ==========================================================================
  let droneHeight = 50; // percentage
  let droneTargetHeightMin = 40;
  let droneTargetHeightMax = 70;
  let droneInstabilityBar = 0;
  let droneTimerLeft = 20;
  let droneGameInterval = null;
  let droneTimeInterval = null;
  let droneWindForce = 0;
  let windWarningActive = false;

  window.startVueloGame = function() {
    if (droneGameInterval) clearInterval(droneGameInterval);
    if (droneTimeInterval) clearInterval(droneTimeInterval);
    
    droneHeight = 55;
    droneTargetHeightMin = 35;
    droneTargetHeightMax = 65;
    droneInstabilityBar = 0;
    droneTimerLeft = 20;
    droneWindForce = 0;
    windWarningActive = false;

    renderDroneGameLayout();
    
    // Game Physics loop (50ms)
    droneGameInterval = setInterval(() => {
      // Gravity pulls it down
      droneHeight -= 0.75;
      
      // Wind force drift
      droneHeight += droneWindForce;

      // Keep inside bounds [0, 100]
      if (droneHeight < 0) droneHeight = 0;
      if (droneHeight > 100) droneHeight = 100;

      // Check if drone is in safety zone
      const inZone = (droneHeight >= droneTargetHeightMin && droneHeight <= droneTargetHeightMax);
      if (inZone) {
        droneInstabilityBar = Math.max(0, droneInstabilityBar - 1.5);
      } else {
        droneInstabilityBar = Math.min(100, droneInstabilityBar + 2.5);
      }

      // Update positions & UI bar values
      const droneIcon = document.getElementById('drone-game-icon');
      const instabilityIndicator = document.getElementById('drone-instability-fill');
      const altitudeIndicator = document.getElementById('drone-alt-val');
      const instValIndicator = document.getElementById('drone-inst-val');

      if (droneIcon) {
        // Map 0-100% height to bottom value
        droneIcon.style.bottom = `${droneHeight}%`;
      }
      if (instabilityIndicator) {
        instabilityIndicator.style.width = `${droneInstabilityBar}%`;
        if (droneInstabilityBar > 60) {
          instabilityIndicator.style.backgroundColor = 'var(--accent-red)';
        } else {
          instabilityIndicator.style.backgroundColor = 'var(--accent-purple)';
        }
      }
      if (altitudeIndicator) {
        altitudeIndicator.textContent = `${Math.round(droneHeight)}m`;
      }
      if (instValIndicator) {
        instValIndicator.textContent = `${Math.round(droneInstabilityBar)}%`;
      }

      // If Instability hits 100%, CRASH!
      if (droneInstabilityBar >= 100) {
        endDroneGame(false);
      }
    }, 50);

    // Game Timer and Wind Gust generator loop (1000ms)
    droneTimeInterval = setInterval(() => {
      droneTimerLeft--;
      const timeVal = document.getElementById('drone-time-val');
      if (timeVal) {
        timeVal.textContent = `${droneTimerLeft}s`;
      }

      // If time runs out, VICTORY!
      if (droneTimerLeft <= 0) {
        endDroneGame(true);
      }

      // Wind gust logic: 40% chance of a wind gust
      const rand = Math.random();
      const windIndicator = document.getElementById('drone-wind-warning');
      
      if (rand < 0.4 && droneWindForce === 0) {
        // Start wind gust
        const direction = Math.random() > 0.5 ? 1 : -1;
        droneWindForce = direction * 2.2;
        windWarningActive = true;
        if (windIndicator) {
          windIndicator.style.display = 'block';
          windIndicator.innerHTML = `<i class="fa-solid fa-wind"></i> RÁFAGA DE VIENTO: ${direction > 0 ? 'ASCENDENTE' : 'DESCENDENTE'} (${Math.abs(droneWindForce * 10)} km/h)`;
        }
        synth.beep(400, 'sawtooth', 0.15);
      } else {
        // Calm wind
        droneWindForce = 0;
        windWarningActive = false;
        if (windIndicator) {
          windIndicator.style.display = 'none';
        }
      }

      // Slowly shift target safety zone heights randomly to increase challenge
      if (droneTimerLeft % 5 === 0) {
        const offset = Math.floor(Math.random() * 20) - 10; // -10 to +10
        let newMin = 35 + offset;
        let newMax = 65 + offset;
        if (newMin < 10) { newMin = 10; newMax = 40; }
        if (newMax > 90) { newMax = 90; newMin = 60; }
        droneTargetHeightMin = newMin;
        droneTargetHeightMax = newMax;
        
        const safetyZone = document.getElementById('drone-safety-area');
        if (safetyZone) {
          safetyZone.style.bottom = `${droneTargetHeightMin}%`;
          safetyZone.style.height = `${droneTargetHeightMax - droneTargetHeightMin}%`;
        }
      }
    }, 1000);
  };

  window.boostDrone = function() {
    droneHeight = Math.min(100, droneHeight + 11);
    synth.beep(600, 'sine', 0.04);
  };

  function renderDroneGameLayout() {
    if (!arcadeWorkspace) return;
    arcadeWorkspace.innerHTML = `
      <div style="animation: tabFadeIn 0.3s ease;">
        <p style="font-size: 11px; color: var(--text-secondary); text-align: center; margin-bottom: 10px;">
          Mantén el dron de exploración en la zona verde usando la barra espaciadora o el botón de impulso.
        </p>

        <div class="drone-game-container" id="drone-game-container-div">
          <div class="map-grid-overlay"></div>
          
          <!-- Flashing Wind Gust Indicator -->
          <div class="drone-wind-gust-indicator" id="drone-wind-warning"></div>
          
          <!-- Green safety zone -->
          <div class="drone-safety-zone" id="drone-safety-area" style="bottom: ${droneTargetHeightMin}%; height: ${droneTargetHeightMax - droneTargetHeightMin}%;">
            ZONA DE ALTURA SEGURA
          </div>
          
          <!-- Animated Drone Element -->
          <div class="drone-icon-fly" id="drone-game-icon" style="bottom: ${droneHeight}%; left: 50%;">
            <i class="fa-solid fa-helicopter"></i>
          </div>

          <!-- Realtime status values -->
          <div class="drone-status-indicator">
            TIEMPO: <strong style="color:var(--accent-cyan);" id="drone-time-val">${droneTimerLeft}s</strong><br>
            ALTURA: <strong style="color:#a855f7;" id="drone-alt-val">${Math.round(droneHeight)}m</strong><br>
            INESTABILIDAD: <strong style="color:var(--accent-red);" id="drone-inst-val">${Math.round(droneInstabilityBar)}%</strong>
          </div>
        </div>

        <!-- Custom health indicator bar -->
        <div style="width: 100%; max-width: 580px; height: 10px; background: rgba(255,255,255,0.05); border-radius: 4px; margin: 10px auto; overflow: hidden; border: 1px solid rgba(255,255,255,0.08);">
          <div id="drone-instability-fill" style="width: 0%; height: 100%; background: var(--accent-purple); transition: width 0.1s linear, background-color 0.2s;"></div>
        </div>

        <div style="text-align: center; margin-top: 15px; display: flex; gap: 10px; justify-content: center;">
          <button class="btn btn-primary btn-block" style="background: var(--accent-purple); border-color: #a855f7;" onclick="boostDrone()" id="drone-boost-btn">
            <i class="fa-solid fa-angles-up"></i> IMPULSO MOTOR (+)
          </button>
          <button class="btn btn-outline" onclick="exitDroneGame()"><i class="fa-solid fa-arrow-left"></i> Salir</button>
        </div>
      </div>
    `;

    // Spacebar listener setup
    const boostBtn = document.getElementById('drone-boost-btn');
    if (boostBtn) {
      boostBtn.focus();
    }
  }

  window.exitDroneGame = function() {
    if (droneGameInterval) clearInterval(droneGameInterval);
    if (droneTimeInterval) clearInterval(droneTimeInterval);
    resetArcadeHome();
  };

  function endDroneGame(victory) {
    if (droneGameInterval) clearInterval(droneGameInterval);
    if (droneTimeInterval) clearInterval(droneTimeInterval);

    let html = "";
    if (victory) {
      misionesScore += 300;
      synth.victory();
      html = `
        <div class="mission-details-card" style="text-align: center; border-color: var(--accent-green); max-width: 400px; margin: 20px auto;">
          <h4 style="color: var(--accent-green); justify-content: center;">
            <i class="fa-solid fa-circle-check"></i> ¡VUELO ESTABLE COMPLETADO!
          </h4>
          <p style="font-size: 12px; line-height: 1.6; color: var(--text-secondary); margin-bottom: 15px;">
            ¡Excelente pilotaje! Lograste estabilizar las hélices de sustentación del Dron frente a ráfagas severas y completaste el mapeo del sector.<br>
            <strong>Recompensa: +300 Puntos de Vuelo STEAM</strong>
          </p>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button class="btn btn-primary btn-micro" onclick="startVueloGame()"><i class="fa-solid fa-rotate-right"></i> Volar de Nuevo</button>
            <button class="btn btn-outline btn-micro" onclick="resetArcadeHome()"><i class="fa-solid fa-arrow-left"></i> Volver</button>
          </div>
        </div>
      `;
    } else {
      synth.beep(150, 'sawtooth', 0.5);
      html = `
        <div class="mission-details-card" style="text-align: center; border-color: var(--accent-red); max-width: 400px; margin: 20px auto;">
          <h4 style="color: var(--accent-red); justify-content: center;">
            <i class="fa-solid fa-triangle-exclamation"></i> ¡DRON ESTRELLADO!
          </h4>
          <p style="font-size: 12px; line-height: 1.6; color: var(--text-secondary); margin-bottom: 15px;">
            La inestabilidad alcanzó el 100% debido a las ráfagas de viento y falta de impulso. El giroscopio MPU6050 detectó un impacto crítico de caída libre.<br>
            <strong>Inténtalo de nuevo para salvar el equipo de exploración.</strong>
          </p>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button class="btn btn-primary btn-micro" onclick="startVueloGame()"><i class="fa-solid fa-rotate-right"></i> Reintentar Vuelo</button>
            <button class="btn btn-outline btn-micro" onclick="resetArcadeHome()"><i class="fa-solid fa-arrow-left"></i> Volver</button>
          </div>
        </div>
      `;
    }
    if (arcadeWorkspace) {
      arcadeWorkspace.innerHTML = html;
    }
  }

  // Hook global keyboard press spacebar to boost drone
  document.addEventListener('keydown', (e) => {
    const boostBtn = document.getElementById('drone-boost-btn');
    if (boostBtn && e.code === 'Space') {
      e.preventDefault();
      boostDrone();
    }
  });

  window.startArcadeGame = function(gameName) {
    if (gameName === 'trivia') {
      startTriviaGame();
    } else if (gameName === 'misiones') {
      startMisionesGame();
    } else if (gameName === 'vuelo') {
      startVueloGame();
    }
  };

  window.resetArcadeHome = function() {
    if (arcadeWorkspace) {
      arcadeWorkspace.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; padding: 15px 0;">
          <!-- Trivia Card Selector -->
          <div class="cockpit-card" style="flex: 1; min-width: 250px; padding: 25px; text-align: center; border-color: rgba(0, 240, 255, 0.15); cursor: pointer; transition: all 0.3s;" id="play-trivia-btn" onclick="startArcadeGame('trivia')">
            <i class="fa-solid fa-bolt" style="font-size: 3rem; color: var(--accent-cyan); margin-bottom: 15px; text-shadow: 0 0 15px var(--accent-cyan-glow);"></i>
            <h3 style="font-family: var(--font-display); color: #fff; margin-bottom: 8px;">Trivia de Prevención</h3>
            <p style="font-size: 11px; color: var(--text-muted); line-height: 1.5; margin-bottom: 15px;">Pon a prueba tus reflejos cognitivos y tus conocimientos sobre el hardware y protocolos ante riesgos.</p>
            <button class="btn btn-secondary btn-micro btn-block">Jugar Trivia</button>
          </div>

          <!-- Simulador de Misiones Card Selector -->
          <div class="cockpit-card" style="flex: 1; min-width: 250px; padding: 25px; text-align: center; border-color: rgba(245, 158, 11, 0.15); cursor: pointer; transition: all 0.3s;" id="play-sopa-btn" onclick="startArcadeGame('misiones')">
            <i class="fa-solid fa-map-location-dot" style="font-size: 3rem; color: var(--accent-orange); margin-bottom: 15px; text-shadow: 0 0 15px var(--accent-orange);"></i>
            <h3 style="font-family: var(--font-display); color: #fff; margin-bottom: 8px;">Simulador de Misiones</h3>
            <p style="font-size: 11px; color: var(--text-muted); line-height: 1.5; margin-bottom: 15px;">Despliega al robot ARGOS en un mapa táctico interactivo. Resuelve emergencias de sismos, inundaciones e incendios en tiempo real.</p>
            <button class="btn btn-secondary btn-micro btn-block" style="border-color: var(--accent-orange); color: var(--accent-orange);">Iniciar Misiones</button>
          </div>

          <!-- Estabilizador de Dron Card Selector -->
          <div class="cockpit-card" style="flex: 1; min-width: 250px; padding: 25px; text-align: center; border-color: rgba(168, 85, 247, 0.15); cursor: pointer; transition: all 0.3s;" id="play-vuelo-btn" onclick="startArcadeGame('vuelo')">
            <i class="fa-solid fa-helicopter" style="font-size: 3rem; color: #a855f7; margin-bottom: 15px; text-shadow: 0 0 15px rgba(168, 85, 247, 0.55);"></i>
            <h3 style="font-family: var(--font-display); color: #fff; margin-bottom: 8px;">Estabilizador de Dron</h3>
            <p style="font-size: 11px; color: var(--text-muted); line-height: 1.5; margin-bottom: 15px;">Controla la sustentación del dron aéreo frente a ráfagas de viento. Mantén el equilibrio en la zona de altura segura.</p>
            <button class="btn btn-secondary btn-micro btn-block" style="border-color: #a855f7; color: #a855f7;">Iniciar Vuelo</button>
          </div>
        </div>
      `;
    }
  };

  // Top Scroll Progress Listener
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (height > 0) {
      const scrolled = (winScroll / height) * 100;
      const progressFill = document.getElementById('scroll-progress');
      if (progressFill) {
        progressFill.style.width = scrolled + '%';
      }
    }
  });

});
