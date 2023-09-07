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
                <!-- Person -->
                <v-template if="item.type == 'person'">
                    <ProgressBarButton :text="item.name" :item="item" :key="`item-person-${item.personId}`" :onLongPress="onLongPressPerson" :notifyCount=item.notify successMessage="Check-in sent!" errorMessage="Could not send check-in" notifyRoute="checkInReplyUser" tapRoute="viewPerson" />
                </v-template>

                <!-- Group -->
                <v-template if="item.type == 'group'">
                    <ProgressBarButton :text="'#'+item.groupName" :item="item" :key="`item-group-${item.groupId}`" :onLongPress="onLongPressGroup" :notifyCount=item.notify successMessage="Group check-in sent!" errorMessage="Could not send group check-in" notifyRoute="checkInGroup" :showArrow="true" arrowRoute="checkInGroup" tapRoute="checkInGroup" />
                </v-template>

                <!-- Help Button -->
                <v-template if="item.type == 'help'">
                    <GridLayout class="listButtonContainer" columns="*" @tap="onTapHelp">
                        <Image class="listbutton" width="26" height="26" stretch="aspectFit" src="res://icons_listbutton_help" />
                    </GridLayout>
                </v-template>

                <!-- Your Check-Ins Button -->
                <v-template if="item.type == 'yourcheckins'">
                    <ProgressBarButton text="Your check-ins" key="item-yourcheckins" :notifyCount=yourCheckInsNotifyCount(userId) notifyRoute="yourCheckIns" :hasLongPress="false" :showArrow="true" arrowRoute="yourCheckIns" tapRoute="yourCheckIns" />
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
            return (this.personList.length || this.groupList.length) && !this.isLoadingError;
        },

        combinedList() {
            // Generate a combined list of items for rendering including buttons and groups
            let list = [];
            const persons = JSON.parse(JSON.stringify(Object.values(this.personList())));           // use json for deep copy so we don't change underlying store data            
            const groups = JSON.parse(JSON.stringify(Object.values(this.groupList())));

            // Now we add a "user" type to all users in the user list, and lookup the user's name
            if (persons.length) {
                let usersAdd = persons.map( x => {
                    // Tag as user type for rendering
                    x.type = 'person';

                    // Lookup the name in the contact store
                    x.name = this.personName(x.personId);
                    return x;
                });
            
                // Merge the user list
                if (usersAdd) {
                    list = [...list, ...usersAdd];
                }
            }

            // Now we add a "group" type to all groups in the group list
            if (groups.length) {
                let groupsAdd = groups.map( x => {
                    // Tag as group type for rendering
                    x.type = 'group';
                    return x;
                });

                // Merge the group list
                if (groupsAdd) {
                    list = [...list, ...groupsAdd];
                }
            }

            // Sort the list by the due date, showing most due at the bottom of the list for easy access
            list.sort((a, b) => {
                const dueA = a && a.due && a.due.checkIn && parseInt(a.due.checkIn) > 0 ? parseInt(a.due.checkIn) : -1;             // No due date, sort back of list
                const dueB = b && b.due && b.due.checkIn && parseInt(b.due.checkIn) > 0 ? parseInt(b.due.checkIn) : -1;
                return dueB - dueA;
            });

            // Add the YourCheckIns at the bottom of the list
            if (this.hasYourCheckIns) {
                list.push({ type: 'yourcheckins' });
            }

            // Add a help button before the bottom - if the user hasn't added any contacts yet
            if (!persons.length && !groups.length) {
                list.push({ type: 'help' });
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
            userId: 'User/userId',
            personList: 'Contacts/persons',
            groupList: 'Groups/groups',
            checkInList: 'CheckIns/all',
            personName: 'Contacts/personName',
            hasYourCheckIns: 'CheckIns/hasYourCheckIns',
            yourCheckInsNotifyCount: 'CheckIns/yourCheckInsNotifyCount',
        }),
    },

    beforeMount() {
        // this.fetchList();
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
                if (!response.checkIns) {
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

        onLongPressPerson(data) {
            return new Promise((resolve, reject) => {
                try {
                    // For now we create a static check-in text
                    const text = '👋';
                    CheckInAPIService.person(this.userId, data.personId, text)
                    .then( (response) => {
                        if (!response || !response.message) {
                            throw new NoResponseAPIError();
                        }

                        // Make sure our expected fields are in the response
                        if (!response.checkIn) {
                            throw 'There was a problem sending your check-in, please try again later';
                        }

                        resolve(data);
                    })
                    .catch( (error) => {
                        console.error(error);
                        reject(data);
                    });
                } catch (e) {
                    console.error(e);
                    reject(data);
                }
            });
        },

        onLongPressGroup(data) {
            return new Promise((resolve, reject) => {
                try {
                    // For now we create a static check-in text
                    const text = '👋';
                    CheckInAPIService.group(this.userId, data.groupId, text)
                    .then( (response) => {
                        if (!response || !response.message) {
                            throw new NoResponseAPIError();
                        }

                        // Make sure our expected fields are in the response
                        if (!response.checkIns) {
                            throw 'There was a problem sending your group check-in, please try again later';
                        }

                        resolve(data);
                    })
                    .catch( (error) => {
                        console.error(error);
                        reject(data);
                    });
                } catch (e) {
                    console.error(e);
                    reject(data);
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