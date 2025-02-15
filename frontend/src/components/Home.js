import React, { useEffect, useState } from 'react';

function Home() {
  const [timeLeft, setTimeLeft] = useState(60); // Tiempo inicial en segundos
  const token = localStorage.getItem('token'); // Obtén el token del localStorage

  // Función para calcular el tiempo restante
  useEffect(() => {
    if (!token) return;

    // Decodificar el token para obtener la fecha de expiración
    const decodedToken = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = decodedToken.exp * 1000; // Convertir a milisegundos
    const now = Date.now();

    // Calcular el tiempo restante en segundos
    const remainingTime = Math.floor((expirationTime - now) / 1000);

    // Actualizar el estado con el tiempo restante
    setTimeLeft(remainingTime > 0 ? remainingTime : 0);

    // Configurar un intervalo para actualizar el contador cada segundo
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5', // Fondo claro
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', // Sombra suave
        textAlign: 'center',
        width: '300px'
      }}>
        <h1 style={{ margin: 0, marginBottom: '1rem', fontSize: '24px', color: '#333' }}>Bienvenido al Home</h1>
        <p style={{ margin: '0.5rem 0', fontSize: '14px', color: '#555' }}>
          <strong>Token:</strong> {token}
        </p>
        <p style={{ margin: '0.5rem 0', fontSize: '14px', color: '#555' }}>
          <strong>Tiempo restante:</strong> <span style={{ color: timeLeft <= 10 ? 'red' : 'green', fontWeight: 'bold' }}>{timeLeft} segundos</span>
        </p>
      </div>
    </div>
  );
}

export default Home;