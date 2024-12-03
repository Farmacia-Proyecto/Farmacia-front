import { createApp } from 'vue';
import { useToast } from 'vue-toastification';
import { mapState, mapActions } from 'vuex';
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import App from '../../../App.vue';
import Toast from 'vue-toastification';
import axios from 'axios';
import 'vue-toastification/dist/index.css';

Chart.register(...registerables);

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
      isDropdownVisible:false,
      notifications: [], 
      isLowStockModalVisible: false,
      isNotificationsVisible: false,
      quantityChart: null,
      laboratories: [], 
      filteredLaboratories: [], 
      priceChart: null,
      itemsPerPage: 4,
      pageSize: 4,
      isLoading: false,
      currentPage: 1,
      productsAlert:[],
      lowStockProducts: [],
      selectedProduct: '',
      selectedLaboratory: '',
      startDate: '',
      endDate: '',
      products: [
      ],
      reportData: [],
    };
  },
  mounted() {
    this.fetchAlert();
    this.fetchProducts();
    this.toast = useToast();
  },
  computed: {
    ...mapState(['unreadNotifications']), 
    totalPages() {
        return Math.ceil(this.reportData.length / this.pageSize);
      },
      getPaginatedData() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.reportData.slice(start, end);
      }
  },
  methods: {
    ...mapActions(['addNotification', 'removeNotification']),
    toggleNotifications() {
      this.isNotificationsVisible = !this.isNotificationsVisible;
    },
    goToPage(page) {
        if (page >= 1 && page <= this.totalPages) {
          this.currentPage = page;
        }
      },
    generateOrder() {
      this.$store.dispatch('addLowStockProducts', this.lowStockProducts);
      this.$router.push({
        path: '/manager/view-orders',
        query: { fromLowStockModal: true }
      });
    },
    generatePDF() {
      const doc = new jsPDF();

      const title = "Reporte de Ventas";
      const pageWidth = doc.internal.pageSize.width; 
      const titleWidth = doc.getTextWidth(title); 
      const titleX = (pageWidth - titleWidth) / 2; 
  
      doc.setFontSize(18);
      doc.text(title, titleX, 20); 
  

      doc.setFontSize(12);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 10, 30);

      const totalSales = this.reportData.reduce((sum, item) => sum + item.totalPrice, 0);
      const totalQuantity = this.reportData.reduce((sum, item) => sum + item.quantity, 0);
      doc.text(`Total Ventas: $${totalSales.toFixed(2)}`, 10, 40);
      doc.text(`Cantidad Total Vendida: ${totalQuantity}`, 10, 50);
  
      doc.autoTable({
          head: [["Cod Factura", "Producto", "Laboratorio", "Precio Total", "Cantidad", "Fecha de Venta", "Vendedor"]],
          body: this.reportData.map(detail => [
              detail.codInvoice,
              detail.nameProduct,
              detail.laboratory,
              detail.totalPrice,
              detail.quantity,
              detail.date,
              detail.namePerson,
          ]),
          startY: 60,
          headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255] },
          alternateRowStyles: { fillColor: [240, 240, 240] },
          pageBreak: 'auto',
      });
  
      doc.text("Observaciones:", 10, doc.lastAutoTable.finalY + 10);
      doc.setFontSize(10);
      doc.text("Los datos presentados corresponden a las ventas realizadas durante el mes de noviembre.", 10, doc.lastAutoTable.finalY + 20);

      doc.setFontSize(8);
      doc.text("Farmaceutica S.A - Calle 123, Ciudad - info@farmaceutica.com", 10, 290);

      doc.save("reporteVentas.pdf");
  },  
    viewNotification(index) {
      this.lowStockProducts = this.productsAlert;
      console.log(this.lowStockProducts)
      this.isLowStockModalVisible = true;
      this.removeNotification(index);
      this.toggleNotifications();
    },
    filterLaboratories() {
        const selectedProduct = this.products.find(product => product.nameProduct === this.selectedProduct);
        if (selectedProduct) {
            console.log("selectedProduct:", this.selectedProduct);
            this.filteredLaboratories = selectedProduct.laboratories;
            this.selectedLaboratory = ""; 
        } else {
            this.filteredLaboratories = [];
        }
    },
    async fetchProducts() {
        try {
            const token = this.getTokenFromCookies();
            const response = await axios.get("http://localhost:3000/products/productsReport",{  
            headers: {
                Authorization: `Bearer ${token}`,
              },});

            if (response.data.success) {
                this.products = response.data.products; 
            } else {
                this.toast.error("No se pudieron obtener los productos.");
            }
        } catch (error) {
            console.error("Error al obtener los productos:", error);
        }
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
    viewOrders(){
      this.$router.push("view-orders");
    },
    viewSell(){
      this.$router.push("sell");
    },
    viewStock(){
      this.$router.push("view-product");
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
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    async fetchReportData() { 
    try {
        if (!this.startDate || !this.endDate) {
            this.toast.error("Por favor, selecciona un rango de fechas.");
            return;
        }
        if(!this.selectedProduct || !this.selectedLaboratory){
            const dates = {
                startDate: this.startDate,
                finalDate: this.endDate,
            }
          const response = await axios.post("http://localhost:3000/invoice/generalReport", dates, { },);
        if(response.data.success){
            this.processData(response.data.invoices);
            this.toast.success("Consulta realizada correctamente")
        }else{
            this.toast.error("No se puede realizar la consulta")
        }
        }else{
            const dates = {
                startDate: this.startDate,
                finalDate: this.endDate,
                nameProduct: this.selectedProduct,
                laboratory: this.selectedLaboratory
            }
            const response = await axios.post("http://localhost:3000/invoice/specificProductReport", dates, { },);
            if(response.data.success){
                this.processData(response.data.invoices);
                this.toast.success("Consulta realizada correctamente")
            }else{
                this.toast.error("No se puede realizar la consulta")
            }
        }
        } catch (error) {
            console.error("Error al obtener los datos:", error);
        }
    },
    processData(invoices) {
        if (!Array.isArray(invoices)) {
            console.error("Los datos recibidos no son un arreglo:", invoices);
            return;
        }
        this.reportData = invoices
            .map((invoice) =>
                invoice.details.map((detail) => ({
                    codInvoice: invoice.codInvoice,
                    nameProduct: detail.nameProduct,
                    laboratory: detail.laboratory,
                    totalPrice: detail.totalPrice,
                    quantity: detail.quantity,
                    date: invoice.date,
                    namePerson: invoice.namePerson.trim(),
                }))
            )
            .reduce((acc, curr) => acc.concat(curr), []); 
            this.updateCharts();
    },    
    updateCharts() {
        if (this.quantityChart) this.quantityChart.destroy();
        if (this.priceChart) this.priceChart.destroy();

        const labels = this.reportData.map(data => data.nameProduct);
        const quantities = this.reportData.map(data => data.quantity);
        const prices = this.reportData.map(data => data.totalPrice);

        const quantityCtx = document.getElementById('quantityChart').getContext('2d');
        this.quantityChart = new Chart(quantityCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cantidad Vendida',
                    data: quantities,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                },
                scales: {
                  x: {
                    ticks: {
                        display: false,
                    },
                },
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });

        const priceCtx = document.getElementById('priceChart').getContext('2d');
        this.priceChart = new Chart(priceCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Precio Total',
                    data: prices,
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                }],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                },
                scales: {
                  x: {
                    ticks: {
                        display: false, // Oculta las etiquetas del eje X
                    },
                },
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
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
    getTokenFromCookies() {
      const cookieName = 'jwt=';
      const cookies = document.cookie.split('; ');
      const tokenCookie = cookies.find((cookie) => cookie.startsWith(cookieName));
      return tokenCookie ? tokenCookie.split('=')[1] : null;
    },
  },
};
