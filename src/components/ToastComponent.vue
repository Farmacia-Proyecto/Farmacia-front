<template>
  <div v-show="isVisible" class="toast" :class="['toast', type, { show: isVisible }]">
    <span>{{ message }}</span>
  </div>
</template>

<script>
export default {
  props: {
    message: String,
    type: {
      type: String,
      default: 'success'
    }
  },
  data() {
    return {
      isVisible: false
    };
  },
  watch: {
    message(newMessage) {
      if (newMessage) {
        this.showToast(newMessage);
      }
    }
  },
  methods: {
    showToast() {
      this.isVisible = true;
      setTimeout(() => {
        this.isVisible = false;
      }, 3000); // Desaparece después de 3 segundos
    }
  }
};
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 15px;
  background-color: #4CAF50;
  color: white;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  z-index: 9999;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.toast.success {
  background-color: #4CAF50;
}

.toast.error {
  background-color: #f44336;
}

.toast.warning {
  background-color: #ff9800;
}

.toast.info {
  background-color: #2196F3;
}

.toast.show {
  opacity: 1;
}
</style>
