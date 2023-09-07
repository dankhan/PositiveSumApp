<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <DockLayout stretchLastChild="true">
        <!-- Top Nav -->
        <TopNav dock="top" title="Check-In" :leftIsBackButton="true" :rightIsHelpButton="true" rightRoute="checkInHelp" />

        <!-- Bottom container -->
        <ScrollView dock="bottom">
            <PreviousNextView>
                <GridLayout rows="auto, auto" columns="*" verticalAlignment="bottom" marginLeft="20" marginRight="20" marginBottom="10">
                    <!-- Reply buttons -->
                    <StackLayout v-if="showReply">
                        
                        <!-- Emoji Board -->
                        <EmojiBoard @selected="onEmojiSelected" :showAltBoard="showAltReply" :marginBottom="isSubmitError ? 0 : 20"></EmojiBoard>

                        <!-- Server submit error message -->
                        <label v-if="isSubmitError" class="error" height="20" textWrap="true" marginTop="10" marginBottom="10" horizontalAlignment="center">Couldn't save your reply, please try again</label>

                        <!-- Reply button -->
                        <Button :marginTop="isSubmitError ? 0 : 20" class="button-primary" text="Reply" @tap="onTapReply" :isEnabled="isReplyEnabled"></Button>
                    </StackLayout>

                    <!-- Contact Buttons -->
                    <StackLayout v-if="showContactButtons">
                        <ContactButtons name='Monty' email="test@example.com" phone="212034298" countryDialCode='64' nationalNumber="+64212034298" :hasContact="true"></ContactButtons>
                    </StackLayout>
                </GridLayout>
            </PreviousNextView>
        </ScrollView>

        <!-- Middle container -->
        <GridLayout class="main" rows="*,auto,*" margin="20">
            <label row="0" class="heading" :text="checkInTitle" verticalAlignment="bottom" textWrap="true"></label>
            <CheckIn row="1" :checkIn="checkInEmoji" :reply="checkinReplyEmoji" :isLoading="isSubmit" />
            <label row="2" class="date" :text="replyDate" verticalAlignment="top"></label>
        </GridLayout>
    </DockLayout>
  </Page>
</template>

<script>
// Common includes used in this page
import { mapGetters } from 'vuex';
import { daysAgoLabel } from '@/common/utilities';

// In-page components
import TopNav from '~/components/widgets/TopNav';
import EmojiBoard from '~/components/widgets/EmojiBoard';
import CheckIn from '~/components/widgets/CheckIn';
import ContactButtons from '~/components/widgets/ContactButtons';

// API Services
import CheckInAPIService from '@/services/CheckInAPIService';

// Import our custom errors
import NoResponseAPIError from '@/errors/noresponseapierror';
import { getResponseErrorMessage } from '@/common/https';

