import axios from 'axios';
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
    logOut() {
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      this.$router.push("/");
    },
    toggleView() {
      this.$router.push("/add-user");
    },
    toggleDropdown() {
      this.isDropdownVisible = !this.isDropdownVisible;
    },
    showChangePasswordForm() {
      this.$router.push("/pasword-admin");
    },
    async fetchUsers() {
      this.isUserHeaderVisible = true;
      this.isUserHeaderVisible=true;
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          alert('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }
        const response = await axios.get('http://localhost:3000/person', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        });
        console.log(response)
        if (response.data && response.data.users) {
          this.users = response.data.users; 
        } else {
          alert('No se encontraron usuarios.');
        }
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        alert('Ocurrió un error al cargar los usuarios.');
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
      try {
        const token = this.getTokenFromCookies();

        if (!token) {
          alert('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }

        const updatedUser = {
          namePerson: this.editableUser.name,
          lastNamePerson: this.editableUser.lastName,
          email: this.editableUser.email,
        };
        const response = await axios.put(`http://localhost:3000/person/${this.editableUser.document}`, updatedUser, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
      if (!response.data.success) {
        alert('Usuario actualizado exitosamente.');
          this.users[index] = { ...this.editableUser };
         this.editIndex = null; 
        } else {
          alert('No se pudo actualizar el usuario.');
       }
      } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        alert('Ocurrió un error al actualizar el usuario.');
      }
    },
    async activateUser(user) {
      this.changeUserStatus(user,true)
  },

  async deactivateUser(user) {
    this.changeUserStatus(user,false)
  },

  async changeUserStatus(user,newStatus) {
    try {
      const token = this.getTokenFromCookies();

      if (!token) {
        alert('Token no encontrado. Por favor, inicia sesión de nuevo.');
        return;
      }
      console.log(user.document)
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
      if (!response.data.success) {
        alert(`Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente.`);
        this.fetchUsers();
      } else {
        alert('No se pudo cambiar el estado del usuario.');
      }
    } catch (error) {
      console.error('Error al cambiar el estado del usuario:', error);
      alert('Ocurrió un error al cambiar el estado del usuario.');
    }
  },
  async searchUsers() {
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          alert('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }
        const response = await axios.post('http://localhost:3000/person/search', {
          namePerson:this.search,
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        });
        console.log(response.data)
        if (response.data && response.data.users) {
          this.users = response.data.users;
        } else {
          this.users = [];
          alert('No se encontraron usuarios con ese criterio de búsqueda.');
        }
      } catch (error) {
        console.error('Error en la búsqueda de usuarios:', error);
        alert('Ocurrió un error al buscar los usuarios.');
      }
    },
  },
};