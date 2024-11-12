<template>
  <div class="app-container">
    <!-- Barra superior -->
    <header class="top-bar">
  <div class="logo">Farmaceutica S.A</div>
  <div class="top-menu">
    <!-- Botón de Admin con menú desplegable -->
    <div class="dropdown">
      <button class="user-btn" @click="toggleDropdown"><i class="fas fa-user"></i> Admin</button>
      <ul v-if="isDropdownVisible" class="dropdown-menu">
        <li @click="showChangePasswordForm">Cambiar Contraseña</li>
      </ul>
    </div>
    <button class="logout-btn" @click="logOut"><i class="fas fa-sign-out-alt"></i> Logout</button>
  </div>
</header>
    <aside class="sidebar">
      <nav class="menu">
        <ul>
          <li><i class="fas fa-home"></i> Home</li>
          <li><i class="fas fa-box"></i> Stock</li>
          <li class="active" @click="viewUsers"><i class="fas fa-users"></i> Users</li>
          <li><i class="fas fa-cogs"></i> Control Panel</li>
          <li><i class="fas fa-chart-bar"></i> Reports</li>
          <li><i class="fas fa-tools"></i> Tools</li>
          <li><i class="fas fa-cog"></i> Config</li>
        </ul>
      </nav>
    </aside>

    <div  class="main-content">
      <header v-if="isUserHeaderVisible" class="header">
        <div class="header-title">Users</div>
        <div class="search-bar">
          <input type="text" placeholder="Search Users" />
          <button class="search-btn">
            <i class="fas fa-search"></i> Search
          </button>
        </div>
        <button class="add-btn" @click="toggleView">
          {{ isFormVisible ? 'Back to List' : 'Add New' }}
        </button>
      </header>
  <div v-if="isChangePasswordFormVisible" class="change-password-form">
    <form @submit.prevent="changePassword">
      <div class="form-group">
        <label>Contraseña Actual</label>
        <input type="password" v-model="currentPassword" required />
      </div>
      <div class="form-group">
        <label>Nueva Contraseña</label>
        <input type="password" v-model="newPassword" required />
      </div>
      <button type="submit" class="submit-btn">Actualizar Contraseña</button>
    </form>
  </div>
      <div v-if="isFormVisible">
        <form @submit.prevent="submitForm" class="user-form">
          <div class="form-group">
            <label>Tipo de Documento</label>
            <select v-model="infoPerson.typeDocument">
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
            </select>
          </div>
          <div class="form-group">
            <label>Documento</label>
            <input type="text" v-model="infoPerson.document" required />
          </div>
          <div class="form-group">
            <label>Nombres</label>
            <input type="text" v-model="infoPerson.namePerson" required />
          </div>
          <div class="form-group">
            <label>Apellidos</label>
            <input type="text" v-model="infoPerson.lastNamePerson" required />
          </div>
          <div class="form-group">
            <label>Tipo de Usuario</label>
            <select v-model="infoPerson.typeUser">
              <option value="Administrador">Administrador</option>
              <option value="Gerente">Gerente</option>
              <option value="Vendedor">Vendedor</option>
            </select>
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input type="tel" v-model="infoPerson.phone" required />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="infoPerson.email" required />
          </div>
          <button type="submit" class="submit-btn">Guardar</button>
        </form>
      </div>

<!-- Tabla de usuarios (oculta cuando se muestra el formulario para cambiar la contraseña) -->
<div v-if="isUserHeaderVisible && !isFormVisible && !isChangePasswordFormVisible" class="user-table-container">
  <table class="user-table">
    <thead>
      <tr>
        <th>Documento</th>
        <th>Nombre</th>
        <th>Correo</th>
        <th>Rol</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(user, index) in users" :key="index">
        <td>{{ user.document }}</td>
        <td>{{ user.fullName }}</td>
        <td>{{ user.email }}</td>
        <td>{{ user.typeUser }}</td>
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
    isDropdownVisible: false,
    isChangePasswordFormVisible: false,
    isFormVisible: false,
    isUserHeaderVisible: false, 
    currentPassword: '',
    newPassword: '',
    infoPerson: {
      typeDocument: '',
      document: '',
      namePerson: '',
      lastNamePerson: '',
      typeUser: '',
      phone: '',
      email: '',
    },
    users: [],
  };
},

  methods: {
    viewUsers() {
    this.isUserHeaderVisible = true;
    this.isFormVisible = false;
    this.isUserHeaderVisible=true;
    this.isChangePasswordFormVisible = false;
    this.fetchUsers();
  },
    logOut() {
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      this.$router.push("/");
    },
    toggleView() {
      this.isFormVisible = !this.isFormVisible;
      this.isChangePasswordFormVisible = false;
    },
    toggleDropdown() {
      this.isDropdownVisible = !this.isDropdownVisible;
    },
    showChangePasswordForm() {
      this.isUserHeaderVisible=false;
      this.isDropdownVisible = false;
      this.isChangePasswordFormVisible = true;
      this.isFormVisible=false;
    },
    async fetchUsers() {
      try {
        const token = this.getTokenFromCookies();

        if (!token) {
          alert('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }
        const response = await axios.get('http://localhost:3000/person', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        });
        console.log(response)
        if (response.data && response.data.users) {
          this.users = response.data.users; 
        } else {
          alert('No se encontraron usuarios.');
        }
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        alert('Ocurrió un error al cargar los usuarios.');
      }
    },
    async changePassword() {
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          alert('Por favor, inicia sesión de nuevo.');
          return;
        }

        const response = await axios.post(
          'http://localhost:8080/api/users/change-password',
          {
            currentPassword: this.currentPassword,
            newPassword: this.newPassword,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          alert('Contraseña actualizada exitosamente.');
          this.currentPassword = '';
          this.newPassword = '';
          this.isChangePasswordFormVisible = false;
        } else {
          alert('Error al actualizar la contraseña.');
        }
      } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        alert('Ocurrió un error al cambiar la contraseña.');
      }
    },
    async submitForm() {
      try {
        const token = this.getTokenFromCookies();

        if (!token) {
          alert('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }

        const response = await axios.post(
          'http://localhost:3000/person',
          this.infoPerson,
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
    getTokenFromCookies() {
      const cookieName = 'jwt=';
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find((cookie) => cookie.startsWith(cookieName));
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    },
    
  },
};
</script>

<style scoped>
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

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #444;
  color: white;
  padding: 0.5rem;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.dropdown-menu li {
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dropdown-menu li:hover {
  background-color: #555;
}

/* Formulario de cambio de contraseña */
.change-password-form {
  background-color: #fff;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  max-width: 400px;
  margin: 2rem auto;
}

.change-password-form .form-group {
  margin-bottom: 1rem;
}

.change-password-form label {
  display: block;
  margin-bottom: 0.5rem;
}

.change-password-form input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 5px;
  border: 1px solid #ccc;
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

.user-table-container {
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table th,
.user-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.user-table th {
  background-color: #444;
  color: white;
}

.user-table tr:hover {
  background-color: #e0e0e0;
}

.user-table td {
  color: #333;
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
