import auth from "../../logic/auth";
import { jwtDecode } from 'jwt-decode';


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
      try {
        const response = await auth.login(this.email, this.password);
        document.cookie = `jwt=${response}; path=/; secure; samesite=strict`;
        const role = getRoleFromToken(response);
        console.log(role);
        if (role === 'Administrador') {
          this.$router.push('/admin');
        } else if (role === 'Grente') {
          this.$router.push('/user-dashboard');
        } else {
          this.$router.push('/login'); 
        }
      } catch (error) {
        console.log(error);
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
