<template>
    <!-- A Popup Frame to show the sign up content -->
    <Frame :id="frameId" @loaded="popupFrameLoaded">
        <SignUp :frame="frameId" :isPopover="true" />
    </Frame>
</template>

<script>
// External functions/modules used in this page
import { screen } from "@nativescript/core/platform";
import { Animation } from '@nativescript/core/ui/animation';

// Embedded pages
import SignUp from '~/components/pages/SignUp/SignUp';

export default {
    props: {
        // Sign Up page shown as a signup frame
        frameId: { type: String, default: 'default' },
    },
    
    computed: {
        popupFrameActivateCallback: {
            get() { return this.$store.getters['SignUpFrame/activateCallback']; },
            set(value) { this.$store.commit('SignUpFrame/SET_ACTIVATE_CB', value); },  
        },

        popupFrameDeactivatedCallback: {
            get() { return this.$store.getters['SignUpFrame/deactivatedCallback']; },
            set(value) { this.$store.commit('SignUpFrame/SET_DEACTIVATED_CB', value); },
        },

        closePopup: {
            get() { return this.$store.getters['SignUpFrame/closeCallback']; },
            set(value) { this.$store.commit('SignUpFrame/SET_CLOSE_CB', value); },
        },
        
        popupRoute: {
            get() { return this.$store.getters['SignUpFrame/currentRoute']; },
            set(value) { this.$store.commit('SignUpFrame/SET_CURRENT_ROUTE', value); },
        },

        popupVisible: {
            get() { return this.$store.getters['SignUpFrame/visible']; },
            set(value) { this.$store.commit('SignUpFrame/SET_VISIBLE', value); },
        },
    },

    data() {
        return {
            popupFrameView: undefined,
            popupAnimation: undefined,
        }
    },

    components: {
        SignUp,
    },

    mounted() {
        // Setup our popup panel callbacks
        this.popupFrameDeactivatedCallback = this.onPopupDeactivated;
        this.popupFrameActivateCallback = this.onPopupActivated;
    },

    methods: {
        popupFrameLoaded(event) {
            // Push frame offscreen to bottom until we need it
            this.popupFrameView = event.object;
            this.hidePopupFrame(false);            // don't animate
        },

        showPopupFrame(isVisible = true, animate = true) {
            // Work out new position
            const newY = isVisible ? 0 : screen.mainScreen.heightDIPs;
            
            if (!animate) {
                // Change Y immediately
                this.popupFrameView.translateY = newY;
            } else {
                // Animate change of Y
                
                // Cancel any playing animation
                if (this.popupAnimation && this.popupAnimation.isPlaying) {
                    this.popupAnimation.cancel();
                }

                // Setup an animation to bring the panel into/out of view
                const def1 = {
                    target: this.popupFrameView,
                    duration: 300,
                    translate: { x: 0, y: newY },
                    curve: 'ease',
                };
                
                // Set the new state if becoming visible so will immediately show contents (otherwise do afterwards)
                if (!isVisible) {
                    this.popupVisible = isVisible;
                }

                // Play the animation
                this.popupAnimation = new Animation([def1]);
                this.popupAnimation.play().then(() => {
                    this.popupVisible = isVisible;
                });
            }
        },

        hidePopupFrame(animate = true) {
            this.showPopupFrame(false, animate);
        },

        // When child component wishes to show the popup window, they raise an event with the route to load
        onPopupActivated(data = {}) {
            if (data.route && data.options && data.route !== this.popupRoute) {
                this.$goto(data.route, data.options);
                this.popupRoute = data.route;
            }

            // Show the popupFrame
            this.showPopupFrame();
        },

        // When child component wishes to close the popup window, we push it offscreen, and navigate the frame back to the route specified
        onPopupDeactivated(data = {}) {
            if (data.route && data.options && data.route !== this.popupRoute) {
                this.$goto(data.route, data.options);
                this.popupRoute = data.route;
            }

            // Child component can deactivate with no animation
            const animate = data.hasOwnProperty('animate') ? data.animate : true;

            // Hide the popup
            this.hidePopupFrame(animate);

            // Check if we have a close callback and call it
            if (this.closePopup instanceof Function) {
                this.closePopup();
            }
        },
    },
}
</script>

<style scoped />