# Buenas Prácticas y Seguridad - Frameworks y Seguridad

Este repositorio contiene la actividad "Buenas Prácticas y Seguridad - Frameworks y Seguridad", que consiste en un sistema de autenticación básico implementado con Django y Express.js. El proyecto incluye un login con sesiones en hardcode, validación de campos vacíos, generación de JWT (JSON Web Token) y un frontend que muestra un contador de tiempo restante para el token.

## Estructura del Proyecto

El proyecto está dividido en tres partes principales:

1. **Backend en Django**:
   - Login con sesiones en hardcode.
   - Manejo de sesiones básico.

2. **Backend en Express.js**:
   - Endpoint de login con validación de campos vacíos.
   - Generación de un JWT con una duración de 1 minuto.
   - Manejo de sesiones en hardcode.

3. **Frontend**:
   - Muestra el tiempo restante del JWT.
   - Redirección automática a la página de login cuando el token expira.

## Requisitos

- Python 3.x
- Node.js
- Django
- Express.js
- React (opcional, para el frontend)

## Configuración

### Backend en Django

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/tu-repositorio.git
   cd tu-repositorio/django-backend
   ```
2. Crea un entorno virtual y actívalo:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```
3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Ejecuta las migraciones:
   ```bash
   python manage.py migrate
   ```
5. Inicia el servidor de desarrollo:
   ```bash
   python manage.py runserver
   ```

### Backend en Express.js

1. Navega a la carpeta del backend en Express.js:
   ```bash
   cd ../express-backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor:
   ```bash
   npm start
   ```

### Frontend

1. Navega a la carpeta del frontend:
   ```bash
   cd ../frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia la aplicación:
   ```bash
   npm start
   ```

## Uso

1. Accede al frontend en tu navegador: [http://localhost:3000](http://localhost:3000).
2. Ingresa las credenciales (hardcodeadas) para iniciar sesión.
3. Observa el contador de tiempo restante para el JWT.
4. Cuando el token expire, serás redirigido automáticamente a la página de login.

## Buenas Prácticas y Seguridad

### Django
- **Validación de campos**: Asegura que los campos no estén vacíos antes de procesar el login.
- **Sesiones**: Uso de sesiones para mantener el estado del usuario.
- **Hardcode**: Las credenciales están hardcodeadas solo con fines demostrativos. En un entorno de producción, utiliza una base de datos segura y hashea las contraseñas.

### Express.js
- **Validación de campos**: Se valida que los campos no estén vacíos antes de generar el JWT.
- **JWT**: Uso de JSON Web Tokens para manejar la autenticación. El token tiene una duración de 1 minuto.
- **Hardcode**: Las credenciales están hardcodeadas solo con fines demostrativos. En un entorno de producción, utiliza una base de datos segura y hashea las contraseñas.

### Frontend
- **Contador de tiempo**: Muestra el tiempo restante para la expiración del JWT.
- **Redirección automática**: Cuando el token expira, el usuario es redirigido automáticamente a la página de login.

