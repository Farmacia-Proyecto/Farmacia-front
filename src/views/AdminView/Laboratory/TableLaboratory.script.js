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
      isNotificationsVisible: false,
      isDropdownVisible: false,
      isModalOpen: false,
      isButtonVisible: true,
      isUserHeaderVisible: false,
      isSelectingSuggestion: false,
      isAddProviderModalVisible: false, 
      currentPage: 1, 
      pageSize: 6, 
      itemsPerPage: 6,
      search: '',
      newProvider: {
        nit: '',
        nameSupplier: '',
        phoneSupplier: '',
        emailSupplier: '',
        laboratories: [],
      },
      laboratories: [
          { "id": 1, "name": "Pfizer" },
          { "id": 2, "name": "Bayer" },
          { "id": 3, "name": "Novartis" },
          { "id": 4, "name": "Sanofi" },
          { "id": 5, "name": "Roche" },
          { "id": 6, "name": "Merck" },
          { "id": 7, "name": "AstraZeneca" },
          { "id": 8, "name": "Johnson & Johnson" },
          { "id": 9, "name": "GSK" },
          { "id": 10, "name": "AbbVie" },
          { "id": 11, "name": "Eli Lilly" },
          { "id": 12, "name": "Amgen" },
          { "id": 13, "name": "Bristol Myers Squibb" },
          { "id": 14, "name": "GlaxoSmithKline" },
          { "id": 15, "name": "Boehringer Ingelheim" },
          { "id": 16, "name": "Medtronic" },
          { "id": 17, "name": "Teva Pharmaceuticals" },
          { "id": 18, "name": "Abbott Laboratories" },
          { "id": 19, "name": "Cipla" },
          { "id": 20, "name": "Sandoz" },
          { "id": 21, "name": "Laboratorios de la Salud" },
          { "id": 22, "name": "Laboratorios Soremar" },
          { "id": 23, "name": "Genfar" },
          { "id": 24, "name": "Lab. Farmacéuticos Actavis" },
          { "id": 25, "name": "Lab. Medley" },
          { "id": 26, "name": "Grupo Pisa" },
          { "id": 27, "name": "Fresenius Kabi" },
          { "id": 28, "name": "Laboratorios Liomont" },
          { "id": 29, "name": "Laboratorios Silanes" },
          { "id": 30, "name": "Mylan" },
          { "id": 31, "name": "Laboratorios Roc Pharma" },
          { "id": 32, "name": "Sicor" },
          { "id": 33, "name": "Emsam" },
          { "id": 34, "name": "Farmalider" },
          { "id": 35, "name": "Laboratorio Pasteur" },
          { "id": 36, "name": "Laboratorios Guadalajara" },
          { "id": 37, "name": "Laboratorios Calixta" },
          { "id": 38, "name": "Farmaceutica La Moderna" },
          { "id": 39, "name": "Laboratorios Marzam" },
          { "id": 40, "name": "Laboratorios Best Pharma" },
          { "id": 41, "name": "Laboratorio Turing" },
          { "id": 42, "name": "Vitalis" },
          { "id": 43, "name": "Laboratorios ECAR" },
          { "id": 44, "name": "Zambon" },
          { "id": 45, "name": "Laboratorios Cifuentes" },
          { "id": 46, "name": "Servier" },
          { "id": 47, "name": "Nobel" },
          { "id": 48, "name": "Schering-Plough" },
          { "id": 49, "name": "Grünenthal" },
          { "id": 50, "name": "Almirall" },
          { "id": 51, "name": "Tecnoquímicas" },
          { "id": 52, "name": "MK" },
          { "id": 53, "name": "Laboratorios La Santé" },
          { "id": 54, "name": "Farmacéutica La Moderna" },
          { "id": 55, "name": "Laboratorios Bagó" },
          { "id": 56, "name": "Laboratorios Pasteur" },
          { "id": 57, "name": "Grupo Mabe" },
          { "id": 58, "name": "Laboratorios Polifarma" },
          { "id": 59, "name": "Laboratorios Bioderma" },
          { "id": 60, "name": "Laboratorios Dr. Esteve" },
          { "id": 61, "name": "Vademécum" },
          { "id": 62, "name": "Medley" },
          { "id": 63, "name": "Lilly" }              
      ],
      searchTerm: "",
      filteredLaboratories: [],  
      selectedLaboratories: [], 
      provider: [], 
      editIndex: null,
      editableProvider: {},  
      isLowStockModalVisible: false,
      productsAlert:[],
      lowStockProducts: [],
    };
  },
  mounted() {
    this.fetchProviders();  
    this.fetchAlert();
  },
  computed: {
    ...mapState(['unreadNotifications']), 
    paginatedProviders() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.provider.slice(start, end);
    },
    getPaginatedData() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.provider.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.provider.length / this.pageSize);
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
        path: '/admin/view-orders',
        query: { fromLowStockModal: true }
      });
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
        laboratory.name.toLowerCase().includes(this.searchTerm.toLowerCase()) &&
        !this.selectedLaboratories.some(selected => selected.id === laboratory.id)
      );
    },

    addLaboratory(laboratory) {
      this.selectedLaboratories.push(laboratory);
      this.searchTerm = ""; 
      this.filteredLaboratories = []; 
    },
    removeLaboratory(index) { 
      this.selectedLaboratories.splice(index, 1);
    },
    hideSuggestions() {
      this.filteredLaboratories = []; 
    },
    onBlur() {
      setTimeout(() => {
        if (!this.isSelectingSuggestion) {
          this.hideSuggestions();
        }
        this.isSelectingSuggestion = false;
      }, 300);
    },
    created() {
      this.toast = useToast();
    },
    logOut() {
      document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
      this.$router.push("/");
    },
    viewUsers() {
      this.$router.push("table-user");
    },
    viewSell() {
      this.$router.push("/admin");
    },
    viewOrders(){
      this.$router.push("view-orders");
    },
    viewReports(){
      this.$router.push("view-reports");
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
    viewStock() {
      this.$router.push("view-product");
    },
    openAddProviderModal() {  
      this.isAddProviderModalVisible = true;
    },
    closeAddProviderModal() { 
      this.isAddProviderModalVisible = false;
      this.resetNewProvider();
    },
    resetNewProvider() { 
      this.newProvider = { nit: '', nameSupplier: '', phoneSupplier: '', emailSupplier: '' };
    },
    async submitProvider() {  
      const toast = useToast();
      const token = this.getTokenFromCookies();
    
      if (!token) {
        toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
        return;
      }
      const providerData = {
        nit: this.newProvider.nit,
        nameSupplier: this.newProvider.nameSupplier,
        phoneSupplier: this.newProvider.phoneSupplier,
        emailSupplier: this.newProvider.emailSupplier,
        laboratories: this.selectedLaboratories.map(laboratory => ({
          nameLaboratory: laboratory.name
        }))  
      };
      try {
        const response = await axios.post('http://localhost:3000/suppliers',  
          providerData,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            withCredentials: true,
          }
        );
        if (response.data.success) {
          toast.success('Proveedor agregado exitosamente');
          this.closeAddProviderModal(); 
          this.fetchProviders(); 
          this.reloadPage();
        } else {
          toast.error('El nit ingresado no es valido.');
        }
      } catch (error) {
        if (error.response) {
          toast.error(`Error: ${error.response.data.message}`);
        } else {
          toast.error('Error al conectar con el servidor.');
          console.error(error);
        }
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
    async fetchProviders() {
      this.isUserHeaderVisible = true;
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          useToast().error("Token no encontrado. Por favor, inicia sesión de nuevo.");
          return;
        }
        const response = await axios.get('http://localhost:3000/suppliers', {  
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        });
        
        if (response.data && response.data.providers) {  
          this.provider = response.data.providers;
          console.log(this.provider);
        } else {
          useToast().warning("No se encontraron proveedores.");
        }
      } catch (error) {
        useToast().error("Ocurrió un error al cargar los proveedores.");
      }
    },
    getTokenFromCookies() {
      const cookieName = 'jwt=';
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find((cookie) => cookie.startsWith(cookieName));
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    },
    startEdit(provider, index) {  
      this.isButtonVisible = false;
      this.editIndex = index;
      this.editableProvider = { ...provider };
      this.selectedLaboratories = provider.laboratories.map(
        (lab) => lab.nameLaboratory
      );
    },
    async confirmEdit(index) {
      const toast = useToast();
      const token = this.getTokenFromCookies();
    
      if (!token) {
        toast.error("Token no encontrado. Por favor, inicia sesión de nuevo.");
        return;
      }    
      try {
        const updatedProvider = {
          nameSupplier: this.editableProvider.nameSupplier,
          phoneSupplier: this.editableProvider.phoneSupplier,
          emailSupplier: this.editableProvider.emailSupplier,
          laboratories: this.selectedLaboratories.map((name) => ({
            nameLaboratory: name,
          })),
        };
        console.log(updatedProvider)
        const response = await axios.put(
          `http://localhost:3000/suppliers/${this.editableProvider.nit}`,
          updatedProvider,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
    
        if (response.data.success) {
          toast.success("Proveedor actualizado exitosamente");
          this.editIndex = null;
          this.provider[index] = { ...this.editableProvider };
          this.isButtonVisible = true;
        } else {
          toast.error("No se pudo actualizar el proveedor.");
        }
      } catch (error) {
        toast.error("Ocurrió un error al actualizar el proveedor.");
        console.error(error);
      }
    },        
    openLaboratoryModal(provider) {
      this.selectedProvider = provider;
      this.selectedLaboratories = provider.laboratories.map(
        (lab) => lab.nameLaboratory
      );
      this.isModalOpen = true;
    },
    closeLaboratoryModal() {
      this.isModalOpen = false;
      this.selectedProvider = null;
      this.selectedLaboratories = [];
    },
    addLaboratoryFromModal(lab) {
      if (!this.selectedLaboratories.includes(lab.name)) {
        this.selectedLaboratories.push(lab.name);
      }
      this.searchTerm = "";
      this.filteredLaboratories = [];
    },
    removeLaboratoryFromModal(index) {
      this.selectedLaboratories.splice(index, 1);
    },
    async updateLaboratories() {
      const toast = useToast();
      const token = this.getTokenFromCookies();
  
      if (!token) {
        toast.error("Token no encontrado. Por favor, inicia sesión de nuevo.");
        return;
      }
  
      try {
        const updatedProvider = {
          ...this.selectedProvider,
          laboratories: this.selectedLaboratories.map((name) => ({
            nameLaboratory: name,
          })),
        };
  
        const response = await axios.put(
          `http://localhost:3000/suppliers/${this.selectedProvider.nit}`,
          updatedProvider,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
  
        if (response.data.success) {
          toast.success("Laboratorios actualizados exitosamente");
          this.closeLaboratoryModal();
          await this.sleep(2000); 
          this.reloadPage();
        } else {
          toast.error("No se pudo actualizar el proveedor.");
        }
      } catch (error) {
        toast.error("Ocurrió un error al actualizar los laboratorios.");
        console.error(error);
      }
    },
    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async searchProvider() {
      const toast = useToast(); 
      try {
        const token = this.getTokenFromCookies();
        if (!token) {
          toast.error("Token no encontrado. Por favor, inicia sesión de nuevo.");
          return;
        }
        const response = await axios.post('http://localhost:3000/suppliers/search', {  
          nameProvider: this.search,  
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          withCredentials: true,
        });
        if (response.data && response.data.providers) {  
          this.provider = response.data.providers;
          toast.success("Búsqueda completada.");
        } else {
          this.provider = [];
          toast.info("No se encontraron proveedores con ese criterio de búsqueda.");
        }
      } catch (error) {
        toast.error("Ocurrió un error al buscar los proveedores.");
      }
    },
  },
};