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
      currentStep: 1,
      totalSteps: 3,
      isAddProductModalVisible: false,
      isEditProductModalVisible: false,
      isProductDetailsModalVisible:false,
      newProduct: {
        code: '',
        name: '',
        description: '',
        expiryDate: '',
        lot: '', 
        quantity: 0,
        price: 0.0,
        purchasePrice: 0.0, 
        nameLaboratory: '', 
      },
      isAddLotModalVisible: false,
      selectedProduct: null,
      laboratory: [],  
      suggestions: [], 
      filteredSuggestions: [], 
      highlightedIndex: -1, 
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
    this.fetchLaboratories();
    this.fetchProducts();
    this.toast = useToast();
    this.suggestions = [
      { id: 1, name: "Paracetamol" },
      { id: 2, name: "Ibuprofeno" },
      { id: 3, name: "Amoxicilina" },
      { id: 4, name: "Diclofenaco" },
    ];
  },
  methods: {
    fetchSuggestions() {
      const query = this.newProduct.name.toLowerCase();
      this.filteredSuggestions = this.suggestions.filter((product) =>
        product.name.toLowerCase().includes(query)
      );
      this.highlightedIndex = -1; 
    },
    selectSuggestion(name) {
      if (name) {
        this.newProduct.name = name;
      } else if (this.highlightedIndex >= 0) {
        this.newProduct.name = this.filteredSuggestions[this.highlightedIndex].name;
      }
      this.filteredSuggestions = []; 
    },
    highlightNext() {
      if (this.filteredSuggestions.length > 0) {
        this.highlightedIndex =
          (this.highlightedIndex + 1) % this.filteredSuggestions.length;
      }
    },
    highlightPrev() {
      if (this.filteredSuggestions.length > 0) {
        this.highlightedIndex =
          (this.highlightedIndex - 1 + this.filteredSuggestions.length) %
          this.filteredSuggestions.length;
      }
    },
    viewUsers() {
      this.$router.push("table-user");
    },
    viewLaboratory(){
      this.$router.push("view-laboratory");
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
    getDefaultProducts() {
      return [
        {
          id: 1,
          code: 'P001',
          name: 'Paracetamol 500mg',
          description: 'Analgésico y antipirético',
          expiryDate: '2025-12-31',
          lot: 'L001',
          quantity: 100,
          price: 1.5,
          purchasePrice: 1.0,
          laboratorioNombre: 'Laboratorio Alfa',
          image: 'https://via.placeholder.com/150', 
        },
        {
          id: 2,
          code: 'P002',
          name: 'Ibuprofeno 400mg',
          description: 'Antiinflamatorio no esteroideo',
          expiryDate: '2024-10-15',
          lot: 'L002',
          quantity: 50,
          price: 2.0,
          purchasePrice: 1.2,
          laboratorioNombre: 'Laboratorio Beta',
          image: 'https://via.placeholder.com/150', 
        },
        {
          id: 3,
          code: 'P003',
          name: 'Amoxicilina 500mg',
          description: 'Antibiótico de amplio espectro',
          expiryDate: '2026-01-20',
          lot: 'L003',
          quantity: 75,
          price: 3.5,
          purchasePrice: 2.0,
          laboratorioNombre: 'Laboratorio Gamma',
          image: 'https://via.placeholder.com/150', // URL de imagen de ejemplo
        },
        {
          id: 4,
          code: 'P004',
          name: 'Diclofenaco 50mg',
          description: 'Antiinflamatorio y analgésico',
          expiryDate: '2025-06-18',
          lot: 'L004',
          quantity: 200,
          price: 1.8,
          purchasePrice: 1.0,
          laboratorioNombre: 'Laboratorio Delta',
          image: 'https://via.placeholder.com/150', // URL de imagen de ejemplo
        },
      ];
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
          this.toast.success('Laboratorios cargados correctamente.');
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
          nameLaboratory:this.newProduct.nameLaboratory
        };
        console.log(productToUpdate.nameLaboratory)
        const response = await axios.put(`http://localhost:3000/products/${this.selectedProduct.id}`, productToUpdate, {
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
    
        if (response.data && response.data.length > 0) {
          this.products = response.data;
          this.toast.success('Productos cargados correctamente.');
        } else {
          this.products = this.getDefaultProducts();
          this.toast.info('No se encontraron productos. Mostrando productos de ejemplo.');
        }
      } catch (error) {
        this.products = this.getDefaultProducts();
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
        code: '',
        name: '',
        description: '',
        expiryDate: '',
        lot: '', 
        quantity: 0,
        price: 0.0,
        purchasePrice: 0.0, 
        nameLaboratory: '', 
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
        console.log(productWithDate.nameLaboratory);
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
