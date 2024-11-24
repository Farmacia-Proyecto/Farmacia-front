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
      isSearchBarVisible: false,
      isDropdownVisible:false,
      isCodeEditable: true,
      isSelectingSuggestion: false,
      products: [],
      search: '',
      itemsPerPage: 10,
      isLoading: false,
      currentPage: 1,
      currentStep: 1,
      totalSteps: 3,
      isAddProductModalVisible: false,
      isEditProductModalVisible: false,
      isLotDetailsModalVisible: false,
      isProductDetailsModalVisible:false,
      newProduct: {
        codProduct: '',
        nameProduct: '',
        describeProduct: '',
        expirationDate: '',
        codLot: '', 
        quantity: 0,
        priceSell: 0.0,
        priceBuy: 0.0, 
        laboratory: '', 
        image: 'https://via.placeholder.com/150'
      },
      isAddLotModalVisible: false,
      selectedProduct: null,
      laboratory: [],  
      suggestions: [], 
      filteredSuggestions: [], 
      Lot: [],
      highlightedIndex: -1, 
      defaultImageUrl: 'https://via.placeholder.com/150', 
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
  watch: {
    'newProduct.laboratory': function () {
      this.checkProductAndLaboratory();
    },
    'newProduct.nameProduct': function () {
      this.checkProductAndLaboratory();
    },
  },
  mounted() {
    this.fetchLaboratories();
    this.fetchProducts();
    this.toast = useToast();
  },
  methods: {
    checkProductAndLaboratory() {
      const hasMatch = this.products.some(
        (product) =>
          product.nameProduct === this.newProduct.nameProduct &&
          product.laboratory === this.newProduct.laboratory
      );
  
      if (hasMatch) {
        this.toast.info(
          'Este producto ya existe con el mismo nombre y laboratorio. Edición bloqueada.'
        );
        this.isCodeEditable = false;
      } else {
        this.isCodeEditable = true;
      }
    },
    hideSuggestions() {
      this.filteredSuggestions = [];
      this.highlightedIndex = -1;
    },
    onBlur() {
      setTimeout(() => {
        if (!this.isSelectingSuggestion) {
          this.hideSuggestions();
        }
        this.isSelectingSuggestion = false;
      }, 2000);
    },
    fetchSuggestions() {
      const query = this.newProduct.nameProduct.trim().toLowerCase(); 
      if (!query) {
        this.filteredSuggestions = [];
        return;
      }

      this.filteredSuggestions = this.products
        .filter((product) =>
          product.nameProduct && product.nameProduct.toLowerCase().includes(query)
        )
        .map((product) => product.nameProduct); 
      
      this.highlightedIndex = -1; 
      console.log('Sugerencias filtradas:', this.filteredSuggestions); 
    },  
    selectSuggestion(nameProduct) {
      const selectedProduct = this.products.find(
        (product) => product.nameProduct === nameProduct
      );
    
      if (selectedProduct) {
        this.newProduct.nameProduct = selectedProduct.nameProduct;
        this.newProduct.describeProduct = selectedProduct.describeProduct;
        this.newProduct.codProduct = selectedProduct.codProduct;
        this.newProduct.laboratory = selectedProduct.laboratory;
        this.isCodeEditable = false;
      }
    
      this.filteredSuggestions = [];
    },
    highlightNext() {
      if (this.highlightedIndex < this.filteredSuggestions.length - 1) {
        this.highlightedIndex++;
      } else {
        this.highlightedIndex = 0; 
      }
    },
    highlightPrev() {
      if (this.highlightedIndex > 0) {
        this.highlightedIndex--;
      } else {
        this.highlightedIndex = this.filteredSuggestions.length - 1; 
      }
    },
    selectHighlightedSuggestion() {
      if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredSuggestions.length) {
        this.selectSuggestion(this.filteredSuggestions[this.highlightedIndex]);
      }
    },
    viewUsers() {
      this.$router.push("table-user");
    },
    viewLaboratory(){
      this.$router.push("view-laboratory");
    },
    viewSell(){
      this.$router.push("/admin");
    },
    getProductImage(product) {
      return product.image ? product.image : this.defaultImageUrl;
    },
    openProductDetailsModal(product) {
      this.selectedProduct = product;
      this.isProductDetailsModalVisible = true; 
    },
    closeProductDetailsModal() {
      this.isProductDetailsModalVisible = false;
      this.selectedProduct = null;
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
    nextStep() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    },
    openLotDetailsModal() {
      this.fetchLots(this.selectedProduct.nameProduct,this.selectedProduct.codProduct);
      this.isLotDetailsModalVisible = true;
      this.isProductDetailsModalVisible = false;
    },
    closeLotDetailsModal() {
      this.isLotDetailsModalVisible = false;
    },
    backLotDetailsModal(){
      this.isLotDetailsModalVisible = false;
      this.isProductDetailsModalVisible = true
    },
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    async fetchLaboratories() {
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          this.toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }
    
        const response = await axios.get('http://localhost:3000/laboratory/namesLaboratory', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (response.data && response.data.laboratory) {
          this.laboratory = response.data.laboratory;
        } else {
          this.toast.info('No se encontraron laboratorios.');
        }
      } catch (error) {
        this.toast.error('Error al obtener laboratorios del servidor.');
        console.error('Error en fetchLaboratories:', error);
      }
    },    
    closeEditProductModal() {
      this.isEditProductModalVisible = false;
    },
    editProduct(product) {
      this.selectedProduct = { ...product }; 
      this.isEditProductModalVisible = true;
    },
    async updateProduct() {
      if (!this.selectedProduct) {
        this.toast.error('No se seleccionó ningún producto para editar.');
        return;
      }
    
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          this.toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }
    
        const productToUpdate = {
          ...this.selectedProduct,
        };
        console.log(productToUpdate);
        const response = await axios.put(`http://localhost:3000/products/${this.selectedProduct.codProduct}`, productToUpdate, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          this.toast.success('Producto actualizado exitosamente.');
          this.fetchProducts();
          this.isEditProductModalVisible = false;
        } else {
          this.toast.error('Error al actualizar el producto. Inténtalo nuevamente.');
        }
      } catch (error) {
        this.toast.error('Ocurrió un error al actualizar el producto.');
        console.error('Error en updateProduct:', error);
      }
    },    
    async fetchLots(nameProduct, codProduct) {
      this.isLoading = true;
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          this.toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }
    
        const response = await axios.get(`http://localhost:3000/productslot/${codProduct}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        console.log(response.data)
        if (response.data && response.data.length > 0) {
          this.Lot = response.data;
        } else {
          this.toast.info(`No se encontraron lotes para el producto ${nameProduct}.`);
        }
      } catch (error) {
        this.toast.error(`Error al obtener lotes para el producto ${nameProduct}.`);
        console.error('Error en fetchLotesByProducto:', error);
      } finally {
        this.isLoading = false;
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
    showAddProductModal() {
      this.isAddProductModalVisible = true;
    },
    closeAddProductModal() {
      this.isAddProductModalVisible = false;
      this.resetNewProduct();
    },
    resetNewProduct() {
      this.newProduct = {
        codProduct: '',
        nameProduct: '',
        describeProduct: '',
        expirationDate: '',
        codLot: '', 
        quantity: 0,
        priceSell: 0.0,
        priceBuy: 0.0, 
        nameLaboratory: '', 
        image: 'https://via.placeholder.com/150'
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
        const response = await axios.post('http://localhost:3000/products', productWithDate, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          this.toast.success('Producto agregado exitosamente.');
          this.fetchProducts();
          this.closeAddProductModal();
        } else {
          this.toast.error('Error al agregar el producto. Inténtalo nuevamente.');
        }
      } catch (error) {
        this.toast.error('Ocurrió un error al agregar el producto.');
        console.error('Error en addProduct:', error);
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

        const response = await axios.post('http://localhost:3000/products/search', {
          nameProduct: this.search,},{
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials:true,
        });
        if (response.data.products && response.data.products.length > 0) {
          this.products = response.data.products;
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
