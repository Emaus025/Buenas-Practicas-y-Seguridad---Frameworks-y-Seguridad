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
    <div>
      <h1>Bienvenido al Home</h1>
      <p>Token: {token}</p> {/* Mostrar el token */}
      <p>Tiempo restante: {timeLeft} segundos</p> {/* Mostrar el contador */}
    </div>
  );
}

export default Home;