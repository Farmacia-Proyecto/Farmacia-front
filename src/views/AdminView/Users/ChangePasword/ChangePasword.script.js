import axios from 'axios';
import { createApp } from 'vue';
import { useToast } from 'vue-toastification';
import App from '../../../../App.vue';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import { jwtDecode } from 'jwt-decode';


function getUserFromToken(token) {
  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.userName; 
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
}

const app = createApp(App);
const options = {
  position: 'top-right',
  timeout: 2000,
  closeOnClick: true,
  pauseOnHover: true,
};

app.use(Toast, options);
app.mount('#app');

export default {
  data() {
  return {
    isDropdownVisible: false,
    currentPassword: '',
    search:'',
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
    editIndex: null, 
    editableUser: {}, 
  };
},
  methods: {
    logOut() {
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      this.$router.push("/");
    },
    viewUsers() {
      this.$router.push("/table-user");
    },
    toggleDropdown() {
      this.isDropdownVisible = !this.isDropdownVisible;
    },  
    async changePassword() {
      const toast = useToast(); 
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          alert('Por favor, inicia sesión de nuevo.');
          return;
        }
       const user = getUserFromToken(token);
        const response = await axios.put(
          `http://localhost:3000/user/${user}`,
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
          toast.success("Contraseña actualizada correctamente");
          this.currentPassword = '';
          this.newPassword = '';
          this.isChangePasswordFormVisible = false;
        } else {
          toast.error("La contraseña actual no coincide");
        }
      } catch (error) {
        toast.error("Ocurrio un error al cambiar la contraseña");
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