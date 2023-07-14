<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <GridLayout rows="90,auto" iosOverflowSafeArea="true" class="page-container">
        
        <!-- Top Nav-->
        <GridLayout row="0" columns="*,*,*" iosOverflowSafeArea="true" class="page-container">
            <Label col="0" class="" horizontalAlignment="center" :textWrap="true" text="Close" @tap="onClose"></Label>
            <Label col="1" class="" horizontalAlignment="center" :textWrap="true" text="Sign Up"></Label>
            <Label col="2" class="" horizontalAlignment="center" :textWrap="true" text="Help" @tap="onHelp"></Label>
        </GridLayout>

        <StackLayout row="1" verticalAlignment="top" horizontalAlignment="center">
            <Label class="" row="1" horizontalAlignment="center" :textWrap="true" text="Check Your Phone TODO:"></Label>
            <Label class="" :textWrap="true" marginTop="50" text="[Next]" @tap="onSubmit"></Label>
        </StackLayout>        
    </GridLayout>
  </Page>
</template>

<script>
export default {
    props: {
      // Login page shown as a login frame
        isPopover: { type: Boolean, default: false },
        frame: { type: String, default: 'default' },
    },
    
    data() {
        return {
        }
    },

    computed: {
        backNavOptions() {
            return { frame: this.frame, transition: { name: "slideRight", duration: 300, curve: "ease" }, props: { isPopover: this.isPopover, frame: this.frame } }
        },
      
        navOptions() {
            return { frame: this.frame, transition: { name: "slideLeft", duration: 300, curve: "ease" }, props: { isPopover: this.isPopover, frame: this.frame } }
        },
    },

    methods: {
        onPageLoaded(event) {
            // Set the Status bar style (light or dark based on the *page* content)
            event.object.page.statusBarStyle = 'light';
        },

        onHelp() {
            this.$goto('signUpHelp', this.navOptions);
        },
        
        onSubmit() {
            // Show loading screen as the dashboard takes a little while to load
            this.loadingDashboard = true;

            // Reset submit state
            this.isSubmit = false;

            // Redirect to Dashboard, give a little time to show the loading page
            setTimeout(() => {
                setTimeout( () => this.$goto('home', { clearHistory: true, backstackVisible: true, props: { 'fromSignUp': true }} ), 50);
            }, 50);
        },

        onClose() {
            this.$modal.close();
        }
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/theme-variables.scss';
</style>