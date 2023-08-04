/**
 * Vuex storage for authentication-related data storage
 *
 * Corresponding getters, mutators, and actions for modifying this local data store
 * 
 * Notes:
 * 
 * We manage our our JWT access tokens to our own API server.
 * 
 * Login will send back two tokens, a short-lived accessToken and longer lived refreshToken
 * 
 * When the accessToken is nearly expired, it will auto request a refresh request to generate new tokens
 * 
 * Also, whenever a request is made and the APi reports that the token is expired, it will automatically
 * Try to refresh the accessToken by posting the refreshToken (and email as an identifier) before
 * retrying the original request.  
 * 
 * Local vuex state tracks whether the login is to be remembered, in which case the tokens (and email as
 * identifier for refresh request) is saved to local storage, encoded as base64 for simple obfuscation
 * 
 * @file   Vuex data store for authentication data
 * @author LeanCTO
 * @since  1.0.0
 * @copyright (c) 2022 All rights reserved.
 * 
 */

// Imports used in this module
import jwtDecode from 'jwt-decode';
import AuthAPI from '@/services/AuthAPIService';

// Setup our localstorage key name
const LOCAL_STORAGE_KEY_TOKENS = '_t';

// Setup our permission constants
const PERMISSION_ADMIN = 1000;

// Setup the default state
const getDefaultState = () => {
    return {
        // Flag to tell us if the user details are valid/expired/initialised from local storage
        isInitialised: false,
        isValid: false,
        isExpired: false,

        // Auth tokens (email is used for the refresh request so we store it along with other auth tokens)
        authTokens: {
            accessToken: '',
            refreshToken: '',
            email: '',
        },

        // Whether we're saving to localstorage
        rememberMe: false,
    };
};

// Setup the store mutations
const mutations = {
    SET_INITIALISED(state, isInitialised) {
        state.isInitialised = isInitialised;
    },

    SET_VALID(state, isValid) {
        state.isValid = isValid;
    },
    
    SET_EXPIRED(state, isExpired) {
        state.isExpired = isExpired;
    },
      
    SET_TOKENS: (state, { accessToken, refreshToken, email }) => {
        state.authTokens.accessToken = accessToken;
        state.authTokens.refreshToken= refreshToken;
        state.authTokens.email = email;

        // If remember me, we save the data to local storage
        if (state.rememberMe) {
            // Pass thru simple base64 encoder for obfuscation
            const json = JSON.stringify({ accessToken, refreshToken, email });
            const b64 = json ? btoa(json) : null;
            if (b64) {
                localStorage.setItem(LOCAL_STORAGE_KEY_TOKENS, b64);
            }
        }
    },
    
    SET_REMEMBER_ME: (state, rememberMe) => {
        state.rememberMe = rememberMe;

        // If remember me, we save the data to local storage or remove it
        if (rememberMe) {
            // Pass thru simple base64 encoder for obfuscation
            const json = JSON.stringify(state.tokens);
            const b64 = json ? btoa(json) : null;
            if (b64) {
                localStorage.setItem(LOCAL_STORAGE_KEY_TOKENS, b64);
            }
        } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY_TOKENS);
        }
    },

    RESET: state => {
        // Reset the state
        Object.assign(state, getDefaultState());

        // Remove any saved details from local storage
        localStorage.removeItem(LOCAL_STORAGE_KEY_TOKENS);
    },
};

// Setup our getters
const getters = {
    isInitialised(state) {
        return state.isInitialised;
    },

    isValid(state) {
        return state.isValid;
    },

    isExpired(state) {
        return state.isExpired;
    },
      
    accessToken: state => {
        return state.authTokens && state.authTokens.accessToken ? state.authTokens.accessToken : '';
    },

    refreshToken: state => {
        return state.authTokens && state.authTokens.refreshToken ? state.authTokens.refreshToken : '';
    },

    email: state => {
        return state.authTokens && state.authTokens.email ? state.authTokens.email : '';
    },

    rememberMe: state => {
        return state.rememberMe ? true : false;
    },

    isLoggedIn: state => {
        return state.isInitialised && state.isValid && !state.isExpired && state.authTokens.accessToken.length > 0;
    },

    isAdmin: state => {
        if (!state.authTokens || !state.authTokens.accessToken || !state.isInitialised || !state.isValid || state.isExpired) {
            return false;
        } else {
            // We always check admin permission from the encoded accessToken to ensure the local Vuex state hasn't been modified in local storage
            const decoded = jwtDecode(state.authTokens.accessToken);
            if (decoded.data.user?.permission && parseInt(decoded.data.user.permission) === PERMISSION_ADMIN) {
                return true;
            }
        }
        return false;
    },
};

