import Vue from "nativescript-vue";
import Vuex from 'vuex';

// Import localStorage modules
import LoginFrame from '@/store/LoginFrame';
import SignUpFrame from '@/store/SignUpFrame';

// Use the VueX storage module
Vue.use(Vuex);

// Setup our local data stores
const store = new Vuex.Store({
  modules: {
    LoginFrame,
    SignUpFrame,
  },

  /*actions: {
    initialise({ dispatch }) {
      // Run any module init functions
      // dispatch('Backgrounds/initialise');
    },
  },*/
});

export default store;
