import { createApp } from 'vue';
import { useToast } from 'vue-toastification';
import { mapState, mapActions } from 'vuex';
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
      notifications: [], 
      isNotificationsVisible: false,
      currentPage: 1, 
      pageSize: 6, 
      isDropdownVisible: false,
      isUserHeaderVisible: false,
      isModalVisible: false,
      isLowStockModalVisible: false,
      productsAlert:[],
      lowStockProducts: [],
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
    this.fetchAlert();
  },
  computed: {
    ...mapState(['unreadNotifications']), 
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.users.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.users.length / this.pageSize);
    },
    pageNumbers() {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    },
  },
  methods: {
    ...mapActions(['addNotification', 'removeNotification']),
    toggleNotifications() {
      this.isNotificationsVisible = !this.isNotificationsVisible;
    },
    viewNotification(index) {
      this.lowStockProducts = this.productsAlert;
      console.log(this.lowStockProducts)
      this.isLowStockModalVisible = true;
      this.removeNotification(index);
      this.toggleNotifications();
    },
    closeLowStockModal() {
      this.isLowStockModalVisible = false;
    },
    generateOrder() {
      this.$store.dispatch('addLowStockProducts', this.lowStockProducts);
      this.$router.push({
        path: '/admin/view-orders',
        query: { fromLowStockModal: true }
      });
    },
    async fetchAlert() {
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          this.toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }
    
        const response = await axios.get('http://localhost:3000/purchaseorder/alert', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          this.productsAlert = response.data.products.map(product => ({
            ...product,  
            alertId: `alert-${product.codProduct}-${Date.now()}`
          }));
             this.addNotification({
              message: `Tiene productos bajos en stock`,  
            });
        }
      } catch (error) {
        console.error('Error en fetchAlerts:', error);
      }
    },  
    ignoreNotification(index) {
      this.removeNotification(index);
    },
    addNotification(notification) {
      if(this.unreadNotifications.length==0){
        this.notifications.push(notification);
        this.unreadNotifications.push(notification);
        this.toast.info(notification.message); 
        }
    },
    dismissNotification(index) {
      this.notifications.splice(index, 1);
    },
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
    viewOrders(){
      this.$router.push("view-orders");
    },
    viewReports(){
      this.$router.push("view-reports");
    },
    openAddUserModal() {
      this.isModalVisible = true;
    },
    closeAddUserModal() {
      this.isModalVisible = false;
      this.resetForm();
    },
    resetForm() {
      this.infoPerson = {
        typeDocument: '',
        document: '',
        namePerson: '',
        lastNamePerson: '',
        typeUser: '',
        phone: '',
        email: '',
      };
    },
    async addNewUser() {
      const toast = useToast();
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          toast.error("Token no encontrado. Por favor, inicia sesión de nuevo.");
          return;
        }
        if (
          !this.infoPerson.typeDocument ||
          !this.infoPerson.document ||
          !this.infoPerson.namePerson ||
          !this.infoPerson.lastNamePerson ||
          !this.infoPerson.typeUser ||
          !this.infoPerson.phone ||
          !this.infoPerson.email
        ) {
          toast.error("Por favor, completa todos los campos antes de agregar un usuario.");
          return;
        }
        const response = await axios.post("http://localhost:3000/person", this.infoPerson, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        if (response.data.success) {
          toast.success("Usuario agregado exitosamente");
          this.fetchUsers(); 
          this.closeAddUserModal();
        } else {
          toast.error("No se pudo agregar el usuario.");
        }
      } catch (error) {
        toast.error("Ocurrió un error al agregar el usuario.");
      }
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
    viewSell(){
      this.$router.push("/admin");
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
