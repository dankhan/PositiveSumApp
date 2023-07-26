/**
 * Main include file for the Vuex data stores
 *
 * Setups the main store component and loads the various sub-module vuex stores
 * 
 * @file   Main include file for the Vuex data stores
 * @author <dan.khan@gmail.com>
 * @since  1.0.0
 * @copyright (c) 2022 All rights reserved.
 * 
 */

// Common includes used in this file
import Vue from 'nativescript-vue';
import Vuex from 'vuex';

// Import our store sub-modules
import CheckIn from '@/store/modules/CheckIn';
import LoginFrame from '@/store/modules/LoginFrame';
import SignUpFrame from '@/store/modules/SignUpFrame';

// Enable Vuex on the vue component
Vue.use(Vuex);

// Load up and configure the Vuex store
const store = new Vuex.Store({
    strict: true,
    modules: {
      CheckIn,
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
