const express = require("express");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');
const serviceAccount = require('./config/serviceAccountKey.json');
const cors = require("cors");
const app = express();
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
const bcrypt = require('bcrypt');

// Middleware para verificar la autenticación
const verifyAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Unauthorized" });
  }
};

// Endpoint de register
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

    // Obtener los permisos del rol del usuario
    const roleDoc = await db.collection("permissions").doc(user.role).get();
    if (!roleDoc.exists) {
      return res.status(404).json({ statusCode: 404, intDataMessage: [{ error: 'Permisos no encontrados para el rol del usuario' }] });
    }

    // Generar token JWT
    const token = jwt.sign({ username: user.username, role: user.role }, 'secretKey', { expiresIn: '1m' });

    // Enviar respuesta con token y permisos
    res.status(200).json({
      statusCode: 200,
      intDataMessage: [
        {
          credentials: token,
          permissions: roleDoc.data()
        }
      ]
    });
  } catch (error) {
    res.status(500).json({ statusCode: 500, intDataMessage: [{ error: 'Error al iniciar sesión' }] });
  }
});

// Ruta para obtener permisos según el rol del usuario
app.get("/permissions", verifyAuth, async (req, res) => {
  try {
    const userRole = req.user.role; // Suponiendo que el rol viene en el token
    if (!userRole) {
      return res.status(400).json({ error: "User role not found" });
    }
    const roleDoc = await db.collection("permissions").doc(userRole).get();
    if (!roleDoc.exists) {
      return res.status(404).json({ error: "Role permissions not found" });
    }
    return res.json({ permissions: roleDoc.data() });
  } catch (error) {
    return res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Middleware para validar token y permisos
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ error: "Token requerido" });
  try {
    const decoded = jwt.verify(token, "secretKey"); // Cambiar por tu clave segura
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// Obtener usuarios
app.get("/users", authenticate, async (req, res) => {
  if (!req.user.permissions.includes("Get User"))
    return res.status(403).json({ error: "Permiso denegado" });

  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Eliminar usuario
app.delete("/users/:id", authenticate, async (req, res) => {
  if (!req.user.permissions.includes("Delete User"))
    return res.status(403).json({ error: "Permiso denegado" });

  try {
    await db.collection("users").doc(req.params.id).delete();
    res.json({ message: "Usuario eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// Actualizar usuario
app.put("/users/:id", authenticate, async (req, res) => {
  if (!req.user.permissions.includes("Update User"))
    return res.status(403).json({ error: "Permiso denegado" });

  try {
    await db.collection("users").doc(req.params.id).update(req.body);
    res.json({ message: "Usuario actualizado" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// Modificar rol de usuario
app.put("/users/:id/role", authenticate, async (req, res) => {
  if (!req.user.permissions.includes("Update Rol"))
    return res.status(403).json({ error: "Permiso denegado" });

  try {
    await db.collection("users").doc(req.params.id).update({ role: req.body.role });
    res.json({ message: "Rol actualizado" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar rol" });
  }
});

// Agregar nuevo rol
app.post("/roles", authenticate, async (req, res) => {
  if (!req.user.permissions.includes("Add Rol"))
    return res.status(403).json({ error: "Permiso denegado" });

  try {
    const { role, permissions } = req.body;
    await db.collection("roles").doc(role).set({ permissions });
    res.json({ message: "Rol agregado" });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar rol" });
  }
});

// Eliminar rol
app.delete("/roles/:role", authenticate, async (req, res) => {
  if (!req.user.permissions.includes("Delete Rol"))
    return res.status(403).json({ error: "Permiso denegado" });

  try {
    await db.collection("roles").doc(req.params.role).delete();
    res.json({ message: "Rol eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar rol" });
  }
});

// Agregar permiso a un rol
app.post("/roles/:role/permissions", authenticate, async (req, res) => {
  if (!req.user.permissions.includes("Add Permission"))
    return res.status(403).json({ error: "Permiso denegado" });

  try {
    const roleRef = db.collection("roles").doc(req.params.role);
    const roleDoc = await roleRef.get();
    if (!roleDoc.exists) return res.status(404).json({ error: "Rol no encontrado" });

    const updatedPermissions = [...roleDoc.data().permissions, req.body.permission];
    await roleRef.update({ permissions: updatedPermissions });

    res.json({ message: "Permiso agregado" });
  } catch (error) {
    res.status(500).json({ error: "Error al agregar permiso" });
  }
});

// Eliminar permiso de un rol
app.delete("/roles/:role/permissions/:permission", authenticate, async (req, res) => {
  if (!req.user.permissions.includes("Delete Permission"))
    return res.status(403).json({ error: "Permiso denegado" });

  try {
    const roleRef = db.collection("roles").doc(req.params.role);
    const roleDoc = await roleRef.get();
    if (!roleDoc.exists) return res.status(404).json({ error: "Rol no encontrado" });

    const updatedPermissions = roleDoc
      .data()
      .permissions.filter((p) => p !== req.params.permission);
    await roleRef.update({ permissions: updatedPermissions });

    res.json({ message: "Permiso eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar permiso" });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
