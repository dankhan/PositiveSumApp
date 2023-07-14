<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <GridLayout rows="90,auto" iosOverflowSafeArea="true" class="page-container">
        
        <!-- Top Nav-->
        <GridLayout row="0" columns="*,*,*" iosOverflowSafeArea="true" class="page-container">
            <Label col="0" class="" horizontalAlignment="center" :textWrap="true" text="Close" @tap="onClose" />
            <Label col="1" class="" horizontalAlignment="center" :textWrap="true" text="Reset" />
        </GridLayout>

        <StackLayout row="1" verticalAlignment="top" horizontalAlignment="center">
            <Label class="" row="1" horizontalAlignment="center" :textWrap="true" text="Check Your Email TODO:" />
            <Label class="" :textWrap="true" marginTop="50" text="[Open Mail App]" @tap="onSubmit" />
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

    methods: {
        onPageLoaded(event) {
            // Set the Status bar style (light or dark based on the *page* content)
            event.object.page.statusBarStyle = 'light';
        },

        onClose() {
            this.$modal.close();
        },

        onSubmit() {
            this.$goto('changePassword', this.navOptions);
        },
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/theme-variables.scss';
</style>