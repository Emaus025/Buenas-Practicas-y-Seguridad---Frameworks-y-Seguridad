const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Importa el paquete cors

const app = express();

// Habilita CORS para todas las rutas
app.use(cors());

app.use(bodyParser.json());

// Usuarios en hardcoding
const users = [
  { username: 'user1', password: 'pass1' },
  { username: 'user2', password: 'pass2' }
];

// Ruta de login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validar que los campos no estén vacíos
  if (!username || !password) {
    return res.status(400).json({ statusCode: 400, intDataMessage: [{ error: 'Username y password son requeridos' }] });
  }

  // Validar credenciales
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ statusCode: 401, intDataMessage: [{ error: 'Credenciales incorrectas' }] });
  }

  // Generar token JWT (expira en 1 minuto)
  const token = jwt.sign({ username }, 'secretKey', { expiresIn: '1m' });

  // Respuesta exitosa
  res.status(200).json({ statusCode: 200, intDataMessage: [{ credentials: token }] });
});

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});