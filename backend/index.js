const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json');
const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.use(cors());

app.use(bodyParser.json());

// Endpoint de register
const bcrypt = require('bcrypt');

app.post('/register', async (req, res) => {
  const { email, username, password, role } = req.body;

  if (!email || !username || !password || !role) {
    return res.status(400).json({ statusCode: 400, intDataMessage: [{ error: 'Todos los campos son requeridos' }] });
  }

  try {
    // Verificar si el usuario ya existe
    const userRef = db.collection('users').doc(username);
    const doc = await userRef.get();
    if (doc.exists) {
      return res.status(400).json({ statusCode: 400, intDataMessage: [{ error: 'El usuario ya existe' }] });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario en Firestore
    await userRef.set({
      email,
      username,
      password: hashedPassword,
      role,
      dateRegister: new Date(),
      lastLogin: null
    });

    res.status(201).json({ statusCode: 201, intDataMessage: [{ message: 'Usuario registrado exitosamente' }] });
  } catch (error) {
    res.status(500).json({ statusCode: 500, intDataMessage: [{ error: 'Error al registrar el usuario' }] });
  }
});
// Endpoint de login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ statusCode: 400, intDataMessage: [{ error: 'Username y password son requeridos' }] });
  }

  try {
    // Obtener el usuario de Firestore
    const userRef = db.collection('users').doc(username);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(401).json({ statusCode: 401, intDataMessage: [{ error: 'Credenciales incorrectas' }] });
    }

    const user = doc.data();

    // Verificar la contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ statusCode: 401, intDataMessage: [{ error: 'Credenciales incorrectas' }] });
    }

    // Actualizar lastLogin
    await userRef.update({ lastLogin: new Date() });

    // Generar token JWT
    const token = jwt.sign({ username: user.username, role: user.role }, 'secretKey', { expiresIn: '1m' });

    res.status(200).json({ statusCode: 200, intDataMessage: [{ credentials: token }] });
  } catch (error) {
    res.status(500).json({ statusCode: 500, intDataMessage: [{ error: 'Error al iniciar sesión' }] });
  }
});

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});