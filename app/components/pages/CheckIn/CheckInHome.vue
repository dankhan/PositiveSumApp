<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <DockLayout>
        <!-- Top Nav -->
        <TopNav dock="top" title="Check-In" :leftIsHomeButton="true" :rightIsHelpButton="true" rightRoute="checkInHelp" />
        
        <!-- Bottom container -->
        <ScrollView scrollBarIndicatorVisible="true" class="maxheight" dock="bottom">
            <GridLayout rows="auto, auto" columns="*" verticalAlignment="bottom" marginLeft="20" marginRight="20" marginBottom="10">
                <!-- Empty list, show help button-->
                <StackLayout>
                    <!-- Help Button -->
                    <GridLayout class="listButtonContainer" cols="*" @tap="onTapHelp" v-if="!userList.length && !groupList.length">
                        <Image class="listbutton" width="26" height="26" stretch="aspectFit" src="res://icons_listbutton_help" />
                    </GridLayout>

                    <ListView for="user in userList" rowHeight="60" separatorColor="transparent">
                        <v-template>
                            <GridLayout class="listButtonContainer" cols="*">
                                <label class="listbutton" :text="user.userName"></label>
                            </GridLayout>
                        </v-template>
                    </ListView>

                    <!-- Add Button -->
                    <GridLayout class="listButtonContainer" cols="*" @tap="onTapAddPerson">
                        <Image class="listbutton" width="26" height="26" stretch="aspectFit" src="res://icons_listbutton_add" />
                    </GridLayout>
                </StackLayout>
            </GridLayout>
        </ScrollView>
    </DockLayout>
  </Page>
</template>

<script>
// In-page components
import TopNav from '~/components/widgets/TopNav';

// Common includes used in this page
import { mapGetters } from 'vuex';

// API Services
import CheckInAPIService from '@/services/CheckInAPIService';

// import * as Https from '@/common/https';

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