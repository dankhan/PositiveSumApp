<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <DockLayout>
        <!-- Top Nav -->
        <TopNav dock="top" title="Your Check-Ins" :leftIsBackButton="true" :rightIsHelpButton="true" rightRoute="yourCheckInsHelp" />

        <!-- Bottom container -->
        <GridLayout ref="grid" dock="bottom" rows="auto,auto" columns="*" :verticalAlignment="isLoading ? 'middle' : 'bottom'" marginLeft="20" marginRight="20" marginBottom="10">
            <!-- Show error or loading page -->
            <ConnectIndicator :iconType="indicatorType" :isLoading="isLoading" @tap="fetchYourCheckInList" />
                
            <!-- Render the group list -->
            <ListView for="item in combinedList" key="listview" separatorColor="transparent" :height="listViewHeight" v-if="!isLoadingError" ref="listview" @itemLoading="onListViewItemLoading">
                <v-template>
                    <GridLayout class="listButtonContainer" columns="*,auto,auto" @tap="onTapItem(item)">
                        <label col="0" class="listbutton" :text="item.from.name" marginLeft="5"></label>
                        
                        <!-- Notify Icon -->
                        <label col="1" class="notifytext" :text="item.notify"></label>

                        <!-- Group/Chevron Icon -->
                        <Image col="2" class="chevron" src="res://icons_button_chevron_right" width="26" height="26" stretch="aspectFit" marginRight="10"></Image>
                    </GridLayout>
                </v-template>
            </ListView>
        </GridLayout>
    </DockLayout>
  </Page>
</template>

<script>
// In-page components
import TopNav from '~/components/widgets/TopNav';
import ConnectIndicator from '~/components/widgets/ConnectIndicator';
import ProgressBarButton from '~/components/widgets/ProgressBarButton';

// Common includes used in this page
import { screen } from "@nativescript/core/platform";
import { mapGetters } from 'vuex';

// API Services
import CheckInAPIService from '@/services/CheckInAPIService';

// Import our custom errors
import NoResponseAPIError from '@/errors/noresponseapierror';
import { getResponseErrorMessage } from '@/common/https';

