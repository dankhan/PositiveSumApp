<template>
    <Frame id="groupSelect">
        <Page actionBarHidden="true" @loaded="onPageLoaded">
            <DockLayout>
                <!-- Top Nav -->
                <TopNav dock="top" title="Add To Group" :leftIsCloseButton="true" :modalData="modalData" />

                <!-- Bottom container -->
                <GridLayout rows="auto, auto" columns="*" dock="bottom" verticalAlignment="bottom" marginLeft="20" marginRight="20" marginBottom="10">
                    <!-- Render the group list -->
                    <ListView for="item in combinedList" :key="`listview-${groupSaving}-${groupIdSaving}-${apiError}-${apiSuccess}`" separatorColor="transparent" :height="listViewHeight" ref="listview" @itemLoading="onListViewItemLoading">
                        <v-template if="item.type == 'group'">
                            <GridLayout class="listButtonContainer" columns="*,auto" @tap="onTapAddToGroup(item)" :backgroundColor="backgroundColor(item.groupId)">
                                <label col="0" class="listbutton" :text="'#'+item.groupName" marginLeft="5"></label>
                                <Image col="1" src="res://icons_listbutton_add" width="26" height="26" stretch="aspectFit" marginRight="10" v-if="!groupSaving && item.groupId !== groupIdSaving"></Image>
                                <ActivityIndicator col="1" v-if="groupSaving && item.groupId === groupIdSaving" :busy="groupSaving && item.groupId === groupIdSaving" verticalAlignment="middle" marginRight="5" />
                            </GridLayout>
                        </v-template>

                        <!-- Add Group Button -->
                        <v-template if="item.type == 'add'">
                            <GridLayout class="listButtonContainer" columns="*" @tap="onTapAddGroup">
                                <Image class="listbutton" width="26" height="26" stretch="aspectFit" src="res://icons_listbutton_add" />
                            </GridLayout>
                        </v-template>
                    </ListView>
                </GridLayout>
            </DockLayout>
        </Page>
    </Frame>
</template>

<script>
// In-page components
import TopNav from '~/components/widgets/TopNav';
import ConnectIndicator from '~/components/widgets/ConnectIndicator';
import ProgressBarButton from '~/components/widgets/ProgressBarButton';

// Common includes used in this page
import { screen } from "@nativescript/core/platform";
import { mapGetters } from 'vuex';
import { Dialogs } from "@nativescript/core";

// API Services
import PersonAPIService from '@/services/PersonAPIService';

// Import our custom errors
import NoResponseAPIError from '@/errors/noresponseapierror';

export default {
    components: {
        TopNav,
        ConnectIndicator,
        ProgressBarButton,
    },

    // The person item is passed as item
    props: {
        userToAdd: { type: Object, default() { return {} } },
    },
    
    data() {
        return {
            /*groupsList: [
                {
                    'groupId': 1,
                    "groupName": 'Group 1'
                },
                {
                    'groupId': 2,
                    "groupName": 'Group 2'
                },
                {
                    'groupId': 3,
                    "groupName": 'Group 3'
                },
                {
                    'groupId': 4,
                    "groupName": 'Group 4'
                },
            ],*/

            // What data do we want to return when the modal is closed
            modalData: false,

            groupSaving: false,
            groupIdSaving: 0,
            saveTimer: null,
            saveInterval: 1 * 1000,

            apiError: false,
            apiSuccess: false,
            connectError: false,
            errorMessage: '',

            // Configure the background colour of the buttons for showing updates
            defaultColor: "#F7F1F1",
            successColor: "#86F3B2",
            errorColor: "#F88F8F",
        }
    },

    computed: {
        backNavOptions() {
            return { transition: { name: "slideRight", duration: 300, curve: "ease" } }
        },
        
        navOptions() {
            return { transition: { name: "slideLeft", duration: 300, curve: "ease" } }
        },

        backgroundColor() {
            return (groupId) => {
                if (groupId === this.groupIdSaving && this.apiError) return this.errorColor;
                if (groupId === this.groupIdSaving && this.apiSuccess) return this.successColor;
                return this.defaultColor;
            }
        },
        
        combinedList() {
            // Generate a combined list of items for rendering including buttons and groups
            const groups = [...(Object.values(this.groupsList))];
            let list = groups.map( x => {
                x.type = 'group';
                return x;
            });

            // Sort the list by alphabetical
            list.sort((a, b) => a.groupName.localeCompare(b.groupName));

            // Always add the add button right at the bottom
            list.push({ type: 'add', groupId: 0 });

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

        indicatorType() {
            if (this.connectError) return 'connecterror';
            if (this.apiError) return 'fetcherror';
            return '';
        },

        // Map our Vuex getters
        ...mapGetters({
            userId: 'User/userId',
            yourCheckIns: 'CheckIns/yourCheckIns',
            userList: 'CheckIns/users',
            groupsList: 'Groups/all',
        }),
    },

    beforeUnmount() {
        if (this.saveTimer) {
            clearTimeout (this.saveTimer);
        }
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

        onListViewItemLoading(args) {
            // We remove the selected item background color on load
            if (global.isIOS) {
                const cell = args.ios;
                cell.selectionStyle = UITableViewCellSelectionStyle.UITableViewCellSelectionStyleNone;
            }
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

        async onTapAddToGroup(group) {
            const userName = this.userToAdd.name ? this.userToAdd.name : '';
            const personId = this.userToAdd.personId ? this.userToAdd.personId : 0;

            return Dialogs.confirm('Add ' + userName + ' to ' + group.groupName + '?')
                .then(async (result) => {
                    if (result) {
                        if (this.saveTimer) {
                            clearTimeout(this.saveTimer);
                        }

                        // We add this user to the specified group, and then remove the group from the list
                        this.apiError = false;
                        this.apiSuccess = false;
                        this.groupSaving = true;
                        this.groupIdSaving = group.groupId;

                        // Save the data through the API
                        return PersonAPIService.addGroup(this.userId, personId, group.groupId)
                        .then( (response) => {
                            if (!response || !response.message) {
                                throw new NoResponseAPIError();
                            }

                            // Show success state/color
                            this.groupSaving = false;
                            this.apiSuccess = true;                            

                            // Flash background color based on save result
                            this.saveTimer = setTimeout(() => {
                                // Clear success state
                                this.groupIdSaving = 0;
                                this.apiSuccess = false;

                                // Updated should update the groups list in the Vuex store

                                // If no more groups to add this user to, we close the modal
                                if (!this.groupsList.length) {
                                    this.$modal.close(this.modalData);
                                }
                            }, this.saveInterval);
                        })
                        .catch( (error) => {
                            // Show error state/color
                            this.groupSaving = false;
                            this.apiError = true;

                            // Flash background color based on save result
                            this.saveTimer = setTimeout(() => {
                                this.groupIdSaving = 0;
                                this.apiError = false;
                            }, this.saveInterval);
                        });
                    } else {
                        return false;
                    }
            });
        },

        onTapAddGroup() {
            if (!this.groupSaving) {
                const options = { frame: "groupSelect", props: { frameId: "groupSelect" } };
                const mergedOptions = {...this.navOptions, ...options}
                this.$goto("addGroup", mergedOptions);
            }
        }
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';

.listButtonContainer {
    padding: 0;
}
</style>