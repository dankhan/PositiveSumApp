<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <GridLayout rows="*,2*,*" iosOverflowSafeArea="true">

        <!-- heading and blurb -->   
        <StackLayout row="1" verticalAlignment="top" horizontalAlignment="center">
            <!-- heading -->
            <Label :textWrap="false" class="heading" text="Positive Sum +Σ" />

            <!-- blurb -->
            <Label marginTop="40" :textWrap="true" class="heading-blurb" text="+Σ is a peer-support network of startups, innovators, and community-builders, who are committed to help each other grow by sharing their knowledge, networks, & know-how to help each other succeed." />
        </StackLayout>

        <!-- Buttons and links -->   
        <StackLayout row="2" verticalAlignment="top" horizontalAlignment="center">
            <!-- Sign up link -->
            <Label class="link" marginTop="25" text="Sign Up" @tap="onTapSignUp" />

            <!-- login link -->
            <Label class="link" marginTop="25" text="Login" @tap="onTapLogin" />
        </StackLayout>
    </GridLayout>
  </Page>
</template>

<script>
import { Page } from '@nativescript/core/ui/page';

// In-page components
import LoginFrame from "~/components/frames/LoginFrame";
import SignUpFrame from "~/components/frames/SignUpFrame";

export default {
    /*components: {
        LoginFrame,
        SignUpFrame,
    },*/

    data() {
        return {
            // LoginFrame - save any replaced callbacks so we can reset state when leaving page
            // oldPopupActivateCb: null,
            // oldPopupDeactivateCb: null,
            loginFrameName: 'Start_LoginFrame',
            signupFrameName: 'Start_SignUpFrame',
        }
    },

    /*computed: {
        loginFrameActivateCallback: {
            get() { return this.$store.getters['LoginFrame/activatePopoverCallback']; },
            set(value) { this.$store.commit('LoginFrame/SET_ACTIVATE_POPOVER_CB', value); },  
        },

        loginFrameDeactivatedCallback: {
            get() { return this.$store.getters['LoginFrame/deactivatePopoverCallback']; },
            set(value) { this.$store.commit('LoginFrame/SET_DEACTIVATE_POPOVER_CB', value); },
        },
    },*/

    mounted() {
        // Attach a page unload handler so we can reinstate the popup window callbacks
        //this.nativeView.page.on(Page.navigatingFromEvent, this.onPageUnload);
    },

    beforeDestroy() {
        // Remove the page unload handler
       // this.nativeView.page.off(Page.navigatingFromEvent, this.onPageUnload);
    },
    
    methods: {
        onPageLoaded(event) {
            // Set the Status bar style (light or dark based on the *page* content)
            event.object.page.statusBarStyle = 'dark';
        },

        // The LoginFrame is activated
        /*onChangePopupActivateCb(oldCb) {
            // Save the old callback so we can reattach on navigate away
            if (oldCb) {
                this.oldPopupActivateCb = oldCb;
            } 
        },

        // The LoginFrame is deactivated
        onChangePopupDeactivateCb(oldCb) {
            // Save the old callback so we can reattach on navigate away
            if (oldCb) {
                this.oldPopupDeactivateCb = oldCb;
            }
        },

        onPageUnload() {        
            // Reset the original popup window callbacks
            if (this.oldPopupActivateCb) {
                this.loginFrameActivateCallback = this.oldPopupActivateCb;
            }

            if (this.oldPopupDeactivateCb) {
                this.loginFrameDeactivatedCallback = this.oldPopupDeactivateCb;
            }
        },*/

        onTapLogin() {
            this.$showModal(LoginFrame, { fullscreen: true, props: { isPopover: true, frame: this.loginFrameName } });
        },

        onTapSignUp() {
            this.$showModal(SignUpFrame, { fullscreen: true, props: { isPopover: true, frame: this.signupFrameName } });
        },
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/theme-variables.scss';
/*Page {
  background-image: url('~/assets/images/main-background.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}*/

/*.heading {
  text-align: center;
  color: $color-heading;
  font-size: $font-size;
  font-family: $font-family-semibold;
  font-weight: $font-weight-semibold;
  margin-left: $main-container-margin + 25;
  margin-right: $main-container-margin + 25;
  line-height: 5;
}*/

/*.heading-blurb {
    text-align: center;
    color: $color-heading-blurb;
}*/


/*.link {
  text-align: center;
  color: $color-hyperlink;
  font-size: $font-size;
  font-family: $font-family;
  font-weight: $font-weight;
}*/
</style>