
import axios from 'axios';
import Swal from 'sweetalert2';


export default {
  data() {
    return {
      email: '',
    };
  },
  methods: {
    async login() {
      try {
        const response = await axios.post('http://localhost:3000/person/recover-password', {
          userName: this.email,
        });
        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Correo enviado exitosamente',
            text: `Se ha enviado un email para recuperar la contraseña a: ${response.data.email}`,
            confirmButtonText: 'Aceptar'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se encontró un usuario con ese email',
            confirmButtonText: 'Aceptar'
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al enviar el correo de recuperación',
          confirmButtonText: 'Aceptar'
        });
        console.error(error);
      }
    },
  },
};
