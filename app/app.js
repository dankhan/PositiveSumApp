// Install VueDevTools plugin @see https://nativescript-vue.org/en/docs/getting-started/vue-devtools/
// import VueDevTools from 'nativescript-vue-devtools';
import Vue from 'nativescript-vue';

// Setup our router
import router from '~/router';

// Setup our start page
import App from './components/App';

// Setup VueDevTools - note run npx vue-devtools in browser to see vue-devtools (or npx -p nativescript-vue-devtools vue-devtools)tns 
if(global.TNS_ENV !== 'production') {
  // Vue.use(VueDevTools);
  // Vue.use(VueDevTools, { host: '192.168.1.42' }) // if using a real device, set ip to host machine or may not connect
}

// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (global.TNS_ENV === 'production');

// Set up prototypes to use throughout the app.
Vue.prototype.$router = router;
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
  render: (h) => h('frame', [h(App)]),
}).$start();