export default {
    components: {
        TopNav,
        EmojiBoard,
        CheckIn,
        ContactButtons,
    },
    
    // The check-in details passed as item
    props: {
        item: { type: Object, default() { return {} } },
    },
    
    data() {
        return {
            emoji: '',      // when replying to a check-in

            // Submit related
            isSubmit: false,
            isSubmitError: false,
            errorTimer: null,
            errorMessage: '',

            // TODO: Replace this with data from the store

            checkInStore: [
                // case 1: You checking in with someone and viewing their reply (should show alt reply options, and no icon overlay)
                {
                    checkInId: 1,
                    text: '👋',
                    time: 1692158913,
                    to: { name: "Monty", email: '', phone: '', countryDialCode: '', nationalNumber: '', userId: 1, time: 1692240860 },
                    from: { name: "Dan", userId: 42 },
                    reply1: { time: 1692240890, text: '🙁'},
                },

                // case 2: You checking in with someone and viewing their reply to your reply (should show contact buttons, icon overlay with their reply)
                {
                    checkInId: 2,
                    text: '👋',
                    time: 1692158913,
                    to: { name: "Monty", email: '', phone: '', countryDialCode: '', nationalNumber: '', userId: 1, time: 1692240860 },
                    from: { name: "Dan", userId: 42 },
                    reply1: { time: 1692240890, text: '🙁'},
                    reply2: { time: 1692245362, text: '📞'}
                },

                // case 3: Someone checking in with you, and no replies yet (should show default reply options, and default icon waving)
                {
                    checkInId: 3,
                    text: '👋',
                    time: 1692158913,
                    from: { name: "Monty", email: '', phone: '', countryDialCode: '', nationalNumber: '', userId: 1, time: 1692240860 },
                    to: { name: "Dan", userId: 42 },
                },

                // case 4: Someone checking in with you, and you have replied (should show contact buttons, no icon overlay, but your reply as the main icon)
                {
                    checkInId: 4,
                    text: '👋',
                    time: 1692158913,
                    from: { name: "Monty", email: '', phone: '', countryDialCode: '', nationalNumber: '', userId: 1, time: 1692240860 },
                    to: { name: "Dan", userId: 42 },
                    reply1: { time: 1692240890, text: '🙁'},
                },

                // case 5: Someone checking in with you, and you have replied and they have replied back (should show contact buttons, your reply as main icon, icon overlay with their reply)
                {
                    checkInId: 5,
                    text: '👋',
                    time: 1692158913,
                    from: { name: "Monty", email: '', phone: '', countryDialCode: '', nationalNumber: '', userId: 1, time: 1692240860 },
                    to: { name: "Dan", userId: 42 },
                    reply1: { time: 1692240890, text: '🙁'},
                    reply2: { time: 1692245362, text: '📞'}
                },
            ],

            checkIn: {
                checkInId: 1,
                text: '👋',
                time: 1692158913,
                to: { name: "Monty", email: '', phone: '', countryDialCode: '', nationalNumber: '', userId: 1, time: 1692240860 },
                from: { name: "Dan", userId: 42 },
                reply1: { time: 1692240890, text: '🙁'},
            },
        }
    },

    computed: {
        backNavOptions() {
            return { transition: { name: "slideRight", duration: 300, curve: "ease" } }
        },
        
        navOptions() {
            return { transition: { name: "slideLeft", duration: 300, curve: "ease" } }
        },

        isReplyEnabled() {
            return !this.isSubmit && this.emoji !== '';
        },

        showReply() {
            return !this.showContactButtons;
        },

        showAltReply() {
            return (this.checkIn.from.userId === this.userId) && !this.hasReply2 && this.hasReply1;
        },

        showContactButtons() {
            // Check in sent to someone else
            if (this.checkIn.from.userId === this.userId) {
                if (this.hasReply2) {
                    return true;
                } else if (this.hasReply1) {
                    return false;               // Show reply alt options
                } else {
                    return true;
                }
            } else {
                // Check in received from someone else
                return this.hasReply1 || this.hasReply2;
            }
        },

        checkInTitle() {
            // Check in sent to someone else
            if (this.checkIn.from.userId === this.userId) {
                if (this.hasReply2) {
                    return 'You replied to ' + this.checkIn.to.name + '\'s check-in';
                } else {
                    return this.checkIn.to.name + ' checked in';
                }
            } else {
                // Check in received from someone else
                if (this.hasReply2) {
                    return this.checkIn.from.name + ' replied to your check-in';
                } else if (this.hasReply1) {
                    return 'You checked in with ' + this.checkIn.from.name;
                } else {
                    return this.checkIn.from.name + ' is checking in...';
                }
            }
        },

        checkInEmoji() {
            // Check in sent to someone else
            if (this.hasReply1) {
                return this.checkIn.reply1.text;
            } else {
                return this.checkIn.text;
            }
        },

        checkinReplyEmoji() {
            // Check in sent to someone else
            if (this.hasReply2) {
                return this.checkIn.reply2.text;
            } else {
                return '';
            }
        },

        hasReply1() {
            return this.checkIn.reply1 && this.checkIn.reply1.hasOwnProperty('text') && this.checkIn.reply1.text.length > 0;
        },

        hasReply2() {
            return this.checkIn.reply2 && this.checkIn.reply2.hasOwnProperty('text') && this.checkIn.reply2.text.length > 0;
        },

        replyDate() {
            const replyDate = this.hasReply2 ? this.checkIn.reply2.time : (this.hasReply1 ? this.checkIn.reply1.time : this.checkIn.time);
        
            // Convert into a readable label
            if (replyDate) {
                return daysAgoLabel(replyDate);
            } else {
                return '';
            }
        },

        // Map our Vuex getters
        ...mapGetters({
            userId: 'User/userId',
            yourCheckIns: 'CheckIns/yourCheckIns',
            userList: 'CheckIns/users',
            groupList: 'Groups/get',
        }),
    },

    methods: {
        onPageLoaded(event) {
            // Set the Status bar style (light or dark based on the *page* content)
            event.object.page.statusBarStyle = 'dark';
        },

        async onTapReply() {
            // Set state to processing a submit
            this.isSubmit = true;
            this.isSubmitError = false;
                
            // Validate form fields
            if (this.emoji.length > 0) {
                // Clear any previous error message
                if (this.errorTimer) {
                    clearTimeout(this.errorTimer);
                }
            
                // Valid            
                
                // Save the reply based on the reply type using the API
                await CheckInAPIService.reply(this.userId, this.emoji, this.checkInId, this.hasReply1)
                .then( (response) => {
                    if (!response || !response.message) {
                        throw new NoResponseAPIError();
                    }

                    // Make sure our expected fields are in the response
                    if (!response.checkin) {
                        throw 'Couldn\'t save your data - please try again later';
                    }

                    // Fields will be available in our Vuex getters

                    // TODO: temporary update local values until saved to store
                    const newCheckIn = this.checkInStore.find((c) => { return c.checkInId == this.checkIn.checkInId + 1; });
                    if (this.hasReply1) {
                        newCheckIn.reply2.text = this.emoji;
                    } else {
                        newCheckIn.reply1.text = this.emoji;
                    }
                    this.checkIn = { ...newCheckIn };
                    //////////

                    // Reset submit state
                    this.isSubmit = false;
                })
                .catch( (error) => {
                    // Show error message
                    this.isSubmitError = true;
                    this.isSubmit = false;
                    console.error(error);

                    // Extract any error message/data from the error
                    const errorData = getResponseErrorMessage(error);
                    this.errorMessage = errorData.message;

                    // Set a timer to clear the error message
                    this.errorTimer = setTimeout(() => {
                        this.isSubmitError = false;
                    }, 3000);
                });
            } else {
                this.isSubmit = false;
            }
        },

        onEmojiSelected(emoji) {
            this.emoji = emoji;
        }
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';

.heading, .icon, .date {
    text-align: center;
}

.date {
    font-size: $font-size-small;
    color: $color-primary-muted;
}
</style>