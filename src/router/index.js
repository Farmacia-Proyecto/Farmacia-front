import { createRouter, createWebHistory } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import Login from '../views/LoginView/LoginPage.vue';
import Recovery from '../views/RecoveryView/RecoveryPage.vue';
import AdminPage from '../views/AdminView/sells/AdminPage.vue';
import TableUsers from '../views/AdminView/Users/TableUsers/TableUsers.vue';
import ChangePaswordAdmin from '../views/AdminView/Users/ChangePasword/ChangePasword.vue';
import RecoveryPassword from '../views/RecoveryView/RecoveryEmail.vue';
import ViewProductAdmin from '../views/AdminView/Stock/ViewProducts.vue';
import TableLaboratory from '@/views/AdminView/Laboratory/TableLaboratory.vue';
import TableOrders from '../views/AdminView/Orders/OrderView.vue';
import ViewReports  from '../views/AdminView/Reportes/ReportsView.vue';
import ChangePaswordManager from '@/views/ManagerView/changePassword/ChangePasword.vue';
import ViewProductManager from '../views/ManagerView/Stock/ViewProducts.vue';
import ViewSellsManager from '../views/ManagerView/sells/SellsPage.vue';
import viewOrdersManager from '../views/ManagerView/Orders/OrderView.vue'
import viewReportsManager from '../views/ManagerView/Reportes/ReportsView.vue'
import ChangePaswordUser from '../views/UserView/ChangePassword/ChangePasword.vue';
import ViewSellsUser from '../views/UserView/sells/SellsPage.vue';


function getTokenFromCookies() {
  const cookie = document.cookie.split('; ').find(row => row.startsWith('jwt='));
  return cookie ? cookie.split('=')[1] : null;
}

function getRoleFromToken(token) {
  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.typeUser;
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
}

const routes = [
  { path: '/', component: Login },
  { path: '/recovery', component: Recovery },
  { path: '/admin', component: AdminPage, meta: { requiresAuth: true, allowedRoles: ['Administrador'] } },
  { path: '/admin/table-user', component: TableUsers, meta: { requiresAuth: true, allowedRoles: ['Administrador'] } },
  { path: '/admin/pasword', component: ChangePaswordAdmin, meta: { requiresAuth: true, allowedRoles: ['Administrador'] } },
  { path: '/admin/view-product', component: ViewProductAdmin, meta: { requiresAuth: true, allowedRoles: ['Administrador'] } },
  { path: '/admin/view-laboratory', component: TableLaboratory, meta: { requiresAuth: true, allowedRoles: ['Administrador'] } },
  { path: '/admin/view-orders', component: TableOrders, meta: { requiresAuth: true, allowedRoles: ['Administrador'] } },
  { path: '/admin/view-reports', component: ViewReports, meta: { requiresAuth: true, allowedRoles: ['Administrador'] } },
  { path: '/manager/pasword', component: ChangePaswordManager, meta: { requiresAuth: true, allowedRoles: ['Gerente'] } },
  { path: '/manager/view-product', component: ViewProductManager, meta: { requiresAuth: true, allowedRoles: ['Gerente'] } },
  { path: '/manager/sell', component: ViewSellsManager, meta: { requiresAuth: true, allowedRoles: ['Gerente'] } },
  { path: '/manager/view-orders', component: viewOrdersManager, meta: { requiresAuth: true, allowedRoles: ['Gerente'] } },
  { path: '/manager/view-reports', component: viewReportsManager, meta: { requiresAuth: true, allowedRoles: ['Gerente'] } },
  { path: '/user/sell', component: ViewSellsUser, meta: { requiresAuth: true, allowedRoles: ['Vendedor'] } },
  { path: '/user/pasword', component: ChangePaswordUser, meta: { requiresAuth: true, allowedRoles: ['Vendedor'] } },
  { path: '/recovery-password/:userName', component: RecoveryPassword },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = getTokenFromCookies();

  if (to.meta.requiresAuth) {
    if (!token) {
      next('/'); 
      return;
    }
    const userRole = getRoleFromToken(token);
    if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(userRole)) {
      next('/'); 
      return;
    }
  }
  next();
});


export default router;
