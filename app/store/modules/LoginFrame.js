// Base imports
import Vue from "nativescript-vue";
import Vuex from 'vuex';

// Setup vue storage instance
Vue.use(Vuex);

// Setup our mutation names
const SET_ACTIVATE_CB = 'SET_ACTIVATE_CB';
const SET_DEACTIVATED_CB = 'SET_DEACTIVATED_CB';
const SET_CLOSE_CB = 'SET_CLOSE_CB';
const SET_CURRENT_ROUTE = 'SET_CURRENT_ROUTE';
const SET_VISIBLE = 'SET_VISIBLE';

const LoginFrame = {
  namespaced: true,
  
  state: {
    activateCallback: null,
    deactivatedCallback: null,
    closeCallback: null,
    currentRoute: null,
    visible: null,
  },

  mutations: {
    SET_ACTIVATE_CB(state, activateCallback) {
      state.activateCallback = activateCallback;
    },

    SET_DEACTIVATED_CB(state, deactivatedCallback) {
      state.deactivatedCallback = deactivatedCallback;
    },

    SET_CLOSE_CB(state, closeCallback) {
      state.closeCallback = closeCallback;
    },

    SET_CURRENT_ROUTE(state, currentRoute) {
      state.currentRoute = currentRoute;
    },

    SET_VISIBLE(state, visible) {
      state.visible = visible;
    },
  },
  
  getters: {
    activateCallback(state) {
      return state.activateCallback;
    },
    
    deactivatedCallback(state) {
      return state.deactivatedCallback;
    },

    closeCallback(state) {
      return state.closeCallback;
    },
    
    currentRoute(state) {
      return state.currentRoute;
    },

    visible(state) {
      return state.visible;
    },
  },
  
  actions: {
    setActivateCallback({ commit }, activateCallback) {
      commit(SET_ACTIVATE_CB, activateCallback);
    },
    
    setDeactivatedCallback({ commit }, deactivatedCallback) {
        commit(SET_DEACTIVATED_CB, deactivatedCallback);
    },

    setClosedCallback({ commit }, closeCallback) {
      commit(SET_CLOSE_CB, closeCallback);
    },

    setCurrentRoute({ commit }, currentRoute) {
      commit(SET_CURRENT_ROUTE, currentRoute);
    },

    setVisible({ commit }, visible) {
      commit(SET_VISIBLE, visible);
    },
  },
};

// Make this available to other callers
export default LoginFrame;
