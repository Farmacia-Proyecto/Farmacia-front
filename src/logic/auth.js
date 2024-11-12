import axios from "axios";

export default {
  async login(userName, password) {
    try {
      const response = await axios.post(
        "http://localhost:3000/login",
        { userName, password },
        { withCredentials: true }  
      );

      if (response.data && response.data.token) {
        console.log("Login exitoso, token:", response.data.token);
        return response.data.token;  
      } else {
        throw new Error("Token no recibido");
      }
    } catch (error) {
      console.error("Error al hacer login:", error);
      if (error.response && error.response.status === 401) {
        throw new Error("Usuario o contraseña incorrectos");
      }
      throw new Error("Ocurrió un error al intentar iniciar sesión");
    }
  }
};
