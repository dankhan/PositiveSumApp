<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <GridLayout rows="90,auto" iosOverflowSafeArea="true" class="page-container">
        
        <!-- Top Nav-->
        <GridLayout row="0" columns="*,*,*" iosOverflowSafeArea="true" class="page-container">
            <Label col="0" class="" horizontalAlignment="center" :textWrap="true" text="Back" @tap="onBack" />
        </GridLayout>

        <StackLayout row="1" verticalAlignment="top" horizontalAlignment="center">
            <Label class="" row="1" horizontalAlignment="center" :textWrap="true" text="Help page: Forgotten password TODO:" />
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

        onBack() {
            this.$navigateBack(this.backNavOptions);
        },
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/theme-variables.scss';
</style>