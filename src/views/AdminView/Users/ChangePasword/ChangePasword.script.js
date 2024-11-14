import axios from 'axios';
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
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          alert('Por favor, inicia sesión de nuevo.');
          return;
        }
        const response = await axios.post(
          'http://localhost:3000/api/users/change-password',
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
          alert('Contraseña actualizada exitosamente.');
          this.currentPassword = '';
          this.newPassword = '';
          this.isChangePasswordFormVisible = false;
        } else {
          alert('Error al actualizar la contraseña.');
        }
      } catch (error) {
        console.error('Error al cambiar la contraseña:', error);
        alert('Ocurrió un error al cambiar la contraseña.');
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