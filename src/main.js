import { createApp } from 'vue';        
import App from './App.vue';             
import router from './router';       
import { library } from '@fortawesome/fontawesome-svg-core';
import { faUser } from '@fortawesome/free-solid-svg-icons'; 
import { faKey } from '@fortawesome/free-solid-svg-icons'; 
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';    

library.add(faUser);
library.add(faKey); 

const app = createApp(App);      
app.component('font-awesome-icon', FontAwesomeIcon); 
app.use(router); 
app.mount('#app'); 