export default {
    components: {
        TopNav,
        ConnectIndicator,
        ProgressBarButton,
    },
    
    data() {
        return {
            isLoading: false,
            apiError: false,
            connectError: false,
            errorMessage: '',

            isItemError: false,
        }
    },

    computed: {
        backNavOptions() {
            return { transition: { name: "slideRight", duration: 300, curve: "ease" }}
        },
        
        navOptions() {
            return { transition: { name: "slideLeft", duration: 300, curve: "ease" }}
        },

        combinedList() {
            const yourCheckIns = JSON.parse(JSON.stringify(this.yourCheckIns(this.userId)));           // use json for deep copy so we don't change underlying store data
            if (yourCheckIns.length) {
                // We lookup each person's name from the contact store
                let checkIns = yourCheckIns.map( x => {
                    // Add the to/from name for our user id
                    /*if (x.to && x.to.userId && Number(x.to.userId) === Number(this.userId)) {
                        x.to.name = this.userName;
                    }
                    if (x.from && x.from.userId && Number(x.from.userId) === Number(this.userId)) {
                        x.from.name = this.userName;
                    }*/
                    
                    // Lookup the person details from personId in the to/from field from the contact store
                    /*if (x.to && x.to.personId && Number(x.to.personId) > 0) {
                        const person = this.person(Number(x.to.personId));
                        x.to = {...x.to, ...person};
                    }
                    if (x.from && x.from.personId && Number(x.from.personId) > 0) {
                        const person = this.person(Number(x.from.personId));
                        x.from = {...x.from, ...person};
                    }*/

                    if (x.from && x.from.personId && Number(x.from.personId) > 0) {
                        const person = this.person(Number(x.from.personId));
                        x.from = {...x.from, ...person};
                    }

                    return x;
                });

                console.info(checkIns);
            
                // Sort the list by the due date, showing most due at the bottom of the list for easy access
                if (checkIns.length > 1) {
                    checkIns.sort((a, b) => parseInt(b.time) - parseInt(a.time));
                }

                return checkIns;
            } else {
                return [];
            }
        },

        listViewHeight() {
            const itemHeight = 54; // 44 + 10 padding-top
            const topNavHeight = this.$refs.topnav && this.$refs.topnav.nativeView ? this.$refs.topnav.nativeView.getMeasuredHeight() / screen.mainScreen.scale : 0;
            const containerHeight = screen.mainScreen.heightDIPs - topNavHeight;

            // Get list of height and if bigger than container, set container to max height
            const listHeight = this.combinedList.length * itemHeight;
            const height = listHeight >= containerHeight ? '100%' : listHeight;
            
            return height;
        },

        isLoadingError() {
            return this.isLoading || this.apiError || this.connectError;
        },

        indicatorType() {
            if (this.connectError) return 'connecterror';
            if (this.apiError) return 'fetcherror';
            return '';
        },

        // Map our Vuex getters
        ...mapGetters({
            userId: 'User/userId',
            userName: 'User/name',
            yourCheckIns: 'CheckIns/yourCheckIns',
            person: 'Contacts/person',
        }),
    },

    beforeMount() {
        // this.fetchYourCheckInList();
    },

    mounted() {
        // scroll to the bottom of the listview
        setTimeout(() => this.scrollToBottom(), 200);
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
            this.$goto('checkInHomeHelp', this.navOptions);
        },

        onTapItem(item) {
            const navOptions = {...this.navOptions, props: { item }}
            this.$goto('checkIn', navOptions);
        },

        async onTapAddPerson() {
            this.$goto('addPerson', this.navOptions);
        },

        scrollListView(position) {
            if (this.$refs.listview) {
                    if (this.$refs.listview.nativeView && this.$refs.listview.nativeView.ios) {
                    this.$refs.listview.nativeView.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(
                        NSIndexPath.indexPathForItemInSection(position, 0),
                        UITableViewScrollPosition.UITableViewScrollPositionTop,
                        true
                    );
                } else {
                    this.$refs.listview.nativeView.scrollToIndex(position);
                }
            }
        },

        scrollToBottom() {
            if (this.combinedList.length) {
                return this.scrollListView(this.combinedList.length ? this.combinedList.length-1 : 0);
            }
        },

        fetchYourCheckInList() {
            this.isLoading = true;
            this.connectError = false;
            this.apiError = false;

            // Fetch the checkin list from the server
            /*CheckInAPIService.yourCheckIns(this.userId)
            .then( (response) => {
                if (!response || !response.message) {
                    throw new NoResponseAPIError();
                }

                // Make sure our expected fields are in the response
                if (!response.yourCheckIns) {
                    throw 'There was a problem fetching your data, please try again later';
                }

                // Fields will be available in our Vuex getters

                // Reset error flags
                this.isLoading = false;
                this.connectError = false;
                this.apiError = false;

                // scroll to the bottom of the listview
                setTimeout(() => this.scrollToBottom(), 200);
            })
            .catch( (error) => {
                // Show error message
                this.isLoading = false;
                this.connectError = false;
                this.apiError = true;
                
                // Extract any error message/data from the error
                const errorData = getResponseErrorMessage(error);
                this.errorMessage = errorData.message;
                this.connectError = errorData.connectError;
            });*/
        },

        onListViewItemLoading(args) {
            // We remove the selected item background color on load
            if (global.isIOS) {
                const cell = args.ios;
                cell.selectionStyle = UITableViewCellSelectionStyle.UITableViewCellSelectionStyleNone;
            }
        },
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';

.listButtonContainer .notifytext {
    width: 30;
    height: 24;
    padding: 5 10 5 10;
    margin-right: 10;
    border-radius: 3;
    color: $color-listbutton;
    background-color: $color-listbutton-notify-background;
    font-size: $font-size-small;
    text-align: center;
}
</style>