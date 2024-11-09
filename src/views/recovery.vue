<template>
    <div class="recovery-container">
        <div class="recovery">
            <div class="title-container">
                <h1 class="title">Recuperar Contraseña</h1>
            </div>
            <p class="message">Ingrese su usuario para recibir una clave provicional</p>
            <form class="form" @submit.prevent="login">
                <label class="form-label" for="email">Usuario:</label>
                <input v-model="email" class="form-input" type="email" id="email" required placeholder="Usuario" />
                <input class="form-submit" type="submit" value="Enviar">
            </form>
        </div>
    </div>
</template>
<script>
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
    login() {
      console.log(this.email);  
    },
  },
};
</script>
<style lang="scss" scoped>
.recovery-container {
  height: 98vh;
  display: flex;
  justify-content: center;
  position: relative; 
  background: rgba(19, 35, 47, 0.9);
}

.recovery {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  top: 20%;
  width: 30%;
  height: 50%;
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

.message{
    text-align: center;
    font-size: large;
    color: white;
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


.form-submit {
  background: #1ab188;
  border: none;
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