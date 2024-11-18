import axios from 'axios';
import { createApp } from 'vue';
import { useToast } from 'vue-toastification';
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
      isModalVisible: false,
      search: '',
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
      documentError: '',
      nameError: '',
      lastNameError: '',
      phoneError: '',
    };
  },

  methods: {
    logOut() {
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      this.$router.push('/');
    },
    toggleDropdown() {
      this.isDropdownVisible = !this.isDropdownVisible;
    },
    viewUsers() {
      this.$router.push('table-user');
    },
    viewStock(){
      this.$router.push("view-product");
    },
    showChangePasswordForm() {
      this.$router.push('pasword');
    },
    validateDocument() {
      const docRegex = /^[0-9]{8,10}$/;
      if (!this.infoPerson.document) {
        this.documentError = 'Este campo es obligatorio.';
      } else if (!docRegex.test(this.infoPerson.document)) {
        this.documentError = 'El documento debe contener solo números y tener entre 8 y 10 dígitos.';
      } else {
        this.documentError = '';
      }
    },
    validateName() {
      const nameRegex = /^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/;
      this.nameError = !nameRegex.test(this.infoPerson.namePerson);
    },
    validateLastName() {
      const nameRegex = /^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/;
      this.lastNameError = !nameRegex.test(this.infoPerson.lastNamePerson);
    },
    validatePhone() {
      const phoneRegex = /^[0-9]+$/;
      if (!this.infoPerson.phone) {
        this.phoneError = 'Este campo es obligatorio.';
      } else if (!phoneRegex.test(this.infoPerson.phone)) {
        this.phoneError = 'El teléfono debe contener solo números.';
      } else {
        this.phoneError = '';
      }
    },
    showConfirmationModal() {
      this.isModalVisible = true;
    },

    confirmSubmission() {
      this.submitForm();
      this.isModalVisible = false;
    },
    cancelSubmission() {
      this.isModalVisible = false; 
    },

    async submitForm() {
      const toast = useToast(); 
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
        if(response.data.success){
          toast.success("Usuario agregado exitosamente");
          this.$router.push("table-user");
        }
       else {
        toast.error("El usuario ya existe.");
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
