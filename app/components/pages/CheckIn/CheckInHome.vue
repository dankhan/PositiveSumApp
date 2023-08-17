<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <DockLayout>
        <!-- Top Nav -->
        <TopNav ref="topnav" dock="top" title="Check-In" :leftIsHomeButton="true" :rightIsHelpButton="true" rightRoute="checkInHomeHelp" />

        <!-- Bottom container -->
        <GridLayout ref="grid" dock="bottom" rows="auto,auto" columns="*" :verticalAlignment="isLoading ? 'middle' : 'bottom'" marginLeft="20" marginRight="20" marginBottom="10">
            <!-- Show error or loading page -->
            <ConnectIndicator :iconType="indicatorType" :isLoading="isLoading" @tap="fetchList" />

            <!-- Render the item list -->
            <ListView for="item in combinedList" separatorColor="transparent" :height="listViewHeight" ref="listview" v-if="!isLoadingError" @itemLoading="onListViewItemLoading">
                <!-- User -->
                <v-template if="item.type == 'user'">
                    <ProgressBarButton :text="item.userName" :isError="isItemError" :item="item" :onLongPress="onLongPressItem" :notifyCount=1 successMessage="Check-in sent!" errorMessage="Could not send check-in" notifyRoute="checkInReplyUser" tapRoute="viewPerson" />
                </v-template>

                <!-- Group -->
                <v-template if="item.type == 'group'">
                    <ProgressBarButton :text="'#'+item.groupName" :isError="isItemError" :item="item" :onLongPress="onLongPressItem" :notifyCount=3 successMessage="Group check-in sent!" errorMessage="Could not send group check-in" notifyRoute="checkInGroup" :showArrow="true" arrowRoute="checkInGroup" tapRoute="checkInGroup" />
                </v-template>

                <!-- Help Button -->
                <v-template if="item.type == 'help'">
                    <GridLayout class="listButtonContainer" columns="*" @tap="onTapHelp">
                        <Image class="listbutton" width="26" height="26" stretch="aspectFit" src="res://icons_listbutton_help" />
                    </GridLayout>
                </v-template>

                <!-- Your Check-Ins Button -->
                <v-template if="item.type == 'yourcheckins'">
                    <ProgressBarButton text="Your check-ins" :notifyCount=5 notifyRoute="yourCheckIns" :hasLongPress="false" :showArrow="true" arrowRoute="yourCheckIns" tapRoute="yourCheckIns" />
                </v-template>

                <!-- Add Button -->
                <v-template if="item.type == 'add'">
                    <GridLayout class="listButtonContainer" columns="*" @tap="onTapAddPerson">
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
            return { transition: { name: "slideRight", duration: 300, curve: "ease" } }
        },
        
        navOptions() {
            return { transition: { name: "slideLeft", duration: 300, curve: "ease" } }
        },

        showMemo() {
            return (this.userList.length || this.groupList.length) && !this.isLoadingError;
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

            // Now we add a "group" type to all groups in the group list
            let groups = this.groupList.map( x => {
                x.type = 'group';
                return x
            });

            // Merge the group list
            if (groups) {
                list = [...list, ...groups];
            }

            // Sort the list by the due date, showing most due at the bottom of the list for easy access
            list.sort((a, b) => parseInt(b.due) - parseInt(a.due));

            // Add the YourCheckIns at the bottom of the list
            if (!this.yourCheckIns.length && !this.yourCheckIns.length) {
                list.push({ type: 'yourcheckins' });
            }

            // Always add the add button right at the bottom
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
            this.$goto('checkInHomeHelp', this.navOptions);
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
                // Show error message
                this.isLoading = false;
                this.connectError = false;
                this.apiError = true;
                
                // Extract any error message/data from the error
                const errorData = getResponseErrorMessage(error);
                this.errorMessage = errorData.message;
                this.connectError = errorData.connectError;
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