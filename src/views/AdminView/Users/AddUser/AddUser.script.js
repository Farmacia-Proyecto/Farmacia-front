import axios from 'axios';
export default {
  data() {
  return {
    isDropdownVisible: false,
    isUserHeaderVisible: false, 
    search:'',
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
  };
},


  methods: {
    logOut() {
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      this.$router.push("/");
    },
    toggleDropdown() {
      this.isDropdownVisible = !this.isDropdownVisible;
    },
    viewUsers(){
      this.$router.push("table-user");
    },
  showChangePasswordForm(){
    this.$router.push("pasword-admin");
  },
    async submitForm() {
      try {
        const token = this.getTokenFromCookies();

        if (!token) {
          alert('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }
        await axios.post(
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
        alert('Usuario guardado exitosamente');
      } catch (error) {
        console.error('Error al enviar los datos:', error);
        alert('Ocurrió un error al guardar el usuario.');
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