import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Verificar si el token expiró
  useEffect(() => {
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = decodedToken.exp * 1000; // Convertir a milisegundos
      const now = Date.now();

      if (expirationTime <= now) {
        localStorage.removeItem('token'); // Eliminar el token expirado
        setToken('');
      } else {
        const timeout = setTimeout(() => {
          alert('La sesión ha expirado');
          localStorage.removeItem('token'); // Eliminar el token expirado
          setToken('');
        }, expirationTime - now); // Configurar el timeout para cuando expire el token

        return () => clearTimeout(timeout);
      }
    }
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/home" element={token ? <Home /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;