// Setup our actions
const actions = {
    /*
     * function initialise()
     *
     * Checks the localStorage and refreshes the state, refreshing the accessToken if required
     * What we're accounting for is the instance of a reload, because up until then the
     * user object will be present if they've already logged in. So if an accessToken is
     * present let's set the user object and their access/refresh tokens from the localstorage
     */
    async initialise({ dispatch, commit, getters }) {
        // Bounce if already initialised
        if (getters.initialised) return Promise.resolve();

        // No need to be initialised again (e.g. through router)
        commit('SET_INITIALISED', true);
          
        // If the auth tokens are available in localstorage, then we're getting a remembered login
        // Pass thru simple base64 decoder for obfuscation
        const b64 = localStorage.getItem(LOCAL_STORAGE_KEY_TOKENS);
        const json = b64 ? atob(b64) : null;
        const tokens = json ? JSON.parse(json) : null;
        const accessToken = tokens && tokens.accessToken ? tokens.accessToken : null;

        // Check if we're remembering the login
        const rememberMe = accessToken && accessToken.length > 0;

        // decode the token and check if it's valid and not expired
        if (rememberMe) {
            // Decode the JWT access token
            const decoded = jwtDecode(accessToken);

            // Make sure the token is still valid and not expired
            const isValid = AuthAPI.validateToken(decoded);
            const isExpired = AuthAPI.validateTokenExpiry(decoded);

            // Save these parameters
            commit('SET_VALID', isValid);
            commit('SET_EXPIRED', isExpired);
            
            // Set the tokens in scope
            try {
                // Always take the user data from the decoded token if available
                const user = decoded.data && decoded.data.user ? decoded.data.user : null;

                // Setup the current state with these saved values
                dispatch('Login', { tokens, user, rememberMe })
                    .then(() => {
                        // We attempt to refresh any expired tokens and logout any invalid tokens
                        if (accessToken) {
                            if (isExpired) {
                                const refreshRequest = AuthAPI.refreshAuthTokens();
                                refreshRequest.then((response) => {
                                    dispatch('Login', {
                                        tokens: {
                                            accessToken: response.data.accessToken,
                                            refreshToken: response.data.refreshToken,
                                            email: user.email,
                                        },
                                        user,
                                        rememberMe,
                                    });

                                    return Promise.resolve();
                                }).catch(() => {
                                    dispatch('Logout');
                                });
                            } else if (!isValid) {
                                dispatch('Logout');
                            }
                        }
                    });
            } catch (e) {
                return Promise.reject();
            }
        }
  
        return Promise.resolve();
    },
    
    /*
     * function Login()
     *
     * Set the state to login a user
     */
    Login: ({ commit, dispatch }, { tokens, user, rememberMe }) => {
        commit('SET_REMEMBER_ME', rememberMe);
        commit('SET_TOKENS', tokens);
        
        // Update the user in the user store
        commit('User/SET_USER', user, { root: true });

        // Decode the access token and check it's valid
        const accessToken = tokens && tokens.accessToken ? tokens.accessToken : null;
        const decoded = jwtDecode(accessToken);

        // Make sure the token is still valid and not expired
        const isValid = AuthAPI.validateToken(decoded);
        const isExpired = AuthAPI.validateTokenExpiry(decoded);

        // Save these parameters
        commit('SET_VALID', isValid);
        commit('SET_EXPIRED', isExpired);
        
        // Set accesstoken in auth header
        if (tokens.accessToken && tokens.accessToken !== '') {
            AuthAPI.setAuthHeader(tokens.accessToken);
        }

        // We set a timeout 10 minutes before expiry date to auto refresh tokens
        if (decoded.exp) {
            const minsBeforeExpiry = process.env.VUE_APP_AUTH_AUTO_REFRESH_MINS_BEFORE_EXPIRY;
            const beforeTime = decoded.exp - (minsBeforeExpiry * 60);
            const curMins = (decoded.exp - Math.floor(Date.now() / 1000)) / 60;
            const refreshTime = curMins <= minsBeforeExpiry ? 1000 : (beforeTime - Math.floor(Date.now() / 1000)) * 1000;
  
            // Clear any existing refresh timer
            if (AuthAPI.autoRefreshTimeout) {
                clearTimeout(AuthAPI.autoRefreshTimeout);
            }
  
            // Setup a new timeout if we've not expired already
            if (minsBeforeExpiry > 0) {
                AuthAPI.autoRefreshTimeout = setTimeout(async () => {
                    const auto = true;
                    let refreshRequest = AuthAPI.refreshAuthTokens(auto);
                    refreshRequest.then((response) => {
                    // Set valid payload - note will continually recurse if minsBeforeExpiry is too
                    // small compared to token expiry
                    dispatch('Login', {
                        tokens: {
                            accessToken: response.data.authTokens.accessToken,
                            refreshToken: response.data.authTokens.refreshToken,
                            email: response.data.user.email,
                        },
                        user: response.data.user,
                        rememberMe,
                    });
    
                    refreshRequest = null;
                    }).catch(() => {
                    refreshRequest = null;
                    });
                }, refreshTime);
            }
        }
    },
    
    /*
     * function Logout()
     *
     * Set the state to logout the user (reset the state & local storage)
     */
    Logout: ({ commit }) => {
        // Reset the state
        commit('RESET');

        // Reset the saved user state also
        commit('User/RESET', null, { root: true })

        // Clear auth header
        AuthAPI.setAuthHeader(null);
    },
};

export default {
    namespaced: true,
    state: getDefaultState(),
    mutations,
    getters,
    actions,
};