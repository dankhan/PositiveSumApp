<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <GridLayout rows="90,auto" iosOverflowSafeArea="true" class="page-container">
        
        <!-- Top Nav-->
        <GridLayout row="0" columns="*,*,*" iosOverflowSafeArea="true" class="page-container">
            <Label col="0" class="" horizontalAlignment="center" :textWrap="true" text="Close" @tap="onClose"></Label>
            <Label col="1" class="" horizontalAlignment="center" :textWrap="true" text="Help"></Label>
        </GridLayout>

        <StackLayout row="1" verticalAlignment="top" horizontalAlignment="center">
            <Label class="" row="1" horizontalAlignment="center" :textWrap="true" text="Change Password TODO:"></Label>
            <Label class="" :textWrap="true" marginTop="50" text="[Change Password]" @tap="onSubmit"></Label>
            <Label class="" :textWrap="true" marginTop="50" text="unsure how to choose a strong password?"></Label>
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
        navOptions() {
            return { frame: this.frame, clearHistory: true, backstackVisible: true, transition: { name: "slideLeft", duration: 300, curve: "ease" }, props: { isPopover: this.isPopover, frame: this.frame, 'fromChangePassword': true } }
        },
    },

    methods: {
        onPageLoaded(event) {
            // Set the Status bar style (light or dark based on the *page* content)
            event.object.page.statusBarStyle = 'light';
        },

        onClose() {
            this.$modal.close();
        },

        onSubmit() {
            this.$goto('login', this.navOptions);
        },
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/theme-variables.scss';
</style>