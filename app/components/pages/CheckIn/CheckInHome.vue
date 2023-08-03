<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <DockLayout>
        <!-- Top Nav -->
        <TopNav ref="topnav" dock="top" title="Check-In" :leftIsHomeButton="true" :rightIsHelpButton="true" rightRoute="checkInHelp" />

        <!-- Bottom container -->
        <GridLayout ref="grid" dock="bottom" rows="auto,auto" columns="*" :verticalAlignment="isLoading ? 'middle' : 'bottom'" marginLeft="20" marginRight="20" marginBottom="10">
            <!-- Show error or loading page -->
            <ConnectIndicator :iconType="indicatorType" :isLoading="isLoading" @tap="fetchList" />
            <ListView for="item in combinedList" separatorColor="transparent" :height="listViewHeight" ref="listview" v-if="!isLoadingError" @itemLoading="onListViewItemLoading">
                <!-- User -->
                <v-template if="item.type == 'user'">
                    <ProgressBarButton :text="item.userName" :isError="isItemError" :item="item" :onLongPress="onLongPressItem" successMessage="Check-in sent!" errorMessage="Could not send check-in" />
                </v-template>

                <!-- Help Button -->
                <v-template if="item.type == 'help'">
                    <GridLayout class="listButtonContainer" cols="*" @tap="onTapHelp">
                        <Image class="listbutton" width="26" height="26" stretch="aspectFit" src="res://icons_listbutton_help" />
                    </GridLayout>
                </v-template>

                <!-- Add Button -->
                <v-template if="item.type == 'add'">
                    <GridLayout class="listButtonContainer" cols="*" @tap="onTapAddPerson">
                        <Image class="listbutton" width="26" height="26" stretch="aspectFit" src="res://icons_listbutton_add" />
                    </GridLayout>
                </v-template>
            </ListView>

            <!-- Show memo line -->
            <label row="1" class="memo" text="Long-tap to check-in, tap to view, notify icon to reply" v-if="showMemo"></label>
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
import BadMethodAPIError from '@/errors/badmethodapierror';
import BadRequestAPIError from '@/errors/badrequestapierror';
import InternalServerAPIError from '@/errors/internalserverapierror';
import NoResponseAPIError from '@/errors/noresponseapierror';
import AuthenticationAPIError from '@/errors/authenticationapierror';
import UnsupportedMediaAPIError from '@/errors/unsupportedmediaapierror';

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
            return { transition: { name: "slideRight", duration: 300, curve: "ease" } }
        },
        
        navOptions() {
            return { transition: { name: "slideLeft", duration: 300, curve: "ease" } }
        },

        showMemo() {
            return this.userList.length || this.groupList.length;
        },

        combinedList() {
            // Generate a combined list of items for rendering including buttons and groups
            let list = [];
            if (!this.userList.length && !this.groupList.length) {
                list.push({ type: 'help' });
            }

            // Now we add a "user" type to all users in the user list
            let users = this.userList.map( x => {
                x.type = 'user';
                return x
            });

            // Merge the user list
            if (users) {
                list = [...list, ...users];
            }

            // Always add the add button
            list.push({ type: 'add' });

            return list;
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
            userId: 'CheckIn/userId',
            yourCheckIns: 'CheckIn/yourCheckIns',
            userList: 'CheckIn/userList',
            groupList: 'CheckIn/groupList',
        }),
    },

    beforeMount() {
        this.fetchList();
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
            this.$goto('checkInHelp', this.navOptions);
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
            return this.scrollListView(this.combinedList.length ? this.combinedList.length-1 : 0);
        },

        fetchList() {
            this.isLoading = true;
            this.connectError = false;
            this.apiError = false;

            // Fetch the checkin list from the server
            CheckInAPIService.list(this.userId)
            .then( (response) => {
                // If the server was unreachable or timed out, the request is cancelled and goes into the then handler - trap this as a NoResponseAPIError
                if (!response || !response.message) {
                    throw new NoResponseAPIError();
                }

                // Make sure our expected fields are in the response
                if (!response.checkin) {
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
                if (error instanceof NoResponseAPIError ) {
                    this.errorMessage = 'We couldn\'t contact the server. Please check your Internet connection or try again later.';
                    this.connectError = true;
                } else if (error instanceof UnsupportedMediaAPIError) {
                    this.errorMessage = 'We encountered a server problem, please try again later';
                } else if (error instanceof BadMethodAPIError) {
                    this.errorMessage = 'We encountered a technical problem, please try again later';
                } else if (error instanceof BadRequestAPIError) {
                    this.errorMessage = 'We encountered a problem, please try again later';
                } else if (error instanceof AuthenticationAPIError) {
                    this.errorMessage = 'We encountered an authentication problem, please logout and try again';
                } else if (error instanceof InternalServerAPIError) {
                    this.errorMessage = 'We encountered a server problem, please try again later';
                } else {
                    this.errorMessage = 'There was a problem, please try again later';
                }

                // Show error message
                this.isLoading = false;
                this.connectError = false;
                this.apiError = true;
            });
        },

        onListViewItemLoading(args) {
            // We remove the selected item background color on load
            if (global.isIOS) {
                const cell = args.ios;
                cell.selectionStyle = UITableViewCellSelectionStyle.UITableViewCellSelectionStyleNone;
            }
        },

        onLongPressItem(data) {
            return new Promise((resolve, reject) => {
                try {
                    //throw ('Error');
                    console.log("success", data);
                    resolve({ data });
                } catch (e) {
                    throw(e);
                }
            });
        },
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';

.listButtonContainer {
    padding: 0;
}
</style>