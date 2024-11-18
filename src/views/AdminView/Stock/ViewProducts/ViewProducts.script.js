import { createApp } from 'vue';
import { useToast } from 'vue-toastification';
import App from '../../../../App.vue';
import Toast from 'vue-toastification';
import axios from 'axios';
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
      isSearchBarVisible: false,
      isDropdownVisible:false,
      products: [],
      search: '',
      itemsPerPage: 10,
      isLoading: false,
      currentPage: 1,
      isAddProductModalVisible: false,
      isEditProductModalVisible: false,
      newProduct: {
        code: '',
        name: '',
        lot: '',
        quantity: '',
        unit: 'cajas',
        price: '',
      },
      isAddLotModalVisible: false,
      selectedProduct: null,
      newLot: {
        lot: '',
        quantity: '',
        price: '',
      },
      defaultImageUrl: 'https://example.com/default-image.jpg', 
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
    viewUsers() {
      this.$router.push("table-user");
    },
    getProductImage(product) {
      return product.image ? product.image : this.defaultImageUrl;
    },
    toggleSearchBar() {
      this.isSearchBarVisible = !this.isSearchBarVisible;
      if (!this.isSearchBarVisible) {
        this.search = '';
      }
    },
    showChangePasswordForm(){
      this.$router.push("pasword")
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
    openAddLotModal(product) {
      this.selectedProduct = product;
      this.newLot = { lot: '', quantity: '', price: '' };
      this.isAddLotModalVisible = true;
    },
    closeAddLotModal() {
      this.isAddLotModalVisible = false;
    },
    closeEditProductModal() {
      this.isEditProductModalVisible = false;
    },
    editProduct(product) {
      this.selectedProduct = { ...product }; 
      this.isEditProductModalVisible = true;
    },
    async addProductLot() {
      if (!this.selectedProduct) return;

      this.selectedProduct.quantity += parseInt(this.newLot.quantity, 10);

      const productToUpdate = {
        ...this.selectedProduct,
        newLot: this.newLot,
        addedDate: new Date().toISOString(), 
      };

      try {
        await axios.put(`/api/products/${this.selectedProduct.id}/add-lot`, productToUpdate);
        this.toast.success('Lote agregado exitosamente.');
        this.closeAddLotModal();
      } catch (error) {
        this.toast.error('Error al agregar el lote al producto.');
        console.error('Error al actualizar el producto:', error);
      }
    },
    async updateProduct() {
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          this.toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }
        await axios.put(`http://localhost:3000/products/${this.selectedProduct.id}`, this.selectedProduct, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        this.toast.success('Producto actualizado exitosamente.');
        this.fetchProducts();
        this.isEditProductModalVisible = false;
      } catch (error) {
        this.toast.error('Ocurrió un error al actualizar el producto.');
        console.error(error);
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

        this.products = response.data;
        this.toast.success('Productos cargados correctamente.');
      } catch (error) {
        this.toast.error('Error al obtener productos del servidor.');
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    showAddProductModal() {
      this.isAddProductModalVisible = true;
    },
    closeAddProductModal() {
      this.isAddProductModalVisible = false;
      this.resetNewProduct();
    },
    resetNewProduct() {
      this.newProduct = {
        code: '',
        name: '',
        lot: '',
        quantity: '',
        price: '',
      };
    },
    async addProduct() {
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          this.toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }
        const productWithDate = {
          ...this.newProduct,
          addedDate: new Date().toISOString(), 
        };
    
        await axios.post('http://localhost:3000/products', productWithDate, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        this.toast.success('Producto agregado exitosamente.');
        this.fetchProducts();
        this.closeAddProductModal();
      } catch (error) {
        this.toast.error('Ocurrió un error al agregar el producto.');
        console.error(error);
      }
    },
    
    formatExpirationDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const expirationDate = new Date(date);
      return expirationDate.toLocaleDateString('es-ES', options);
    },
    async searchProduct() {
      this.isLoading = true;
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          this.toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
          this.isLoading = false;
          return;
        }

        const response = await axios.get('http://localhost:3000/products', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search: this.search,
          },
        });

        if (response.data.length > 0) {
          this.products = response.data;
          this.toast.success("Búsqueda completada.");
        } else {
          this.products = [];
          this.toast.info("No se encontraron productos con ese criterio de búsqueda.");
        }
      } catch (error) {
        this.toast.error('Error al realizar la búsqueda en el servidor.');
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
    goToPage(page) {
      this.currentPage = page;
    },
    getTokenFromCookies() {
      const cookieName = 'jwt=';
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find((cookie) => cookie.startsWith(cookieName));
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    },
  },
};
