import Vue from 'vue';
import VueKonva from 'vue-konva';
import VueMaterial from 'vue-material';
import 'vue-material/dist/theme/default-dark.css';
import 'vue-material/dist/vue-material.min.css';
import App from './App.vue';
import './registerServiceWorker';
import store from './store';

Vue.use(VueKonva);
Vue.use(VueMaterial);
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
  store,
}).$mount('#app');
