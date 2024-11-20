import { createApp } from 'vue';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import App from '../../../../App.vue';
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

export default {
  data() {
    return {
      isDropdownVisible: false,
      isUserHeaderVisible: false,
      currentPassword: '',
      search: '',
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
  mounted() {
    this.fetchUsers();
  },
  methods: {
    created() {
      this.toast = useToast();
    },    
    logOut() {
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      this.$router.push("/");
    },
    toggleView() {
      this.$router.push("add-user");
    },
    reloadPage() {
      window.location.reload();  
    },
    viewLaboratory(){
      this.$router.push("view-laboratory");
    },
    toggleDropdown() {
      this.isDropdownVisible = !this.isDropdownVisible;
    },
    showChangePasswordForm() {
      this.$router.push("pasword");
    },
    viewStock(){
      this.$router.push("view-product");
    },
    async fetchUsers() {
      this.isUserHeaderVisible = true;
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          useToast().error("Token no encontrado. Por favor, inicia sesión de nuevo.");
          return;
        }
        const response = await axios.get('http://localhost:3000/person', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        });
        if (response.data && response.data.users) {
          this.users = response.data.users;
        } else {
          useToast().warning("No se encontraron usuarios.");
        }
      } catch (error) {
        useToast().error("Ocurrió un error al cargar los usuarios.");
      }
    },    
    getTokenFromCookies() {
      const cookieName = 'jwt=';
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find((cookie) => cookie.startsWith(cookieName));
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    },
    startEdit(user, index) {
      this.editIndex = index;
      this.editableUser = { ...user };
    },
    async confirmEdit(index) {
      const toast = useToast(); 
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          toast.error("Token no encontrado. Por favor, inicia sesión de nuevo.");
          return;
        }
    
        const updatedUser = {
          namePerson: this.editableUser.name,
          lastNamePerson: this.editableUser.lastName,
          email: this.editableUser.email,
          typeUser:this.editableUser.typeUser
        };
    
        const response = await axios.put(`http://localhost:3000/person/${this.editableUser.document}`, updatedUser, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
        if (response.data.success) {
          toast.success("Usuario actualizado exitosamente");
          this.users[index] = { ...this.editableUser };
          this.editIndex = null;
        } else {
          toast.error("No se pudo actualizar el usuario.");
        }
      } catch (error) {
        toast.error("Ocurrió un error al actualizar el usuario.");
      }
    },
    async activateUser(user) {
      this.changeUserStatus(user, true);
    },
    async deactivateUser(user) {
      this.changeUserStatus(user, false);
    },
    async changeUserStatus(user, newStatus) {
      const toast = useToast();
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          toast.error("Token no encontrado. Por favor, inicia sesión de nuevo.");
          return;
        }
    
        const response = await axios.patch(
          `http://localhost:3000/person/${user.document}`,
          { state: newStatus },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );
    
        if (response.data.success) {
          toast.success(`Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente.`);
          setTimeout(() => {
           this.reloadPage();
         }, 2000);  
        } else {
          toast.error("No se pudo cambiar el estado del usuario.");
        }
      } catch (error) {
        toast.error("Ocurrió un error al cambiar el estado del usuario.");
      }
    },
    async searchUsers() {
      const toast = useToast(); 
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          toast.error("Token no encontrado. Por favor, inicia sesión de nuevo.");
          return;
        }
        const response = await axios.post('http://localhost:3000/person/search', {
          namePerson: this.search,
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        });
        if (response.data && response.data.users) {
          this.users = response.data.users;
          toast.success("Búsqueda completada.");
        } else {
          this.users = [];
          toast.info("No se encontraron usuarios con ese criterio de búsqueda.");
        }
      } catch (error) {
        toast.error("Ocurrió un error al buscar los usuarios.");
      }
    },
  },
};
