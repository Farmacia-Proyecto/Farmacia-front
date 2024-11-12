<template>
  <div class="login-container">
    <div class="login">
      <div class="title-container">
        <h1 class="title">Inicia Sesión</h1>
        <p v-if="error" class="error-message">
          Has introducido mal el email o la contraseña.
        </p>
      </div>
      <form class="form" @submit.prevent="login">
        <label class="form-label" for="email">Usuario:</label>
        <div class="input-container">
          <font-awesome-icon icon="fa-solid fa-user" class="input-icon" />
          <input
            v-model="email"
            class="form-input"
            type="text"
            id="user"
            required
            placeholder="Usuario"
          />
        </div>

        <label class="form-label" for="password">Contraseña:</label>
        <div class="input-container">
          <font-awesome-icon icon="fa-solid fa-key" class="input-icon" />
          <input
            v-model="password"
            class="form-input"
            type="password"
            id="password"
            placeholder="Contraseña"
          />
        </div>

        <div class="buttons-container">
          <input class="form-submit" type="submit" value="Login" />
          <input
            class="form-submit"
            type="button"
            value="Recuperar Contraseña"
            @click="goToRecovery"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import auth from "../logic/auth";
export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      error: false,
    };
  },
  methods: {
    async login() {
      try {
        const response = await auth.login(this.email, this.password);
        document.cookie = `jwt=${response}; path=/; secure; samesite=strict`;
        this.$router.push("/admin");
      } catch (error) {
        console.log(error);
        this.error = true;
      }
    },
    goToRecovery() {
      this.$router.push("/recovery");
    },
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  height: 98vh;
  display: flex;
  justify-content: flex-end;
  position: relative;
}

.login-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 55%;
  height: 100%;
  background-image: url('../assets/Fondo-login.png');
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 40%;
  background: rgba(19, 35, 47, 0.9);
  border-radius: 5px;
  padding: 40px;
  box-shadow: 0 4px 10px 4px rgba(0, 0, 0, 0.7);
  position: relative;
  z-index: 1;
}

.title-container {
  width: 100%;
  background-color: #1ab188;
  align-content: center;
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.title {
  text-align: center;
  font-size: xx-large;
  color: white;
  margin: 0;
}

/* Estilo para el mensaje de error */
.error-message {
  color: red;
  font-size: 1rem;
  text-align: center;
  margin-top: 10px;
}

.form {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: larger;
  margin-top: 2rem;
  color: white;
  margin-bottom: 0.5rem;
}

.form-label:first-of-type {
  margin-top: 0rem;
}

.input-container {
  position: relative;
  width: 100%;
}

.input-icon {
  position: absolute;
  left: -25px;
  top: 50%;
  transform: translateY(-50%);
  color: #b4b4b4;
  font-size: 1.2rem;
}

.form-input {
  padding: 10px;
  border: none;
  border-bottom: 2px solid white;
  background: none;
  color: white;
  width: 100%;
  outline: none;
  transition: border-bottom-color 0.3s;
}

.form-input:focus {
  border-bottom-color: #1ab188;
}

.buttons-container {
  display: flex;
  flex-direction: row;
}

.form-submit {
  background: #1ab188;
  border: none;
  margin: 6px;
  border-radius: 25px;
  color: white;
  margin-top: 3rem;
  padding: 1rem 2rem;
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.form-submit:hover {
  background: #0b9185;
  transform: translateY(-2px);
}

.form-submit:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}
</style>
