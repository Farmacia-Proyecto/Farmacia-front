import { useRoute } from 'vue-router';
import { createApp } from 'vue';
import { useToast } from 'vue-toastification';
import App from '../../App.vue';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import axios from 'axios';

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
  setup() {
    const route = useRoute();
    const userName = route.params.userName;
    return {
      userName,
      newPassword: '',
      confirmPassword: ''
    };
  },
  methods: {
    async updatePassword() {
      const toast = useToast();
      if (this.newPassword!== this.confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        return;
      }
      const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
      if (!passwordRegex.test(this.newPassword)) {
        toast.error('La contraseña debe tener al menos 8 caracteres y una letra mayúscula');
        return;
      }
      try {
        await axios.patch('http://localhost:3000/user/recovery', {
          userName: this.userName,
          newPassword: this.newPassword
        });
        toast.success('Contraseña restablecida correctamente');
        this.$router.push('/');
      } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        toast.error('Hubo un problema al restablecer la contraseña');
      }
    }
  }
};
