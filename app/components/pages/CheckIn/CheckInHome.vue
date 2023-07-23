<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <DockLayout>
        <!-- Top Nav -->
        <GridLayout rows="26" columns="auto,*,auto" iosOverflowSafeArea="true" class="page-container" dock="top" marginLeft="20" marginRight="20" marginTop="20" marginBottom="10">
            <Image col="0" width="26" height="26" stretch="aspectFit" src="res://icons_home" marginRight="15" @tap="onTapHome" />
            <Label col="1" class="page-title" horizontalAlignment="center" text="Check-In"></Label>
            <Image col="2" width="26" height="26" horizontalAlignment="right" stretch="aspectFit" src="res://icons_help" marginLeft="15" @tap="onTapHelp" />
        </GridLayout>

        <!-- Bottom container -->
        <GridLayout rows="auto, auto" columns="*" dock="bottom" verticalAlignment="bottom" marginLeft="20" marginRight="20" marginBottom="10">
            
            <!-- Empty list, show help and add button -->
            <StackLayout v-if="!checkInList.length">

                <!-- Add Button -->
                <GridLayout class="listButtonContainer" cols="*" @tap="onTapAddPerson">
                    <Image class="listbutton" width="26" height="26" stretch="aspectFit" src="res://icons_listbutton_add" marginRight="15" />
                </GridLayout>
                
                <!-- Help Button -->
                <GridLayout class="listButtonContainer" cols="*" @tap="onTapHelp">
                    <Image class="listbutton" width="26" height="26" stretch="aspectFit" src="res://icons_listbutton_help" marginRight="15" />
                </GridLayout>
            </StackLayout>
        </GridLayout>
    </DockLayout>
  </Page>
</template>

<script>
export default {
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

        onTapAddPerson() {
            console.log('Add person TODO:');
        }
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';
.listButtonContainer {
    margin-top: 10;
}

</style>