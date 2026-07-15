<div align="center">

# ⚡ ARGOS SYSTEM v5.20 ⚡

[![DEVELOPER: MISAEL PINTADO](https://img.shields.io/badge/DEVELOPER-MISAEL_PINTADO-00F0FF?style=for-the-badge&logo=github)](#)
[![CO-DEVELOPER: DAYRON URBINA](https://img.shields.io/badge/CO--DEVELOPER-DAYRON_URBINA-A855F7?style=for-the-badge&logo=github)](#)
[![SECURITY: HARDENED SHIELD](https://img.shields.io/badge/SECURITY-HARDENED_SHIELD-FF3E3E?style=for-the-badge&logo=shield)](SECURITY.md)
[![DEPLOYMENT: GITHUB PAGES](https://img.shields.io/badge/DEPLOYMENT-GITHUB_PAGES-00FF66?style=for-the-badge&logo=googlechrome)](https://gmph2007.github.io/sistemateos.github.oi/)

```text
 █████╗ ██████╗  ██████╗  ██████╗ ███████╗
██╔══██╗██╔══██╗██╔════╝ ██╔═══██╗██╔════╝
███████║██████╔╝██║  ███╗██║   ██║███████╗
██╔══██║██╔══██╗██║   ██║██║   ██║╚════██║
██║  ██║██║  ██║╚██████╔╝╚██████╔╝███████║
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚══════╝
```

**Plataforma Autónoma de Monitoreo Ambiental, Prevención de Desastres y Educación STEAM**  
*Un proyecto de código abierto, local-first y enfocado en la resiliencia civil de comunidades.*

---

[🌐 Ver Aplicación en Producción](https://gmph2007.github.io/sistemateos.github.oi/) • [⚖️ Términos Legales](#-política-de-privacidad-y-legalidad) • [👥 Nuestro Equipo](#-equipo-de-desarrollo-e-innovación) • [🛡️ Política de Seguridad](SECURITY.md)

</div>

---

## 📖 Descripción General

**ARGOS** es un ecosistema tecnológico multi-agente de vanguardia (terrestre y aéreo) diseñado para patrullar, monitorear y mitigar riesgos ambientales en tiempo real en la región de Paita y Piura. El proyecto combina hardware de código abierto, telemetría IoT de baja latencia mediante WebSockets, visión artificial con inteligencia artificial (IA) y una terminal interactiva gamificada para la formación de resiliencia civil y educación STEAM.

---

## 👥 Equipo de Desarrollo e Innovación

El proyecto ha sido fundado, diseñado y programado por estudiantes de la carrera de **APSTI** (Arquitectura de Plataformas y Servicios de Tecnologías de la Información) del **Instituto de Educación Superior Tecnológico Público "Hermanos Cárcamo"** (Paita):

*   **Misael Pintado** (Co-Fundador y Programador de Mando): Arquitectura de la plataforma web, programación del firmware ESP32, desarrollo de la telemetría interactiva IoT, base de datos simulada local y desarrollo del sistema de ciberseguridad.
*   **Dayron Urbina Zapata** (Co-Fundador e Ingeniero de Robótica): Modelado tridimensional del chasis del rover, ensamblaje de la tracción mecánica por orugas, diseño físico del hangar y acople de sistemas electromecánicos.

> 💡 *"Trabajando unidos en equipo, demostramos que la pasión tecnológica y el esfuerzo coordinado lo logran todo."*

---

## 📊 Arquitectura del Sistema

El siguiente diagrama de flujo esquematiza las interconexiones físicas y los canales de comunicación lógicos de ARGOS:

```mermaid
graph TD
    %% Nodes definition
    Operator[("💻 Interfaz del Operador<br>(Dashboard HTML5/CSS3/JS)")]
    ESP32["🧠 Microcontrolador ESP32 Devkit V1<br>(Servidor WebSocket Arduino)"]
    L298N["🔌 Driver Puente H L298N"]
    Motors["⚙️ Orugas Todo Terreno (Motores 12V CC)"]
    Dron["🚁 Dron de Exploración Aérea<br>(Cámara IA Centrada)"]
    
    %% Sensors
    DHT22["🌡️ Sensor DHT22<br>(Temperatura/Humedad)"]
    MPU6050["📐 IMU MPU6050<br>(Sismos/Inclinación)"]
    BMP280["☁️ Barómetro BMP280<br>(Presión Atmosférica)"]
    Rain["🌧️ Sensor de Lluvia"]
    Flame["🔥 Sensor de Flama IR"]
    
    %% Connections
    Operator <-->|"WebSockets (Baja Latencia)"| ESP32
    ESP32 -->|"Señales PWM"| L298N
    L298N -->|"Corriente de 12V"| Motors
    ESP32 -->|"Rampa Mecánica"| Dron
    
    %% I2C & Analog/Digital inputs
    DHT22 -.->|"GPIO Digital"| ESP32
    MPU6050 -.->|"Bus I2C"| ESP32
    BMP280 -.->|"Bus I2C"| ESP32
    Rain -.->|"ADC Analógico"| ESP32
    Flame -.->|"GPIO Digital"| ESP32
    
    %% Styling
    classDef main fill:#00f0ff,stroke:#005577,stroke-width:2px,color:#000;
    classDef hardware fill:#181a24,stroke:#3b3f54,stroke-width:1px,color:#fff;
    classDef actor fill:#ff8c00,stroke:#886a00,stroke-width:2px,color:#fff;
    
    class Operator,Dron actor;
    class ESP32 main;
    class L298N,Motors,DHT22,MPU6050,BMP280,Rain,Flame hardware;
```

---

## 🛠️ Especificaciones de Hardware y Sensores

| Componente | Tipo de Sensor / Acción | ¿Por qué se utiliza? |
| :--- | :--- | :--- |
| **ESP32 Devkit V1** | Microcontrolador central | CPU doble núcleo con conectividad WiFi/Bluetooth nativa para enlaces de baja latencia. |
| **MPU-6050** | Giroscopio e Inclinómetro | Audita en tiempo real las ondas sísmicas de tierra y previene volcaduras en pendientes empinadas. |
| **DHT22** | Termohigrómetro de alta precisión | Monitorea la humedad y temperatura ambiente para auditar frentes cálidos o secos. |
| **BMP280** | Barómetro Bosch | Registra la presión atmosférica en hPa para la predicción temprana de tormentas severas. |
| **Sensor de Lluvia** | Placa capacitiva conductiva | Alerta ante la caída de agua para activar protocolos preventivos de inundaciones. |
| **Sensor de Lluvia** | Placa capacitiva conductiva | Alerta ante la caída de agua para activar protocolos preventivos de inundaciones. |
| **Sensor de Flama** | Receptor infrarrojo de llama | Reacciona en milisegundos ante la radiación térmica emitida por fuegos accidentales. |
| **L298N H-Bridge** | Controlador del motor | Regula la potencia de 12V hacia las orugas motrices mediante señales analógicas PWM del ESP32. |

---

## 🎮 Terminal Arcade STEAM (Juegos Educativos)

Para incentivar el aprendizaje interactivo y la toma de decisiones críticas en emergencias, la plataforma integra tres simuladores gamificados:

1.  **🏆 Trivia de Prevención (Kahoot Style):** Desafío cognitivo de 8 preguntas sobre hardware y prevención, con temporizador de 15 segundos y racha de multiplicadores. Alcanzar **800+ puntos** otorga el rango de *Operador Experto*.
2.  **🗺️ Simulador de Misiones Tácticas:** Mapa vintage interactivo con overlays holográficos. Al enrutar el robot ARGOS hacia incidentes de sismo, fuego o inundación, la interfaz genera un **trazado vectorial SVG de trayectoria naranja neón animado**.
3.  **🚁 Estabilizador de Dron Aéreo:** Simulador físico en tiempo real de vuelo estacionario. Controla la sustentación del dron frente a ráfagas de viento variables (con alertas e indicadores en pantalla) usando botones de impulso o la barra espaciadora.

---

## 🔑 Gamificación: Desbloqueo del Rol "Controlador Experto"

ARGOS premia la excelencia técnica de sus usuarios. Al completar con éxito **Todas las Misiones** en el Simulador o calificar como **Operador de Nivel Experto** en la Trivia:
*   Se desbloquea de manera permanente en el navegador el rol exclusivo **Controlador Experto 🏆**.
*   El usuario se destaca en el panel con una **Corona Dorada (`fa-crown`)** y un resplandor de neón áureo.
*   Otorga **Acceso Administrativo Completo** a la consola del docente, controles físicos del rover y telemetría del dron sin requerir contraseñas.

---

## 🛡️ Escudo de Ciberseguridad Anti-Hackers

El código y el diseño visual de ARGOS están protegidos con un escudo digital anti-intrusión:
*   **Bloqueo de Clic Derecho:** Se deshabilita el menú contextual. Todo intento de clic derecho emite una advertencia auditiva de alarma y un log en consola.
*   **Bloqueo de Atajos del Depurador:** Quedan inhabilitadas las teclas de inspección de código (`F12`, `Ctrl+Shift+I`, `Ctrl+Shift+J`, `Ctrl+Shift+C`, `Ctrl+U`, `Ctrl+S`).
*   **Firmas Ofuscadas:** Las validaciones de teclado y los eventos clave están encriptados en **Base64** en tiempo de ejecución para evitar que se puedan filtrar o modificar los códigos del sistema.

---

## 🔒 Política de Privacidad y Legalidad

*   **Local-First / Privacidad Absoluta:** Toda tu información, contraseñas simuladas, sesiones y puntuaciones de arcade se guardan única y exclusivamente de forma local en tu navegador utilizando `localStorage`.
*   **Sin Rastreo:** No recopilamos, rastreamos ni enviamos datos a servidores externos. Tu privacidad es nuestra absoluta prioridad.
*   **Licencia GNU AGPLv3:** El software está liberado bajo la licencia de software libre **GNU Affero General Public License v3 (AGPL-3.0)**, garantizando que el código permanezca abierto y auditable para toda la comunidad.

---

## 🌐 Aplicación Web en Producción (Demo en Vivo)

Puedes acceder de manera directa al sistema ARGOS interactivo en producción sin necesidad de descargar o instalar el código haciendo clic en el siguiente enlace:

👉 **[https://gmph2007.github.io/sistemateos.github.oi/](https://gmph2007.github.io/sistemateos.github.oi/)**

---

## 🚀 Guía de Despliegue Local

1.  Clona el repositorio en tu ordenador:
    ```bash
    git clone https://github.com/GMPH2007/sistemateos.github.oi.git
    ```
2.  Abre el archivo `index.html` en tu navegador web moderno.
3.  *(Opcional)* Empareja el microcontrolador ESP32 ejecutando el servidor WebSocket provisto en los esquemáticos para sincronizar la telemetría física.
