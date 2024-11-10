<template>
  <div class="app-container">
    <!-- Barra superior -->
    <header class="top-bar">
      <div class="logo">Farmaceutica S.A</div>
      <div class="top-menu">
        <button class="user-btn"><i class="fas fa-user"></i> Admin</button>
        <button class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</button>
      </div>
    </header>

    <!-- Menú lateral -->
    <aside class="sidebar">
      <nav class="menu">
        <ul>
          <li><i class="fas fa-home"></i> Home</li>
          <li><i class="fas fa-box"></i> Stock</li>
          <li class="active"><i class="fas fa-users"></i> Users</li>
          <li><i class="fas fa-cogs"></i> Control Panel</li>
          <li><i class="fas fa-chart-bar"></i> Reports</li>
          <li><i class="fas fa-tools"></i> Tools</li>
          <li><i class="fas fa-cog"></i> Config</li>
        </ul>
      </nav>
    </aside>

    <!-- Contenido principal -->
    <div class="main-content">
      <header class="header">
        <div class="header-title">Users</div>
        <div class="search-bar">
          <input type="text" placeholder="Search Users" />
          <button class="search-btn"><i class="fas fa-search"></i> Search</button>
        </div>
        <button class="add-btn" @click="toggleView">{{ isFormVisible ? 'Back to List' : 'Add New' }}</button>
      </header>

      <!-- Vista condicional: Formulario o Tabla -->
      <div v-if="isFormVisible">
        <!-- Formulario de registro de usuario -->
        <form @submit.prevent="submitForm" class="user-form">
          <div class="form-group">
            <label>Tipo de Documento</label>
            <select v-model="user.tipoDocumento">
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
            </select>
          </div>
          <div class="form-group">
            <label>Documento</label>
            <input type="text" v-model="user.documento" required />
          </div>
          <div class="form-group">
            <label>Nombres</label>
            <input type="text" v-model="user.nombres" required />
          </div>
          <div class="form-group">
            <label>Apellidos</label>
            <input type="text" v-model="user.apellidos" required />
          </div>
          <div class="form-group">
            <label>Tipo de Usuario</label>
            <select v-model="user.tipoUsuario">
              <option value="admin">Administrador</option>
              <option value="manager">Gerente</option>
              <option value="user">Vendedor</option>
            </select>
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input type="tel" v-model="user.telefono" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="user.email" required />
          </div>
          <button type="submit" class="submit-btn">Guardar</button>
        </form>
      </div>

      <div v-else>
        <!-- Tabla de usuarios -->
        <table class="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Document</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>admin1</td>
              <td>############</td>
              <td>john@example.com</td>
              <td>Administrator</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      isFormVisible: false,
      user: {
        tipoDocumento: '',
        documento: '',
        nombres: '',
        apellidos: '',
        tipoUsuario: '',
        telefono: '',
        email: '',
      },
    };
  },
  methods: {
    toggleView() {
      this.isFormVisible = !this.isFormVisible;
    },
    clearForm() {
      this.user = {
        tipoDocumento: '',
        documento: '',
        nombres: '',
        apellidos: '',
        tipoUsuario: '',
        telefono: '',
        email: '',
      };
    },
    // Método para obtener el token de las cookies
    getTokenFromCookies() {
      const cookieName = 'jwt=';
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find((cookie) => cookie.startsWith(cookieName));
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    },
    async submitForm() {
      try {
        const token = this.getTokenFromCookies();

        if (!token) {
          alert('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }

        const response = await axios.post(
          'http://localhost:8080/api/users/add',
          this.user,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        console.log('Respuesta del servidor:', response.data);
        alert('Usuario guardado exitosamente');

        this.clearForm();
        this.toggleView();
      } catch (error) {
        console.error('Error al enviar los datos:', error);
        alert('Ocurrió un error al guardar el usuario.');
      }
    },
  },
};
</script>




<style scoped>
/* Estilos generales */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f0f2f5;
}

/* Contenedor de la aplicación */
.app-container {
  display: flex;
  height: 95vh;
  color: #333;
}

/* Barra superior */
.top-bar {
  position: fixed;
  width: 100%;
  height: 60px;
  background-color: #333;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.top-menu button {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  margin-left: 10px;
  cursor: pointer;
  transition: color 0.3s;
}

.top-menu button:hover {
  color: #28a745;
}

/* Menú lateral */
.sidebar {
  width: 250px;
  background-color: #444;
  color: white;
  padding-top: 60px;
}

.menu {
  padding-top: 20px;
}

.menu ul {
  list-style: none;
  padding: 0;
}

.menu li {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.menu li:hover {
  background-color: #555;
  transform: scale(1.05);
}

.menu li.active {
  background-color: #28a745;
}

/* Contenido principal */
.main-content {
  flex: 1;
  padding: 1rem;
  padding-top: 80px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.header-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.search-bar {
  display: flex;
  align-items: center;
}

.search-bar input {
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.search-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  margin-left: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background-color: #218838;
}

.add-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background-color: #0056b3;
}

/* Tabla de usuarios */
.user-table {
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.user-table th,
.user-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #ccc;
  text-align: left;
}

.user-table th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.user-table tr:hover {
  background-color: #f0f0f0;
}

.user-form {
  background-color: #fff;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  max-width: 500px;
  margin: auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.submit-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #218838;
}
</style>
