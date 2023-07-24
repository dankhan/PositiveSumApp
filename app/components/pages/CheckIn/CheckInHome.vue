<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <DockLayout>
        <!-- Top Nav -->
        <TopNav dock="top" title="Check-In" :leftIsHomeButton="true" :rightIsHelpButton="true" rightRoute="checkInHelp" />
        
        <!-- Bottom container -->
        <GridLayout rows="auto, auto" columns="*" dock="bottom" verticalAlignment="bottom" marginLeft="20" marginRight="20" marginBottom="10">
            
            <!-- Empty list, show help and add button -->
            <StackLayout v-if="!checkInList.length">

                <!-- Help Button -->
                <GridLayout class="listButtonContainer" cols="*" @tap="onTapHelp">
                    <Image class="listbutton" width="26" height="26" stretch="aspectFit" src="res://icons_listbutton_help" />
                </GridLayout>

                <!-- Add Button -->
                <GridLayout class="listButtonContainer" cols="*" @tap="onTapAddPerson">
                    <Image class="listbutton" width="26" height="26" stretch="aspectFit" src="res://icons_listbutton_add" />
                </GridLayout>
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
            checkInList: [],
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

        onTapHome() {
            this.$goto('home', this.backNavOptions);
        },

        onTapHelp() {
            this.$goto('checkInHelp', this.navOptions);
        },

        async onTapAddPerson() {
            this.$goto('addPerson', this.navOptions);
        }
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';
</style>