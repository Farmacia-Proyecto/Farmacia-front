import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/loginPage.vue';
import Recovery from '../views/recovery.vue';
import AdminPage from '../views/AdminPage.vue';
import { isAuthenticated } from '../utils/isAuthenticated';

const routes = [
  { path: '/', component: Login },
  { path: '/recovery', component: Recovery },
  { path: '/admin', component: AdminPage},
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
