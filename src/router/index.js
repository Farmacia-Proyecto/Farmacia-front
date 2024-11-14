import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/LoginView/LoginPage.vue';
import Recovery from '../views/RecoveryView/RecoveryPage.vue';
import AdminPage from '../views/AdminView/Users/AdminPage.vue';
import AddUser from '../views/AdminView/Users/AddUser/AddUser.vue';
import TableUsers from '../views/AdminView/Users/TableUsers/TableUsers.vue';
import ChangePaswordAdmin from '../views/AdminView/Users/ChangePasword/ChangePasword.vue';
import { isAuthenticated } from '../utils/isAuthenticated';

const routes = [
  { path: '/', component: Login },
  { path: '/recovery', component: Recovery },
  { path: '/admin', component: AdminPage, meta: { requiresAuth: true } },
  { path: '/add-user', component: AddUser, meta: { requiresAuth: true }},
  { path: '/table-user', component: TableUsers, meta: { requiresAuth: true }},
  { path: '/pasword-admin', component: ChangePaswordAdmin, meta: { requiresAuth: true }},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/');
  } else {
    next();
  }
});

export default router;
