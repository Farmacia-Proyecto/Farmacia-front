import { createApp } from 'vue';
import { useToast } from 'vue-toastification';
import { mapState, mapActions } from 'vuex';
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
      notifications: [], 
      isOrderModalVisible: false,
      selectedProducts: [],
      order: [],
      isNotificationsVisible: false,
      currentPage: 1, 
      pageSize: 6, 
      isDropdownVisible: false,
      isUserHeaderVisible: false,
      isLowStockModalVisible: false,
      productsAlert:[],
      lowStockProducts: [],
      search: '',
      users: [],
      editIndex: null,
      editableUser: {},
    };
  },
  mounted() {
    console.log("Query al montar:", this.$route.query);
    if (this.$route.query.fromLowStockModal) {
        this.openLowStockModal();
        this.$router.replace({ path: this.$route.path });
      }
    this.fetchProducts();
    this.fetchOrders();
    this.fetchAlert();
    this.toast = useToast();
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
    openLowStockModal() {
        const products = this.$store.getters.lowStockProducts;
        if (products.length > 0) {
          this.isOrderModalVisible = true;
        }
    },
    closeOrderModal() {
        this.isOrderModalVisible = false;
        this.selectedProducts = [];
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
      this.notifications.push(notification);
      this.unreadNotifications.push(notification);
      this.toast.info(notification.message); 
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
    async fetchProducts() {
        try {
          const token = this.getTokenFromCookies();
          if (!token) {
            this.toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
            return;
          }
      
          const response = await axios.get('http://localhost:3000/products/acceptOrder', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.data.success) {
            this.selectedProducts=response.data.products;
          } 
        } catch (error) {
          console.error('Error en fetchProdcuts:', error);
        }
      }, 
    isProductInOrder(product) {
        return this.order.some(item => item.codProduct === product.codProduct);
      },
      toggleOrder(product) {
        if (product.addedToOrder) {
          this.order = this.order.filter(item => item.nameProduct !== product.nameProduct);
        } else {
          if (product.selectedSupplier && product.newQuantity > 0) {
            this.order.push({
              nameProduct: product.nameProduct,
              nameSupplier: product.selectedSupplier,
              laboratory: product.laboratory,
              quantity: product.newQuantity,
            });
            console.log(this.order)
          } else {
            this.toast.error('Debe seleccionar un proveedor y cantidad para agregar el producto.');
            return;
          }
        }
        product.addedToOrder = !product.addedToOrder;
      },           
      async sendOrder() {
        try {
          const token = this.getTokenFromCookies();
    
          if (this.order.length === 0) {
            this.toast.error("Debe agregar productos a la orden antes de crearla.");
            return;
          }
      
          // Preparar datos para enviar al backend
          const orders = this.order.map(product => ({
            nameProduct: product.nameProduct,
            nameSupplier: product.nameSupplier,
            laboratory: product.laboratory,
            quantity: product.quantity,
            state: "Enviada", // Estado inicial por defecto
            dateRegister: new Date().toISOString(), // Fecha actual
          }));
      
          // Mostrar datos que se enviarán en consola (para debug)
          console.log("Datos enviados:", { orders });
      
          // Enviar solicitud al backend
          const response = await axios.post(
            "http://localhost:3000/purchaseorder",
             orders , // Encapsular en un objeto
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );   
          if (response.data.success) {
            this.closeOrderModal();
            this.toast.success("Órdenes enviadas con éxito.");
          } else {
            this.toast.error("Orden no enviada. Verifique los datos.");
          }
        } catch (error) {
          console.error("Error al enviar las órdenes:", error);
          this.toast.error("Ocurrió un error al enviar las órdenes.");
        }
      },              
    async fetchAlert() {
        try {
          const token = this.getTokenFromCookies();
          if (!token) {
            this.toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
            return;
          }
      
          const response = await axios.get('http://localhost:3000/products/alert', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.data.success) {
            this.productsAlert = response.data.products.map(product => ({
              ...product,  
            }));
          } 
        } catch (error) {
          console.error('Error en fetchAlerts:', error);
        }
      },  
      async fetchOrders() {
        try {
          const token = this.getTokenFromCookies();
          const response = await axios.get('http://localhost:3000/orders', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          this.orders = response.data.orders;
        } catch (error) {
          console.error('Error al cargar órdenes:', error);
        }
      },
      startEdit(order, index) {
        this.editIndex = index;
        this.editableOrder = { ...order }; 
      },
      async confirmEdit(index) {
        try {
          const token = this.getTokenFromCookies();
          await axios.put(`http://localhost:3000/orders/${this.orders[index].codOrder}`, {
            state: this.editableOrder.state,
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          this.orders[index].state = this.editableOrder.state; 
          this.editIndex = null; 
        } catch (error) {
          console.error('Error al actualizar la orden:', error);
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
