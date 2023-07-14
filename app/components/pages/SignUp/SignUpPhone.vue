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
            <Label class="" row="1" horizontalAlignment="center" :textWrap="true" text="Sign Up - Enter Phone TODO:"></Label>
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
            this.$goto('signUpCheckPhone', this.navOptions);
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