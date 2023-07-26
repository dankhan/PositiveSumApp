// Setup vue framework
import Vue from 'nativescript-vue';

// Setup our router
import router from '~/router';

// Setup our VueX stores
import store from '~/store/index.js';

// Setup our start page
import App from './components/App';

// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (global.TNS_ENV === 'production');

// Import and register the animated gif plugin
Vue.registerElement('Gif', ()=> require('nativescript-gif').Gif);

// Import the IQKeyboardManager plugin to allow NS to auto scroll textfields into view when keyboard is onscreen
Vue.registerElement("PreviousNextView", () => require("@nativescript/iqkeyboardmanager").PreviousNextView);
Vue.registerElement("TextViewWithHint", () => require("@nativescript/iqkeyboardmanager").TextViewWithHint);

// Set up prototypes to use throughout the app.
Vue.prototype.$router = router;
Vue.prototype.$store = store;
Vue.prototype.$goto = function (to, options) {
  
  // Setup our default nav options
  const defaultOptions = { 
    transition: { 
      name: "slide",
      duration: 300,
      curve: "ease"
    },
  };

  // Overwrite default options with those passed in
  const mergedOptions = {...defaultOptions, ...options}
  this.$navigateTo(this.$router[to], mergedOptions);

  // Incase the caller wants to setup event handlers on the vue object, return the view object
  return this.$router[to];
}

// Setup the Vue Instance, passing in the App Component as start point
new Vue({
  store, render: (h) => h('frame', [h(App)]),
}).$start();
