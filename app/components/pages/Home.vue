<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <GridLayout rows="90,auto" iosOverflowSafeArea="true" class="page-container">
        
        <!-- Top Nav-->
        <GridLayout row="0" columns="*,*,*" iosOverflowSafeArea="true" class="page-container">
            <Label col="0" class="" horizontalAlignment="center" :textWrap="true" text="Home"></Label>
            <Label col="1" class="" horizontalAlignment="center" :textWrap="true" text="+Σ"></Label>
            <Label col="2" class="" horizontalAlignment="center" :textWrap="true" text="Profile"></Label>
        </GridLayout>

        <StackLayout row="1" verticalAlignment="top" horizontalAlignment="center">
            <Label class="" horizontalAlignment="center" :textWrap="true" text="Home page TODO:"></Label>
        </StackLayout>        
    </GridLayout>
  </Page>
</template>

<script>
export default {
    props: {
        fromLogin: { type: Boolean, default: false },
        fromSignUp: { type: Boolean, default: false },
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
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/theme-variables.scss';
</style>