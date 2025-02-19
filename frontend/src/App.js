import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
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
          localStorage.removeItem('token'); 
          localStorage.removeItem('permissions'); // Eliminar el token expirado
          setToken('');
        }, expirationTime - now); // Configurar el timeout para cuando expire el token

        return () => clearTimeout(timeout);
      }
    }
  }, [token]);

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth setToken={setToken} />} />
        <Route path="/home" element={token ? <Home /> : <Navigate to="/auth" />} />
        <Route path="/" element={<Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;