import { createApp } from 'vue';
import { useToast } from 'vue-toastification';
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
    isDropdownVisible: false,
    isSearchBarVisible: false,
    isCodeEditable: false,
    products: [],
    newProduct: {
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
    toggleSearchBar() {
      this.isSearchBarVisible = !this.isSearchBarVisible;
      if (!this.isSearchBarVisible) {
        this.search = '';
      }
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
          this.products = response.data.products;
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
    getTokenFromCookies() {
      const cookieName = 'jwt=';
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find((cookie) => cookie.startsWith(cookieName));
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    },
  },
};