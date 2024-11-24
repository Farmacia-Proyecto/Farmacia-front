import { createApp } from 'vue';
import { useToast } from 'vue-toastification';
import { jwtDecode } from 'jwt-decode';
import App from '../../../App.vue';
import Toast from 'vue-toastification';
import axios from 'axios';
import 'vue-toastification/dist/index.css';

const app = createApp(App);
const options = {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
};

app.use(Toast, options);
app.mount('#app');

export default {
  data() {
  return {
    isCartVisible: false,
    isCheckoutModalVisible:false,
    cart: [], 
    isDropdownVisible: false,
    isSearchBarVisible: false,
    isCodeEditable: false,
    checkoutData: {
      clientDocument: '',
      paymentType: 'efectivo',
      date: new Date().toISOString().split("T")[0],
    },
    ivaRate: 19, 
    products: [],
    newProduct: {
      quantity: 1,
      image: 'https://via.placeholder.com/150'
    },
    search: '',
    itemsPerPage: 10,
    currentPage: 1,
  };
},
computed: {
  paginatedProducts() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.products.slice(startIndex, endIndex);
  },
  totalPages() {
    return Math.ceil(this.products.length / this.itemsPerPage);
  },
  cartTotal() {
    return this.cart.reduce((total, item) => total + item.selectedQuantity * item.priceSell, 0);
  },
  iva() {
    return (this.cartTotal * this.ivaRate) / 100;
  },
  total() {
    return this.cartTotal + this.iva;
  },
},
mounted() {
  this.fetchProducts();
  this.toast = useToast();
},
  methods: {
    logOut() {
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      this.$router.push("/");
    },
    toggleView() {
      this.$router.push("admin/add-user");
    },
    toggleDropdown() {
      this.isDropdownVisible = !this.isDropdownVisible;
    },
    viewLaboratory(){
      this.$router.push("admin/view-laboratory");
    },
    viewStock(){
      this.$router.push("admin/view-product");
    },
    showChangePasswordForm() {
      this.$router.push("admin/pasword");
    },
    viewUsers(){
      this.$router.push("admin/table-user");
    },
    showCheckoutModal() {
      this.isCheckoutModalVisible = true;
      this.isCartVisible = false;
    },
    closeCheckoutModal() {
      this.isCheckoutModalVisible = false;
    },
    toggleSearchBar() {
      this.isSearchBarVisible = !this.isSearchBarVisible;
      if (!this.isSearchBarVisible) {
        this.search = '';
      }
    },
    setDefaultQuantity(index) {
      const product = this.products[index];
      if (product.selectedQuantity <= 0 || product.selectedQuantity === '') {
        product.selectedQuantity = 1;  
      }
    },
    toggleCart() {
      this.isCartVisible = !this.isCartVisible;
    },
    addProductToCart(product) {
    const existingProductIndex = this.cart.findIndex((item) => item.codProduct === product.codProduct);

    if (existingProductIndex !== -1) {  
      this.cart[existingProductIndex].selectedQuantity += product.selectedQuantity;
    } else {
      this.cart.push({ ...product });
    }

  this.toast.success(`${product.nameProduct} añadido al carrito`);
    },
    removeFromCart(product) {
      this.cart = this.cart.filter((item) => item.codProduct !== product.codProduct);
      this.toast.info(`Eliminado ${product.nameProduct} del carrito.`);
    },
    async fetchProducts() {
      this.isLoading = true;
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          this.toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }
    
        const response = await axios.get('http://localhost:3000/products', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (response.data.products && response.data.products.length > 0) {
          this.products = response.data.products.map(product => ({
            ...product,
            selectedQuantity: 1,  
          }));
        } else {
          this.toast.info('No se encontraron productos. Mostrando productos de ejemplo.');
        }
      } catch (error) {
        this.toast.error('Error al obtener productos del servidor. Mostrando productos de ejemplo.');
        console.error('Error en fetchProducts:', error);
      } finally {
        this.isLoading = false;
      }
    },  
    async acceptPurchase() {
      try {
        const token = this.getTokenFromCookies();
        const userName = this.getUserFromToken(token);
        const invoiceData = {
          dateInvoice: this.checkoutData.date,
          documentClient: this.checkoutData.clientDocument,
          typePay: this.checkoutData.paymentType,
          subTotal: this.cartTotal,
          iva: this.iva,
          totalPay: this.total,
          products: this.cart.map((item) => ({
            codProduct: item.codProduct,
            quantity: item.selectedQuantity,
            totalPrice: item.selectedQuantity * item.priceSell,
          })),
          userName,
        };
        const response = await axios.post("http://localhost:3000/invoices", invoiceData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.data.success) {
          this.toast.success("Compra realizada exitosamente.");
          this.cart = []; 
          this.closeCheckoutModal(); 
        } else {
          this.toast.error("Hubo un problema al procesar la compra.");
        }
      } catch (error) {
        this.toast.error("Error al enviar los datos al servidor.");
        console.error("Error en acceptPurchase:", error);
      }
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