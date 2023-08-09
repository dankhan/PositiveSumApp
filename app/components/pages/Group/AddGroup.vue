<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <DockLayout>
        <!-- Top Nav -->
        <TopNav dock="top" title="Add Group" :leftIsBackButton="true" :rightIsHelpButton="true" rightRoute="addGroupHelp" :frameId="frameId" />

        <!-- Bottom container -->
        <ScrollView dock="bottom">
            <PreviousNextView>
                <GridLayout rows="auto, auto" columns="*" verticalAlignment="bottom" marginLeft="20" marginRight="20" marginBottom="10">
                    <!-- Form -->
                    <StackLayout>
                        <!-- Name -->
                        <StackLayout>
                            <TextField v-model="formName" hint="Group name..." class="form-input" />
                            <label v-if="nameError" class="error" textWrap="true" marginTop="5" marginBottom="5" horizontalAlignment="center">Please enter a group name</label>
                        </StackLayout>                            

                        <!-- Frequency -->
                        <StackLayout>
                            <Slider class="slider" v-model="formFrequency" minValue="1" :maxValue="frequencyOptions.length" @valueChange="onSliderValueChanged" backgroundColor="#85BCCB" color="#ffffff" />
                            <label class="frequencyLabel" marginTop="-10" marginBottom="5" :text="frequencyLabel"></label>
                        </StackLayout>

                        <!-- Server submit error message -->
                        <label v-if="isSubmitError" class="error" textWrap="true" marginTop="5" marginBottom="5" horizontalAlignment="center">Couldn't save your data - please try again</label>
                        
                        <!-- Add Group Button -->
                        <Button marginTop="30" class="button-primary" text="Add Group" @tap="onTapAddGroup"></Button>
                    </StackLayout>
                </GridLayout>
            </PreviousNextView>
        </ScrollView>
    </DockLayout>
  </Page>
</template>

<script>
// In-page components
import TopNav from '~/components/widgets/TopNav';

// API Services
import GroupAPIService from '@/services/GroupAPIService';

// Import our custom errors
import NoResponseAPIError from '@/errors/noresponseapierror';
import { getResponseErrorMessage } from '@/common/https';

export default {
    components: {
        TopNav,
    },
    
    // The person item is passed as item
    props: {
        frameId: { type: String, default: undefined },
    },
    
    data() {
        return {
            // Form fields
            formName: '',
            formFrequency: 2,
            frequencyOptions: [
                'Daily', 'Weekly', 'Fortnightly', 'Monthly', 'Every 2 months', 'Every 3 months', 'Every 6 months'
            ],

            // Submit related
            isSubmit: false,
            isSubmitError: false,
            errorTimer: null,
            errorMessage: '',
        }
    },

    computed: {
        backNavOptions() {
            return { transition: { name: "slideRight", duration: 300, curve: "ease" }, frame: this.frameId, props: { frameId: this.frameId } }
        },
        
        navOptions() {
            return { transition: { name: "slideLeft", duration: 300, curve: "ease" }, frame: this.frameId, props: { frameId: this.frameId } }
        },

        // Form field validation
        nameError() {
            return (!this.formName || !this.formName.trim().length) && this.isSubmit;
        },
        
        frequencyLabel() {
            return 'Check-In ' + this.frequencyOptions[this.formFrequency-1];
        },

        frequencyError() {
            return typeof this.frequencyOptions[this.formFrequency-1] === 'undefined' && this.isSubmit;
        },
    },

    beforeUnmount() {
        if (this.errorTimer) {
            clearTimeout (this.errorTimer);
        }
    },
    
    methods: {
        onPageLoaded(event) {
            // Set the Status bar style (light or dark based on the *page* content)
            event.object.page.statusBarStyle = 'dark';

            // Fix for scrolling view on textfield focus on android
            if (event.object.page.android) {
                event.object.page.android.setFitsSystemWindows(true);
            }
        },

        onSliderValueChanged(event) {
            // Round slider value to nearest whole number
            const step = 1;
            const rounded = Math.round(event.value / step) * step;
            if (this.formFrequency !== rounded) {
                this.formFrequency = rounded;
            }
        },

        async onTapAddGroup() {
            // Set state to processing a submit
            this.isSubmit = true;
            this.isSubmitError = false;
                
            // Validate form fields
            if (!this.nameError && !this.frequencyError) {
                // Clear any previous error message
                if (this.errorTimer) {
                    clearTimeout(this.errorTimer);
                }
            
                // Valid            
                
                // Save the group details using the API
                await GroupAPIService.addGroup(this.userId, this.formName, this.formFrequency)
                .then( (response) => {
                    if (!response || !response.message) {
                        throw new NoResponseAPIError();
                    }

                    // Make sure our expected fields are in the response
                    if (!response.group) {
                        throw 'Couldn\'t save your data - please try again later';
                    }

                    // Fields will be available in our Vuex getters

                    // Reset submit state
                    this.isSubmit = false;

                    // Redirect to groups list
                    this.$navigateBack(this.backNavOptions);
                })
                .catch( (error) => {
                    // Show error message
                    this.isSubmitError = true;
                    
                    // Extract any error message/data from the error
                    const errorData = getResponseErrorMessage(error);
                    this.errorMessage = errorData.message;

                    // Set a timer to clear the error message
                    this.errorTimer = setTimeout(() => {
                        this.isSubmit = false;
                        this.isSubmitError = false;
                    }, 3000);
                });
            } else {
                // Set a timer to clear the submit state
                this.errorTimer = setTimeout(() => {
                    this.isSubmit = false;
                }, 3000);
            }
        },
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';

.slider {
    width: 100%;
}

.frequencyLabel {
    text-align: center;
    font-size: $font-size-small;
}

</style>