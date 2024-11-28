import { createStore } from 'vuex'; 

export default createStore({
  state: {
    notifications: [], 
    unreadNotifications: [], 
    lowStockProducts: [], 
  },
  mutations: {
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push(notification);
      state.unreadNotifications.push(notification);
    },
    REMOVE_NOTIFICATION(state, index) {
      state.unreadNotifications.splice(index, 1);
    },
    CLEAR_NOTIFICATIONS(state) {
      state.unreadNotifications = [];
    },
    setLowStockProducts(state, products) {
      state.lowStockProducts = products;
    },
  },
  actions: {
    addNotification({ commit }, notification) {
      if(this.unreadNotifications.lenght==0){
      commit('ADD_NOTIFICATION', notification);
      }
    },
    removeNotification({ commit }, index) {
      commit('REMOVE_NOTIFICATION', index);
    },
    clearNotifications({ commit }) {
      commit('CLEAR_NOTIFICATIONS');
    },
    updateLowStockProducts({ commit }, products) {
      commit('setLowStockProducts', products);
    },
  },
  getters: {
    allNotifications: (state) => state.notifications,
    unreadNotifications: (state) => state.unreadNotifications,
    lowStockProducts: (state) => state.lowStockProducts,
  },
});
