<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <DockLayout>
        <!-- Top Nav -->
        <TopNav ref="topnav" dock="top" title="Check-In" :leftIsHomeButton="true" :rightIsHelpButton="true" rightRoute="checkInHelp" />
        
        <!-- Bottom container -->
        <GridLayout ref="grid" dock="bottom" rows="auto" columns="*" verticalAlignment="bottom" marginLeft="20" marginRight="20" marginBottom="10">
            <ListView for="item in combinedList" separatorColor="transparent" :height="listViewHeight" ref="listview">
                <!-- User -->
                <v-template if="item.type == 'user'">
                    <GridLayout class="listButtonContainer" cols="*" rows="auto" ref="listbutton">
                        <label class="listbutton" :text="item.userName"></label>
                    </GridLayout>
                </v-template>

                <!-- Help Button -->
                <v-template if="item.type == 'help'">
                    <GridLayout class="listButtonContainer" cols="*" @tap="onTapHelp" ref="listbutton">
                        <Image class="listbutton" width="26" height="26" stretch="aspectFit" src="res://icons_listbutton_help" />
                    </GridLayout>
                </v-template>

                <!-- Add Button -->
                <v-template if="item.type == 'add'">
                    <GridLayout class="listButtonContainer" cols="*" @tap="onTapAddPerson" ref="listbutton">
                        <Image class="listbutton" width="26" height="26" stretch="aspectFit" src="res://icons_listbutton_add" />
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
    },
    
    data() {
        return {
            isLoading: false,
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

        // Map our Vuex getters
        ...mapGetters({
            userId: 'CheckIn/userId',
            yourCheckIns: 'CheckIn/yourCheckIns',
            userList: 'CheckIn/userList',
            groupList: 'CheckIn/groupList',
        }),
    },

    beforeMount() {
        this.isLoading = true;

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
            this.isLoading = false;
        })
        .catch( (error) => {
            if (error instanceof NoResponseAPIError ) {
                this.errorMessage = 'We couldn\'t contact the server. Please check your Internet connection or try again later.';
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
            this.errorMessage = this.errorMessage;
        });
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
            if (this.$refs.listview.nativeView && this.$refs.listview.nativeView.ios) {
                this.$refs.listview.nativeView.ios.scrollToRowAtIndexPathAtScrollPositionAnimated(
                    NSIndexPath.indexPathForItemInSection(position, 0),
                    UITableViewScrollPosition.UITableViewScrollPositionTop,
                    true
                );
            } else {
                this.$refs.listview.nativeView.scrollToIndex(position);
            }
        },

        scrollToBottom() {
            return this.scrollListView(this.combinedList.length ? this.combinedList.length-1 : 0);
        }
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';

.list-item {
    background-color: $color-form-input-background;
    border-radius: $button-radius;
}

.listbutton {
    color: $color-listbutton;
    font-family: $font-family-semibold;
    font-weight: $font-weight-semibold;
}

.maxheight {
    height: 100%;
    min-height: 100%;
}
</style>