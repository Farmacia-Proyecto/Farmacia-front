import { createApp } from 'vue';
import axios from 'axios';
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

export default {
  data() {
    return {
      email: '',
    };
  },
  methods: {
    async login() {
      const toast = useToast();
      try {
        const response = await axios.post('http://localhost:3000/api/recover-password', {
          email: this.email,
        });

        if (response.data.success) {
          toast.success('Se ha enviado un email para recuperar la contraseña');
        } else {
          toast.error('No se encontró un usuario con ese email');
        }
      } catch (error) {
        toast.error('Ocurrió un error al enviar el correo de recuperación');
        console.error(error);
      }
    },
  },
};
