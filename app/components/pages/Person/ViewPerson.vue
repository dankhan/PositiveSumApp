<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <DockLayout>
        <!-- Top Nav -->
        <TopNav dock="top" :leftIsBackButton="true" :rightIsDeleteButton="true" deleteText="Remove Dan from your network and delete all of their data?" />
        
        <!-- Bottom container -->
        <ScrollView dock="bottom" marginTop="20">
            <PreviousNextView>
                <GridLayout columns="*" verticalAlignment="bottom" marginLeft="20" marginRight="20" marginBottom="10">
                    <StackLayout>
                        <!-- Person Name Heading -->
                        <Label class="heading" text="Dan Khan" marginBottom="0"></Label>

                        <!-- Buttons -->
                        <GridLayout columns="auto,*,10,auto,*,10,auto,*,10,30" marginBottom="0">
                            <Button col="1" class="button-primary" backgroundImage="res://icons_button_email" backgroundRepeat="no-repeat" backgroundPosition="10% 50%">
                                <FormattedString>
                                    <Span text="    Email" class="button-label"></Span>
                                </FormattedString>
                            </Button>
                            
                            <Button col="4" class="button-primary" backgroundImage="res://icons_button_phone" backgroundRepeat="no-repeat" backgroundPosition="15% 50%">
                                <FormattedString>
                                    <Span text="    Call" class="button-label"></Span>
                                </FormattedString>
                            </Button>
                            
                            <Button col="7" class="button-primary" backgroundImage="res://icons_button_msg" backgroundRepeat="no-repeat" backgroundPosition="15% 55%">
                                <FormattedString>
                                    <Span text="    Msg" class="button-label"></Span>
                                </FormattedString>
                            </Button>

                            <!-- Share Button -->
                            <Image col="9" class="topnav-icon-left" width="26" height="26" horizontalAlignment="right" stretch="aspectFit" src="res://icons_share" marginLeft="10" @tap="onTapShare" />
                        </GridLayout>

                        <!-- Last Check-in Date -->
                        <Label class="lastcheckin" text="Last check-in 5 days ago" marginTop="0" marginBottom="40"></Label>
                    
                        <!-- Form -->
                    
                        <!-- Name -->
                        <StackLayout>
                            <TextField v-model="formName" hint="Name..." class="form-input" :autocorrect="false" />
                            <label v-if="nameError" class="error" textWrap="true" marginTop="5" marginBottom="5" horizontalAlignment="center">Please enter a first name an last name</label>
                        </StackLayout>

                        <!-- Email -->
                        <StackLayout>
                            <TextField v-model="formEmail" hint="Email address..." class="form-input" keyboardType="email" autocapitalizationType="none" :autocorrect="false" />
                            <label v-if="emailError" class="error" textWrap="true" marginTop="5" marginBottom="5" horizontalAlignment="center">Please enter a valid email address</label>
                        </StackLayout>

                        <!-- Country code and Phone -->
                        <GridLayout :columns="countryCodeCols" marginTop="5">
                            <StackLayout orientation="horizontal" verticalAlignment="middle" class="form-input">
                                <Image v-if="flagImage" :src="'data:image/png;base64,'+flagImage" class="flag" />
                                <Label :text="formCountryDialCode" class="country-code" />
                                <Image src="res://icons_form_expander" verticalAlignment="middle" height="24" :marginLeft="countryCodeMargin" marginRight="3" />
                            </StackLayout>

                            <!-- Search field - use a background effect to make icon look like it's in the search field -->
                            <GridLayout :row="0" :col="1" class="input-border" columns="*, auto" rows="44" marginLeft="10">
                                <TextField col="0" class="form-input" v-model="formPhone" hint="Mobile number..." keyboardType="phone"></TextField>
                                <Image :src="phoneFieldIcon" col="1" class="form-icon" verticalAlignment="middle" height="20" />
                            </GridLayout>
                        </GridLayout>

                        <label v-if="phoneNumberError" class="error" textWrap="true" marginTop="5" marginBottom="5" horizontalAlignment="center">Please enter a valid phone number</label>
                        
                        <!-- Frequency -->
                        <StackLayout>
                            <Slider class="slider" v-model="formFrequency" minValue="1" :maxValue="frequencyOptions.length" backgroundColor="#85BCCB" color="#ffffff" />
                            <label class="frequencyLabel" marginTop="-10" marginBottom="5" :text="frequencyLabel"></label>
                        </StackLayout>

                        <!-- Groups -->
                        <Label class="heading2" text="Groups" marginTop="20" marginBottom="10"></Label>

                        <!-- Render the item list -->
                        <GridLayout v-for="item in groupsList" :key="item.groupId" v-if="groupsList.length" class="listButtonContainer" columns="*,auto" rows="24" marginBottom="10">
                            <label col="0" class="listbutton" :text="'#'+item.groupName"></label>
                            <Image col="1" class="remove" src="res://icons_button_cross" width="24" height="24" stretch="aspectFit"></Image>
                        </GridLayout>

                        <!-- add to group button -->
                        <GridLayout class="listButtonContainer" columns="*" marginBottom="10">
                            <Image class="listbutton" width="26" height="26" stretch="aspectFit" src="res://icons_listbutton_add" />
                        </GridLayout>
                        
                        <!-- Server submit error message -->
                        <label v-if="isSubmitError" class="error" textWrap="true" marginTop="5" marginBottom="5" horizontalAlignment="center">There was a problem saving these details, please try again</label>
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

