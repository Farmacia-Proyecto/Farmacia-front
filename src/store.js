import { createStore } from 'vuex'; 

export default createStore({
  state: {
    notifications: [], 
    unreadNotifications: [], 
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
  },
  actions: {
    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification);
    },
    removeNotification({ commit }, index) {
      commit('REMOVE_NOTIFICATION', index);
    },
    clearNotifications({ commit }) {
      commit('CLEAR_NOTIFICATIONS');
    },
  },
  getters: {
    allNotifications: (state) => state.notifications,
    unreadNotifications: (state) => state.unreadNotifications,
  },
});
