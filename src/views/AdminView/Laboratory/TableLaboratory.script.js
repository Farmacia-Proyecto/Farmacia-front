import { createApp } from 'vue';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import App from '../../../App.vue';
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
      isAddLaboratoryModalVisible: false,
      search: '',
      newLaboratory: {
        nit: '',
        name: '',
        email: '',
        phone: '',
      },
      laboratory: [],
      editIndex: null,
      editableLaboratory: {},
    };
  },
  mounted() {
    this.fetchLaboratory();
  },
  methods: {
    created() {
      this.toast = useToast();
    },    
    logOut() {
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      this.$router.push("/");
    },
    viewUsers(){
      this.$router.push("table-user")
    },
    reloadPage() {
      window.location.reload();  
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
    openAddLaboratoryModal() {
      this.isAddLaboratoryModalVisible = true;
    },
    closeAddLaboratoryModal() {
      this.isAddLaboratoryModalVisible = false;
      this.resetNewLaboratory();
    },
    resetNewLaboratory() {
      this.newLaboratory = { nit: '', name: '', email: '', phone: '' };
    },
    async submitLaboratory() {
      const toast = useToast();
      const token = this.getTokenFromCookies();
    
      if (!token) {
        toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
        return;
      }
      try {
        const response = await axios.post(
          'http://localhost:3000/laboratory',
          this.newLaboratory,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
    
        if (response.data.success) {
          toast.success('Laboratorio agregado exitosamente');
          this.closeAddLaboratoryModal(); 
          this.fetchLaboratory(); 
        } else {
          toast.error('El laboratorio ya existe.');
        }
      } catch (error) {
        if (error.response) {
          toast.error(`Error: ${error.response.data.message}`);
        } else {
          toast.error('Error al conectar con el servidor.');
          console.error(error);
        }
      }
    },
    async fetchLaboratory() {
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
        if (response.data && response.data.laboratory) {
          this.laboratory = response.data.laboratory;
        } else {
          useToast().warning("No se encontraron laboratorios.");
        }
      } catch (error) {
        useToast().error("Ocurrió un error al cargar los laboratorios.");
      }
    },    
    getTokenFromCookies() {
      const cookieName = 'jwt=';
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find((cookie) => cookie.startsWith(cookieName));
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    },
    startEdit(laboratory, index) {
      this.editIndex = index;
      this.editableLaboratory = { ...laboratory };
    },
    async confirmEdit(index) {
      const toast = useToast(); 
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          toast.error("Token no encontrado. Por favor, inicia sesión de nuevo.");
          return;
        }
    
        const updatedLaboratory = {
          nameLaboratory: this.editableLaboratory.nameLaboratory,
          phoneLaboratory: this.editableLaboratory.phoneLaboratory,
          emailLaboratory: this.editableLaboratory.emailLaboratory,
        };
    
        const response = await axios.put(`http://localhost:3000/person/${this.editableLaboratory.nit}`, updatedLaboratory, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
        if (response.data.success) {
          toast.success("Laboratorio actualizado exitosamente");
          this.laboratory[index] = { ...this.editableLaboratory };
          this.editIndex = null;
        } else {
          toast.error("No se pudo actualizar el usuario.");
        }
      } catch (error) {
        toast.error("Ocurrió un error al actualizar el usuario.");
      }
    },
    async searchLaboratory() {
      const toast = useToast(); 
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          toast.error("Token no encontrado. Por favor, inicia sesión de nuevo.");
          return;
        }
        const response = await axios.post('http://localhost:3000/person/search', {
          nameLaboratory: this.search,
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        });
        if (response.data && response.data.laboratory) {
          this.laboratory = response.data.laboratory;
          toast.success("Búsqueda completada.");
        } else {
          this.users = [];
          toast.info("No se encontraron laboratorios con ese criterio de búsqueda.");
        }
      } catch (error) {
        toast.error("Ocurrió un error al buscar los laboratorios.");
      }
    },
  },
};