// Use the social-share plugin to access share button functionality
import { shareText } from '@nativescript/social-share'

// Use the telephony plugin to get country code details from the phone sim
import * as PhoneNumberProvider from '~/common/phonenumber';

export default {
    components: {
        TopNav,
    },

    // The person item is passed as item
    props: {
        item: { type: Object, default: {} },
    },
    
    data() {
        return {
            // Form fields
            formName: 'Dan Khan',
            formEmail: 'dan.khan@gmail.com',
            formPhone: '212034298',
            formCountryCode: 'nz',      // ISO 2 char country code (e.g. US)
            formCountryDialCode: '64',  // country dial code (e.g. 1)
            formPhoneNationalNumber: '+64212034298',
            formFrequency: 2,
            frequencyOptions: [
                'Daily', 'Weekly', 'Fortnightly', 'Monthly', 'Every 2 months', 'Every 3 months', 'Every 6 months'
            ],
            groupsList: [
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
            ],

            // Phone number validation related
            flagImage: null,            // base64 encoded flag image currently displayed in form
            defaultCountryCode: 'us',
            defaultCountryDialCode: '+1',

            // Submit related
            isSubmit: false,
            isSubmitError: false,
            errorTimer: null,
        }
    },

    computed: {
        backNavOptions() {
            return { transition: { name: "slideRight", duration: 300, curve: "ease" } }
        },
        
        navOptions() {
            return { transition: { name: "slideLeft", duration: 300, curve: "ease" } }
        },

        // Form field validation
        nameError() {
            return ((this.formName ? this.formName.trim() : "") === "") && this.isSubmit;
        },
        
        emailError() {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;            // Note simple anystring@anystring.anystring and checking no double @
            return (this.formEmail.trim() === "" || !re.test(this.formEmail)) && this.isSubmit;
        },

        phoneNumberError() {
            return !this.isValidPhoneNumber && this.isSubmit;
        },

        frequencyLabel() {
            return 'Check-In ' + this.frequencyOptions[this.formFrequency-1];
        },

        countryCodeMargin() {
            return this.formCountryDialCode && this.formCountryDialCode.length > 3 ? 0 : 0;
        },

        countryCodeCols() {
          const length = 80 + (this.formCountryDialCode && this.formCountryDialCode.length ? (8 * this.formCountryDialCode.length) : 0);
          return length + ',*';
        },

        phoneFieldIcon() {
            return 'res://icons_phonenumber_' + (this.isValidPhoneNumber ? 'valid' : 'invalid');
        },

        isValidPhoneNumber() {
            // Trim off any leading zero and add country dial code
            let phoneNumber = (this.formPhone === undefined) ? '' : this.formPhone.replace(/^(\(0\)|0)/,'');
            phoneNumber = this.formCountryDialCode + phoneNumber;

            // Validate using the google lib
            return PhoneNumberProvider.isValidMobile(phoneNumber, this.countryCode);
        },
    },

    mounted() {
        this.setFlagImage();
    },
    
    methods: {
        onPageLoaded(event) {
            // Set the Status bar style (light or dark based on the *page* content)
            event.object.page.statusBarStyle = 'dark';
        },

        onTapShare() {
            const share = {
                "name": this.formName,
                "email": this.formEmail,
                "phone": this.formPhoneNationalNumber,
            };
            shareText(JSON.stringify(share), this.formName);
        },

        // Update the flag to show in the UI according to the currently set country
        // @see https://github.com/abhayastudios/nativescript-phone-validation/blob/5f20d2b081f246dc86377a019df9e4d0d6d58057/app/pages/login.ts
        setFlagImage() {
            let country = PhoneNumberProvider.countries.find((c) => { return c.iso2 == this.formCountryCode; });
            this.flagImage = (country && country.hasOwnProperty('flag') && country.flag!==null ) ? country.flag : null;
        },
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';
.lastcheckin {
    color: $color-primary;
    font-size: $font-size-small;
}

.slider {
    width: 100%;
}

.frequencyLabel {
    text-align: center;
    font-size: $font-size-small;
}

.flag {
    border-radius: 6;
    width: 30;
}

.country-code {
    margin-left: 3;
    color: $color-form-input;
    font-family: $font-family-semibold;
    font-weight: $font-weight-semibold;
    font-size: $font-size;
}

.form-icon {
    margin-left: 10;
    margin-right: 10;
    height: 44;
}

.input-border {
    height: 44;
    padding: 0;

    background-color: $color-form-input-background;
    border-color: $color-form-input-background;
    border-radius: $button-radius;
}

.listButtonContainer {
    margin-top: 0;
}

</style>