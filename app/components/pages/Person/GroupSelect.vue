<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <DockLayout>
        <!-- Top Nav -->
        <TopNav dock="top" title="Add To Group" :leftIsCloseButton="true" :modalData="modalData" />

        <!-- Bottom container -->
        <GridLayout rows="auto, auto" columns="*" dock="bottom" verticalAlignment="bottom" marginLeft="20" marginRight="20" marginBottom="10">
            <StackLayout>
                <Label class="paragraph" text="TODO: AddToGroup"></Label>
                <Label class="paragraph" text="TODO: Return user groups list on close"></Label>
            </StackLayout>
        </GridLayout>
    </DockLayout>
  </Page>
</template>

<script>
// In-page components
import TopNav from '~/components/widgets/TopNav';

export default {
    components: {
        TopNav,
    },
    
    data() {
        return {
            groupsList: [],
        }
    },

    computed: {
        backNavOptions() {
            return { transition: { name: "slideRight", duration: 300, curve: "ease" } }
        },
        
        navOptions() {
            return { transition: { name: "slideLeft", duration: 300, curve: "ease" } }
        },
    },

    methods: {
        onPageLoaded(event) {
            // Set the Status bar style (light or dark based on the *page* content)
            event.object.page.statusBarStyle = 'dark';
        },
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';
</style>