import axios from 'axios';
import { createApp } from 'vue';
import { useToast } from 'vue-toastification';
import { mapState, mapActions } from 'vuex';
import App from '../../../App.vue';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import { jwtDecode } from 'jwt-decode';

function getUserFromToken(token) {
  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.userName; 
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
}

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
      currentPassword: '',
      notifications: [], 
      isNotificationsVisible: false,
      isLowStockModalVisible: false,
      newPassword: '',
      users: [],
    };
  },
  computed: {
    ...mapState(['unreadNotifications']), 
  },
  mounted(){
    this.fetchAlert();
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
    logOut() {
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      this.$router.push("/");
    },
    viewOrders(){
      this.$router.push("view-orders");
    },
    viewReports(){
      this.$router.push("view-reports");
    },
    generateOrder() {
      this.$store.dispatch('addLowStockProducts', this.lowStockProducts);
      this.$router.push({
        path: 'manager/view-orders',
        query: { fromLowStockModal: true }
      });
    },
    viewSells(){
      this.$router.push("sell");
    },
    viewStock(){
      this.$router.push("view-product");
    },
    toggleDropdown() {
      this.isDropdownVisible = !this.isDropdownVisible;
    },  
    async changePassword() {
      const toast = useToast(); 
      
      if (this.newPassword.length < 8 || !/[A-Z]/.test(this.newPassword)) {
        toast.error("La nueva contraseña debe tener al menos 8 caracteres y una letra mayúscula.");
        return;
      }

      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          toast.error('Por favor, inicia sesión de nuevo.');
          return;
        }
        
        const user = getUserFromToken(token);
        const response = await axios.put(
          `http://localhost:3000/user`,
          {
            currentPassword: this.currentPassword,
            newPassword: this.newPassword,
            userName: user
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );

        if (response.data.success) {
          toast.success("Contraseña actualizada correctamente");
            this.logOut(); 
        } else {
          toast.error("La contraseña actual no coincide");
        }
      } catch (error) {
        toast.error("Ocurrió un error al cambiar la contraseña");
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
