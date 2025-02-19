import { useEffect, useState } from "react";
import AdminPanel from "./admin";
import UserPanel from "./userpanel";

const Home = () => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Obtener token y permisos del localStorage
    const storedToken = localStorage.getItem("token");
    const storedPermissions = localStorage.getItem("permissions");

    if (storedToken && storedPermissions) {
      try {
        // Decodificar el token para obtener información del usuario
        const decodedToken = JSON.parse(atob(storedToken.split(".")[1])); // Decodificar token JWT
        const parsedPermissions = JSON.parse(storedPermissions); // Parsear permisos desde localStorage

        // Validar que los permisos sean un objeto
        if (typeof parsedPermissions !== "object" || parsedPermissions === null) {
          console.error("Los permisos no son un objeto válido:", parsedPermissions);
          setPermissions({}); // Establecer un objeto vacío como fallback
        } else {
          setPermissions(parsedPermissions); // Guardar permisos en el estado
        }

        // Calcular el tiempo restante del token
        const expirationTime = decodedToken.exp * 1000; // Convertir a milisegundos
        const now = Date.now();
        const remainingTime = Math.floor((expirationTime - now) / 1000); // Tiempo restante en segundos
        setTimeLeft(remainingTime > 0 ? remainingTime : 0);

        // Establecer el estado del usuario
        setUser({
          username: decodedToken.username,
          role: decodedToken.role || "user", // Asegúrate de que el rol esté presente
        });

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
      } catch (error) {
        console.error("Error al decodificar el token o permisos:", error);
      }
    }
  }, []);

  // Si no hay usuario, mostrar un mensaje de carga
  if (!user) return <p>Cargando...</p>;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
        padding: "2rem",
      }}
    >
      {/* Tarjeta principal */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        {/* Encabezado */}
        <h1
          style={{
            margin: 0,
            marginBottom: "1rem",
            fontSize: "24px",
            color: "#333",
            fontWeight: "bold",
          }}
        >
          Bienvenido, {user.username}
        </h1>

        {/* Información del usuario */}
        <div
          style={{
            marginBottom: "1rem",
            fontSize: "14px",
            color: "#555",
          }}
        >
          <p>
            <strong>Rol:</strong> {user.role}
          </p>
          <p>
            <strong>Tiempo restante:</strong>{" "}
            <span
              style={{
                color: timeLeft <= 10 ? "red" : "green",
                fontWeight: "bold",
              }}
            >
              {timeLeft} segundos
            </span>
          </p>
        </div>

        {/* Panel de roles */}
        <div
          style={{
            marginBottom: "1rem",
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          <button
            style={{
              padding: "0.6rem 1rem",
              fontSize: "14px",
              backgroundColor: user.role === "admin" ? "#007bff" : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: user.role === "admin" ? "pointer" : "not-allowed",
              transition: "background-color 0.3s",
            }}
            disabled={user.role !== "admin"}
          >
            Administrador
          </button>
          <button
            style={{
              padding: "0.6rem 1rem",
              fontSize: "14px",
              backgroundColor: user.role === "user" ? "#007bff" : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: user.role === "user" ? "pointer" : "not-allowed",
              transition: "background-color 0.3s",
            }}
            disabled={user.role !== "user"}
          >
            Usuario
          </button>
        </div>

        {/* Renderizar el panel correspondiente según el rol */}
        {user.role === "admin" ? (
          <AdminPanel permissions={permissions} />
        ) : (
          <UserPanel permissions={permissions} />
        )}
      </div>
    </div>
  );
};

export default Home;