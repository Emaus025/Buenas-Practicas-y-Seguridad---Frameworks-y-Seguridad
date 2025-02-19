const UserPanel = ({ permissions }) => {
  // Validar que permissions sea un objeto
  if (typeof permissions !== "object" || permissions === null) {
    console.error("Los permisos no son un objeto válido:", permissions);
    return <p>Error: Los permisos no están en el formato correcto.</p>;
  }

  return (
    <div>
      <h2>Panel de Administrador</h2>
      {"getUser" in permissions && <button>{permissions.getUser}</button>}
      {"deleteUser" in permissions && <button>{permissions.deleteUser}</button>}
      {"updateUser" in permissions && <button>{permissions.updateUser}</button>}
      {"updateRol" in permissions && <button>{permissions.updateRol}</button>}
    </div>
  );
};

export default UserPanel;