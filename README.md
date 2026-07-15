# 🚀 Ecosistema Tecnológico ARGOS

> **Plataforma Inteligente de Prevención Civil, Monitoreo Climático y Formación STEAM**  
> Desarrollado bajo la licencia libre **GNU AGPLv3** y diseñado bajo la filosofía **Local-First / Privacidad Total**.

---

## 📖 Descripción General

**ARGOS** es un ecosistema tecnológico multi-agente de vanguardia (terrestre y aéreo) diseñado para patrullar, monitorear y mitigar riesgos ambientales en tiempo real en la región de Paita y Piura. El proyecto combina hardware de código abierto, telemetría IoT de baja latencia mediante WebSockets, visión artificial con inteligencia artificial (IA) y una terminal interactiva gamificada para la formación de resiliencia civil y educación STEAM.

---

## 👥 Equipo de Desarrollo e Innovación

El proyecto ha sido fundado, diseñado y programado por estudiantes de la carrera de **APSTI** (Arquitectura de Plataformas y Servicios de Tecnologías de la Información) del **Instituto de Educación Superior Tecnológico Público "Hermanos Cárcamo"** (Paita):

*   **Misael Pintado** (Co-Fundador y Programador de Mando): Arquitectura de la plataforma web, programación del firmware ESP32, desarrollo de la telemetría interactiva IoT, base de datos simulada local y desarrollo del sistema de ciberseguridad.
*   **Dayron Urbina Zapata** (Co-Fundador e Ingeniero de Robótica): Modelado tridimensional del chasis del rover, ensamblaje de la tracción mecánica por orugas, diseño físico del hangar y acople de sistemas electromecánicos.

> *"Trabajando unidos en equipo, demostramos que la pasión tecnológica y el esfuerzo coordinado lo logran todo."*

---

## 🛠️ Arquitectura de Hardware y Componentes

El cerebro y los sentidos del robot ARGOS están integrados por componentes electrónicos seleccionados estratégicamente:

1.  **ESP32 Devkit V1 (Cerebro Central):** Microcontrolador de doble núcleo a 240 MHz con WiFi y Bluetooth integrados. Permite mantener un enlace bidireccional constante con la interfaz del operador web.
2.  **DHT22 (Sensor de Temperatura y Humedad):** Módulo digital de alta precisión para auditar olas de calor y microclimas de riesgo.
3.  **MPU-6050 (Acelerómetro y Giroscopio de 6 ejes):** Detecta ondas sísmicas de tierra y previene volcaduras del robot monitoreando la inclinación del chasis.
4.  **BMP280 (Barómetro de Presión Atmosférica):** Mide la presión del aire para anticipar frentes de tormentas severas.
5.  **Sensor de Flama Infrarrojo:** Fotodiodo de reacción ultrarrápida (en milisegundos) para localizar focos de incendios forestales.
6.  **Sensor de Lluvia Conductivo:** Placa capacitiva para reportar caídas de agua activas y mitigar desbordes de ríos.
7.  **Puente H L298N (Driver de Potencia):** Canaliza la energía de la batería de 12V para mover los servomotores CC del chasis todoterreno.
8.  **Baterías LiFePO4 de 12V:** Alimentación segura, estable contra sobrecalentamientos y con una vida útil superior a 3000 ciclos.

---

## 🎮 Terminal Arcade STEAM (Juegos Educativos)

La plataforma cuenta con un aula virtual que integra tres juegos diseñados para la formación interactiva:

*   **🏆 Trivia de Prevención (Estilo Kahoot):** Desafío cognitivo de 8 preguntas sobre hardware e IoT. Cuenta con temporizador de 15 segundos y racha de multiplicadores. Alcanzar **800+ puntos** otorga el rango de *Operador Experto*.
*   **🗺️ Simulador de Misiones Tácticas:** Mapa vintage interactivo con overlays holográficos. Los operadores despliegan el robot a incidentes de sismos, fuego e inundaciones. Al mover el robot, se dibuja un **trazado vectorial SVG de trayectoria naranja neón en tiempo real**.
*   **🚁 Estabilizador de Dron Aéreo:** Simulador físico de vuelo estacionario. Controla la sustentación del dron aéreo frente a ráfagas de viento aleatorias (alertadas en pantalla) usando el teclado (barra espaciadora) o botones de impulso.

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

## 🔒 Política de Privacidad (Local-First)

*   **100% Local:** Toda la información (credenciales de usuarios simuladas, puntuaciones, logs y roles desbloqueados) se guarda localmente en el navegador a través de `localStorage`.
*   **Sin Rastreo:** No enviamos cookies, analíticas ni datos a servidores de terceros.
*   **Transparencia de Código:** Conforme a la licencia de software libre, el código fuente es abierto, verificable y seguro para el usuario.

---

## ⚖️ Licencia

Este proyecto está liberado bajo la licencia de software libre **GNU Affero General Public License v3 (AGPL-3.0)**. Si modificas el software y lo ejecutas en un servidor en red, estás obligado a poner a disposición de la comunidad el código fuente correspondiente bajo estos mismos términos.

---

## 🚀 Despliegue Local

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/GMPH2007/sistemateos.github.oi.git
    ```
2.  Abre el archivo `index.html` en cualquier navegador moderno.
3.  *(Opcional)* Si cuentas con el robot físico, ejecuta el servidor WebSocket local en tu microcontrolador ESP32 para emparejar la telemetría.
