<template>
  <div>
    <!-- Barra de navegación -->
    <nav class="nav-bar">
      <ul class="nav-menu">
        <li class="nav-item"><a href="#home">Inicio</a></li>
        <li class="nav-item"><a href="#about">Acerca de</a></li>
        <li class="nav-item"><a href="#services">Servicios</a></li>
        <li class="nav-item"><a href="#contact">Contacto</a></li>
      </ul>
      <div class="nav-title">Administrador</div>
      <div class="name-user">Sebastian Daza</div>
      <div class="profile-pic">
        <img :src="profileImage" alt="Foto de perfil" class="profile-img" />
      </div>
    </nav>

    <!-- Formulario de registro de usuario -->
    <form @submit.prevent="registerUser" class="register-form">
      <h2>Registrar Usuario</h2>
      <div class="form-group">
        <label>Tipo de Documento</label>
        <select v-model="user.tipoDocumento">
          <option value="CC">Cédula de Ciudadanía</option>
          <option value="TI">Tarjeta de Identidad</option>
          <option value="CE">Cédula de Extranjería</option>
        </select>
      </div>
      <div class="form-group">
        <label>Documento</label>
        <input type="text" v-model="user.documento" required />
      </div>
      <div class="form-group">
        <label>Nombre</label>
        <input type="text" v-model="user.nombre" required />
      </div>
      <div class="form-group">
        <label>Apellido</label>
        <input type="text" v-model="user.apellido" required />
      </div>
      <div class="form-group">
        <label>Teléfono</label>
        <input type="text" v-model="user.telefono" required />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input type="email" v-model="user.email" required />
      </div>
      <div class="form-group">
        <label>Tipo de Usuario</label>
        <select v-model="user.tipoUsuario">
          <option value="admin">Administrador</option>
          <option value="user">Usuario</option>
        </select>
      </div>
      <button type="submit" class="btn-submit">Registrar</button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      profileImage: "https://via.placeholder.com/50",
      user: {
        tipoDocumento: "",
        documento: "",
        nombre: "",
        apellido: "",
        telefono: "",
        email: "",
        tipoUsuario: "",
      },
    };
  },
  methods: {
    async registerUser() {
      try {
        const response = await axios.post("http://192.168.20.77:3000/api/register", this.user, {
          withCredentials: true, // Para enviar cookies si es necesario
        });
        
        if (response.status === 201) {
          alert("Usuario registrado con éxito");
          this.$router.push("/home");
        } else {
          alert("Error al registrar el usuario");
        }
      } catch (error) {
        console.error("Error al enviar los datos:", error);
        alert("Ocurrió un error al registrar el usuario");
      }
    },
  },
};
</script>

<style scoped>
/* Estilos de la barra de navegación */
.nav-bar {
  background-color: #333;
  border-radius: 7px;
  padding: 1rem;
  display: flex;
  align-items: center;
  position: relative;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin-right: 1.5rem;
}

.nav-item a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
}

.nav-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  color: white;
}

.name-user {
  margin-left: auto;
  margin-right: 1rem;
  color: white;
}

.profile-pic {
  cursor: pointer;
}

.profile-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.register-form {
  margin-top: 2rem;
  background-color: #f9f9f9;
  padding: 1.5rem;
  border-radius: 7px;
}

.form-group {
  margin-bottom: 1rem;
}

input,
select {
  width: 100%;
  padding: 0.5rem;
}

.btn-submit {
  width: 100%;
  padding: 0.75rem;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 5px;
}
</style>
