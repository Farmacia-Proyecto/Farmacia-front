import { createApp } from 'vue';
import { useToast } from 'vue-toastification';
import { mapState, mapActions } from 'vuex';
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
      isSearchBarVisible: false,
      isDropdownVisible:false,
      isCodeEditable: true,
      isSelectingSuggestion: false,
      notifications: [], 
      isLowStockModalVisible: false,
      isNotificationsVisible: false,
      products: [],
      search: '',
      itemsPerPage: 10,
      isLoading: false,
      currentPage: 1,
      currentStep: 1,
      totalSteps: 3,
      loadingImages: [],
      isAddProductModalVisible: false,
      isEditProductModalVisible: false,
      isLotDetailsModalVisible: false,
      isProductDetailsModalVisible:false,
      productsAlert:[],
      lowStockProducts: [],
      newProduct: {
        codProduct: '',
        nameProduct: '',
        describeProduct: '',
        expirationDate: '',
        nameSupplier:'',
        codLot: '', 
        quantity: 0,
        priceSell: 0.0,
        priceBuy: 0.0, 
        laboratory: '', 
        image: ''
      },
      laboratories: [],
      searchTerm: "",
      filteredLaboratories: [],  
      selectedLaboratories: [],
      isAddLotModalVisible: false,
      selectedProduct: null,
      provider: [],  
      suggestions: [], 
      filteredSuggestions: [], 
      Lot: [],
      highlightedIndex: -1, 
    };
  },
  computed: {
    ...mapState(['unreadNotifications']), 
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
    this.loadingImages = this.paginatedProducts.map(() => true);
    this.fetchAlert();
    this.fetchProviders();
    this.fetchProducts();
    this.toast = useToast();
  },
  methods: {
    ...mapActions(['addNotification', 'removeNotification']),
    toggleNotifications() {
      this.isNotificationsVisible = !this.isNotificationsVisible;
    },
    handleImageLoad(index) {
      this.loadingImages[index] = false; // Actualiza directamente el estado
    },
    handleImageError(index) {
      this.loadingImages[index] = true; // Mantiene el placeholder si hay un error
    },
    generateOrder() {
      this.$store.dispatch('addLowStockProducts', this.lowStockProducts);
      this.$router.push({
        path: '/admin/view-orders',
        query: { fromLowStockModal: true }
      });
    },
    validateUrl() {
      const urlRegex =
        /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i;

      if (this.newProduct.codLot && !urlRegex.test(this.newProduct.codLot)) {
        this.urlError = "Por favor, ingresa una URL válida.";
      } else {
        this.urlError = null;
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
    filterLaboratories() {
      this.filteredLaboratories = this.laboratories.filter(laboratory =>
        laboratory.nameLaboratory.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
        !this.selectedLaboratories.some(selected => selected.codLaboratory === laboratory.codLaboratory)
      );
    },
    selectLaboratory(laboratory) {
      this.newProduct.laboratory = laboratory.nameLaboratory; 
      this.searchTerm = laboratory.nameLaboratory; 
      this.filteredLaboratories = []; 
    },
    onBlur() {
      setTimeout(() => {
        if (!this.isSelectingSuggestion) {
          this.filteredLaboratories = [];
        }
        this.isSelectingSuggestion = false;
      }, 2000);
    },
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
    viewReports(){
      this.$router.push("view-reports");
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
    viewOrders(){
      this.$router.push("view-orders");
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
     validateStep() {
        if (this.currentStep === 1) {
          return (
            this.newProduct.codProduct &&
            this.newProduct.nameProduct &&
            this.newProduct.describeProduct &&
            this.newProduct.nameSupplier
          );
        }
        if (this.currentStep === 2) {
          return (
            this.newProduct.expirationDate &&
            this.searchTerm &&
            this.newProduct.codLot &&
            this.newProduct.quantity
          );
        }
        if (this.currentStep === 3) {
          return (
            this.newProduct.priceSell &&
            this.newProduct.priceBuy
          );
        }
        return true;
      },
      nextStep() {
        if (this.validateStep()) {
          this.currentStep++;
        } else {
          this.toast.error("Por favor, completa todos los campos requeridos antes de continuar.");
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
        console.log(response.data.products)
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
    async fetchProviders() {
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          this.toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }
    
        const response = await axios.get('http://localhost:3000/suppliers', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (response.data && response.data.providers) {
          this.provider = response.data.providers;
        } else {
          this.toast.info('No se encontraron proveedores.');
        }
      } catch (error) {
        this.toast.error('Error al obtener proveedores del servidor.');
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
      this.currentStep=1;
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
        image: ''
      };
    },
    async fetchLaboratoriesForSupplier(supplierName) {
      const token = this.getTokenFromCookies();
        if (!token) {
          this.toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }
      if (!supplierName) return;
      const response = await axios.get(`http://localhost:3000/products/change-laboratories/${supplierName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if(response.data.success){
        this.laboratories = response.data.laboratory
      }
    },
    async addProduct() {
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          this.toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
          return;
        }
        const userName  = this.getUserFromToken(token);
        const productWithDate = {
          ...this.newProduct,
          addedDate: new Date().toISOString(),
          userName: userName
        };
        console.log(productWithDate)
        const response = await axios.post('http://localhost:3000/products', productWithDate, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          this.toast.success('Producto agregado exitosamente.');
          this.fetchProducts();
          this.closeAddProductModal();
          this.currentStep=1;
        } else {
          this.toast.error('Error al agregar el producto. Inténtalo nuevamente.');
          this.currentStep=1;
        }
      } catch (error) {
        this.toast.error('Ocurrió un error al agregar el producto.');
        console.error('Error en addProduct:', error);
        this.currentStep=1;
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
    getUserFromToken(token) {
      try {
        const decodedToken = jwtDecode(token);
        return decodedToken.userName; 
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        return null;
      }
    }
  },
};
