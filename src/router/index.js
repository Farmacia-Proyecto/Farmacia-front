import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/loginPage.vue';
import Recovery from '../views/recovery.vue';
import AdminPage from '../views/AdminPage.vue';

const routes = [
  { path: '/', component: Login },
  { path: '/recovery', component: Recovery},
  { path: '/admin', component: AdminPage},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
