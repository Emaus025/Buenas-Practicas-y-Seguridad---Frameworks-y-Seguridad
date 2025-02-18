import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Auth({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); // Nuevo campo para email
  const [role, setRole] = useState('user'); // Nuevo campo para role (por defecto "user")
  const [error, setError] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false); // Estado para alternar entre login y registro
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', { username, password });
      if (response.data.statusCode === 200) {
        const token = response.data.intDataMessage[0].credentials;
        setToken(token);
        localStorage.setItem('token', token); // Guarda el token en el localStorage
        navigate('/home');
      }
    } catch (err) {
      setError('Credenciales incorrectas');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/register', {
        email,
        username,
        password,
        role
      });
      if (response.data.statusCode === 201) {
        setError('');
        alert('Usuario registrado exitosamente. Por favor, inicia sesión.');
        setIsRegisterMode(false); // Cambiar a modo login después de registrar
      }
    } catch (err) {
      setError('Error al registrar el usuario');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '300px'
      }}>
        <h1 style={{ margin: 0, marginBottom: '1rem', fontSize: '24px', color: '#333' }}>
          {isRegisterMode ? 'Registro' : 'Login'}
        </h1>
        <form
          onSubmit={isRegisterMode ? handleRegister : handleLogin}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {isRegisterMode && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: '0.5rem',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
            />
          )}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              padding: '0.5rem',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: '0.5rem',
              fontSize: '16px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              outline: 'none',
              transition: 'border-color 0.3s'
            }}
          />
          {isRegisterMode && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                padding: '0.5rem',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          )}
          <button
            type="submit"
            style={{
              padding: '0.6rem',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            {isRegisterMode ? 'Registrar' : 'Iniciar Sesión'}
          </button>
        </form>
        {error && <p style={{ marginTop: '1rem', color: 'red', fontSize: '14px' }}>{error}</p>}
        <p style={{ marginTop: '1rem', fontSize: '14px', color: '#333' }}>
          {isRegisterMode ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
          <button
            onClick={() => setIsRegisterMode(!isRegisterMode)}
            style={{
              marginLeft: '0.5rem',
              color: '#007bff',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {isRegisterMode ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;