import auth from "../../logic/auth";
import { jwtDecode } from 'jwt-decode';
import { createApp } from 'vue';
import { useToast } from 'vue-toastification';
import App from '../../App.vue';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

const app = createApp(App);
const options = {
  position: 'top-right',
  timeout: 2000,
  closeOnClick: true,
  pauseOnHover: true,
};
app.use(Toast, options);
app.mount('#app');
function getRoleFromToken(token) {
  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.typeUser; 
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
}

export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
      error: false,
    };
  },
  mounted(){
    this.logOut();
  },
  methods: {
    async login() {
      const toast = useToast(); 
      try {
        const response = await auth.login(this.email, this.password);
        document.cookie = `jwt=${response}; path=/; secure; samesite=strict`;
        const role = getRoleFromToken(response);
        console.log(role);
        if (role === 'Administrador') {
          this.$router.push('/admin');
        } else if (role === 'Gerente') {
          this.$router.push('/user-dashboard');
        } else if (role ==='Vendedor'){
          this.$router.push('/user-dashboard');
        }
         else {
          toast.error("Ingresa con un usario valido");
        }
      } catch (error) {
        toast.error("Usuario o contraseña incorrecta");
        this.error = true;
      }
    },
    goToRecovery() {
      this.$router.push("/recovery");
    },
    logOut() {
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    },
  },
};
