import { createApp } from 'vue';
import { useToast } from 'vue-toastification';
import { mapState, mapActions } from 'vuex';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
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
      isLotModalVisible: false,
      selectedProducts: [],
      order: [],
      orders: [],
      isOrderEditModalVisible: false, 
      selectedOrder: null, 
      temporaryState: null, 
      originalState:null,
      isNotificationsVisible: false,
      isProductsModalVisible: false,
      currentPage: 1, 
      pageSize: 5, 
      isDropdownVisible: false,
      isUserHeaderVisible: false,
      isLowStockModalVisible: false,
      productsAlert:[],
      lowStockProducts: [],
      search: '',
      editIndex: null,
    };
  },
  mounted() {
    if (this.$route.query.fromLowStockModal) {
        this.openLowStockModal();
        this.$router.replace({ path: this.$route.path });
      }
    this.fetchProducts();
    this.fetchOrders();
    this.fetchAlert();
    this.toast = useToast();
  },
  watch: {
    orders: {
      deep: true,
      handler(newOrders) {
        const orderWithInProgress = newOrders.find(order => order.state === "En progreso" && order !== this.selectedOrder);
        if (orderWithInProgress) {
          this.handleStateChange(orderWithInProgress);
        }
        const orderWithInSend = newOrders.find(order => order.state === "Recibida" && order !== this.selectedOrder);
        if (orderWithInProgress) {
          this.handleStateChange(orderWithInSend);
        }
      },
    },
  },
  computed: {
    ...mapState(['unreadNotifications']), 
    paginatedOrers() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.orders.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.orders.length / this.pageSize);
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
    generateOrder() {
      this.$store.dispatch('addLowStockProducts', this.lowStockProducts);
      this.$router.push({
        path: '/manager/view-orders',
        query: { fromLowStockModal: true }
      });
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
      openProductsModal(products) {
        this.selectedProducts = products; 
        this.isProductsModalVisible = true; 
      },
      closeProductsModal() {
        this.isProductsModalVisible = false;
        this.selectedProducts = []; 
      },
      closeLotModal(){
        this.isLotModalVisible = false;
        this.reloadPage();
      },
      viewReports(){
        this.$router.push("view-reports");
      },
      handleStateChange(order, index) {
        if (!order || !order.products) {
          console.error("La orden o los productos no están definidos:", order);
          return;
        }
      
        if (this.temporaryState === "En progreso") {
          this.selectedOrder = { 
            ...order, 
            products: order.products.map(product => ({
              ...product,
              newQuantity: product.quantity || 0,
              price: 0
            }))
          };
          this.editIndex = index;
          this.isOrderEditModalVisible = true;
        }
      
        if (this.temporaryState === "Recibida") {
          this.selectedOrder = { 
            ...order, 
            products: order.products.map(product => ({
              ...product,
              newQuantity: product.quantity || 0,
              price: 0
            }))
          };
          this.editIndex = index;
          this.isLotModalVisible = true;
        }
      },          
      removeProduct(index) {
        this.selectedOrder.products.splice(index, 1);
        if (this.selectedOrder.products.length === 0) {
          this.toast.warning("No quedan productos en la orden. Cambia el estado a 'Cancelada'.");
        }
      },
      saveLotChanges(){
        if (this.temporaryState==="Recibida") {
          const updatedProducts = this.selectedOrder.products.map(product => {
            return {
              nameProduct: product.nameProduct,
              laboratory: product.laboratory,
              quantity: product.newQuantity, 
              price: product.price, 
              codLot : product.lot,
              expirationDate: product.expirationDate
            };
          });
          const token = this.getTokenFromCookies();
          const userName = this.getUserFromToken(token);
          this.orders[this.editIndex] = {
            ...this.orders[this.editIndex],
            state: "Recibida",
            products: updatedProducts,
            userName: userName
          };
      
          this.isLotModalVisible = false;
          this.addLotProduct(this.orders[this.editIndex]);
        }
      },
      async addLotProduct(order) {
        try {
          const token = this.getTokenFromCookies();
          console.log(order)
          const response = await axios.put(`http://localhost:3000/purchaseorder/receive/${order.codOrder}`, order, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.data.success) {
            this.toast.success("Estado de la orden actualizado con éxito.");
            this.isLotModalVisible = false;
          } else {
            this.toast.error("Error al actualizar el estado de la orden.");
            this.isLotModalVisible = false;
          }
        } catch (error) {
          console.error("Error al enviar la actualización del estado:", error);
          this.toast.error("Ocurrió un error al actualizar el estado.");
        }
      },
      saveOrderChanges() {
        if (this.temporaryState==="En progreso") {
          const allPricesValid = this.selectedOrder.products.every(
            product => product.price > 0 && product.newQuantity > 0
          );
          if (!allPricesValid) {
            this.toast.error("Todos los productos deben tener precio y cantidad válidos.");
            return;
          }
          const updatedProducts = this.selectedOrder.products.map(product => {
            return {
              nameProduct: product.nameProduct,
              laboratory: product.laboratory,
              quantity: product.newQuantity, 
              price: product.price 
            };
          });
      
          this.orders[this.editIndex] = {
            ...this.orders[this.editIndex],
            state: "En progreso",
            products: updatedProducts
          };
      
          this.isOrderEditModalVisible = false;
          this.updateOrder(this.orders[this.editIndex]);
        } else {
          this.orders[this.editIndex].state = this.editableOrder.state;
          this.isOrderEditModalVisible = false;
          this.updateOrder(this.orders[this.editIndex]);
        }
      },                
      async updateOrder(order) {
        try {
          const token = this.getTokenFromCookies();
          const response = await axios.put(`http://localhost:3000/purchaseorder/inProgrees/${order.codOrder}`, order, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.data.success) {
            this.toast.success("Estado de la orden actualizado con éxito.");
            this.isOrderEditModalVisible = false;
          } else {
            this.toast.error("Error al actualizar el estado de la orden.");
            this.isOrderEditModalVisible = false;
          }
        } catch (error) {
          console.error("Error al enviar la actualización del estado:", error);
          this.toast.error("Ocurrió un error al actualizar el estado.");
        }
      },
      closeOrderEditModal() {
        if (this.editableOrder && this.editableOrder.state) {
          this.isOrderEditModalVisible = false;
        } else {
          console.error("No se puede acceder al estado de la orden, datos no definidos.");
          this.isOrderEditModalVisible = false;
        }
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
    created() {
      this.toast = useToast();
    },    
    logOut() {
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      this.$router.push("/");
    },
    reloadPage() {
      window.location.reload();  
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
      this.$router.push("sell");
    },
    viewOrders(){
      this.$router.push("view-orders");
    },
    async fetchProducts() {
        try {
          const token = this.getTokenFromCookies();
          if (!token) {
            this.toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
            return;
          }
      
          const response = await axios.get('http://localhost:3000/purchaseorder/acceptOrder', {
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
          const userName = this.getUserFromToken(token);
          console.log(userName);
          if (this.order.length === 0) {
            this.toast.error("Debe agregar productos a la orden antes de crearla.");
            return;
          }
          const orders = this.order.map(product => ({
            nameProduct: product.nameProduct,
            nameSupplier: product.nameSupplier,
            laboratory: product.laboratory,
            quantity: product.quantity,
            state: "Enviada", 
            dateRegister: new Date().toISOString(),
            userName: userName,
          }));
          console.log("Datos enviados:", orders);
      
          const response = await axios.post(
            "http://localhost:3000/purchaseorder",
            orders , 
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
      async fetchOrders() {
        try {
          const token = this.getTokenFromCookies();
          const response = await axios.get('http://localhost:3000/purchaseorder', {
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
        this.originalState = order.state;  
      },
      getUserFromToken(token) {
        try {
          const decodedToken = jwtDecode(token);
          return decodedToken.userName;
        } catch (error) {
          console.error('Error al decodificar el token:', error);
          return null;
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
