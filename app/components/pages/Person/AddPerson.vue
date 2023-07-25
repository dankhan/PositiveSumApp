<template>
    <Page actionBarHidden="true" @loaded="onPageLoaded">
        <DockLayout>
            <!-- Top Nav -->
            <TopNav dock="top" title="Add Person" :leftIsBackButton="true" :rightIsHelpButton="true" rightRoute="addPersonHelp" />

            <!-- Bottom container -->
            <ScrollView dock="bottom">
                <PreviousNextView>
                    <GridLayout rows="auto, auto" columns="*" verticalAlignment="bottom" marginLeft="20" marginRight="20" marginBottom="10">
                        <!-- Form -->
                        <StackLayout>
                            <!-- Name -->
                            <StackLayout>
                                <SearchField :search="formName" hint="Name..." @textChange="onSearchQueryChange" @returnPress="onSearchQueryChange" @tapIcon="onTapSearchIcon" :autocorrect="false" marginBottom="5" />
                                <label v-if="nameError" class="error" textWrap="true" marginTop="5" marginBottom="5" horizontalAlignment="center">Please enter a name</label>
                                <label v-if="permissionsError" class="error" textWrap="true" marginTop="5" marginBottom="5" horizontalAlignment="center" :text="permissionErrorMsg" @tap="onTapPermissionsError"></label>
                                <label v-if="contactError" class="error" textWrap="true" marginTop="5" marginBottom="5" horizontalAlignment="center" text="Problem fetching contact from phone book, please enter details manually"></label>
                            </StackLayout>                            

                            <!-- Email -->
                            <StackLayout>
                                <TextField v-model="formEmail" hint="Email address..." class="form-input" keyboardType="email" autocapitalizationType="none" :autocorrect="false" />
                                <label v-if="emailError" class="error" textWrap="true" marginTop="5" marginBottom="5" horizontalAlignment="center">Please enter a valid email address</label>
                            </StackLayout>

                            <!-- Country code and Phone -->
                            <GridLayout :columns="countryCodeCols" marginTop="5">
                                <StackLayout orientation="horizontal" @tap="onTapCountryCode" verticalAlignment="middle" class="form-input">
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
                                <Slider class="slider" v-model="formFrequency" minValue="1" :maxValue="frequencyOptions.length" @valueChange="onSliderValueChanged" backgroundColor="#85BCCB" color="#ffffff" />
                                <label class="frequencyLabel" marginTop="-10" marginBottom="5" :text="frequencyLabel"></label>
                            </StackLayout>

                            <!-- Server submit error message -->
                            <label v-if="isSubmitError" class="error" textWrap="true" marginTop="5" marginBottom="5" horizontalAlignment="center">There was a problem saving these details, please try again</label>
                            
                            <!-- Add Person Button -->
                            <Button marginTop="30" class="button-primary" text="Add Person" @tap="onTapAddPerson"></Button>
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
import SearchField from '~/components/widgets/SearchField';

// Modal pages
import CountrySelect from '~/components/pages/Person/CountrySelect';
import ContactSelect from '~/components/pages/Person/ContactSelect';

// Use the telephony plugin to get country code details from the phone sim
import * as PhoneNumberProvider from '~/common/phonenumber';
const Sim = require('nativescript-telephony');

// Use the nativescript-community/perms to check and request device permissions
import { request as requestPermission, canOpenSettings, openSettings } from '@nativescript-community/perms';

export default {
    components: {
        TopNav,
        SearchField,
    },
    
    data() {
        return {
            // Form fields
            formName: '',
            formEmail: '',
            formPhone: '',
            formFrequency: 2,
            frequencyOptions: [
                'Daily', 'Weekly', 'Fortnightly', 'Monthly', 'Every 2 months', 'Every 3 months', 'Every 6 months'
            ],

            // Phone number validation related
            formCountryCode: undefined,     // ISO 2 char country code (e.g. US)
            formCountryDialCode: undefined, // country dial code (e.g. 1)
            flagImage: undefined,       // base64 encoded flag image currently displayed in form
            defaultCountryCode: 'us',
            defaultCountryDialCode: '+1',

            // Submit related
            isSubmit: false,
            isSubmitError: false,
            errorTimer: null,

            // Permissions and contact chooser related
            permissionsError: false,
            permissionsTimer: null,
            canOpenSettings: false,
            contactError: false,
            contactTimer: null,

            // Contact chooser related
            contactDetails: null,           // If we chose this user from the phone contacts, we save the full structured data including all email addresses and phone numbers
        }
    },

    computed: {
        // Navigation options
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

        permissionErrorMsg() {
            return this.canOpenSettings
                ? "You need to enable permission to access your contacts - tap to open system settings"
                : "You need to enable permission to access your contacts - change this option in your system settings";
        }
    },

    mounted() {
        // Try to get default country code details based on phone number/sim card
        Sim.Telephony().then((info) => {
            if (info.hasOwnProperty('countryCode')) { 
                this.formCountryCode = info['countryCode'] || this.defaultCountryCode;
                this.formCountryDialCode = '+' + PhoneNumberProvider.countries.find((c) => c['iso2']==this.formCountryCode)['dialCode'];
                this.setFlagImage();
            }
        }, (error) => {
            console.warn('AddPerson: Unable to retrieve SIM card info to get default country code');
            console.warn(error);
            
            // default to NZ
            this.formCountryCode = this.defaultCountryCode; 
            this.formCountryDialCode = this.defaultCountryDialCode;
            this.setFlagImage();
        });

        // Check if we can open the settings dialog for a potential permissions error
        this.canOpenSettings = canOpenSettings();
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

        // Update the flag to show in the UI according to the currently set country
        // @see https://github.com/abhayastudios/nativescript-phone-validation/blob/5f20d2b081f246dc86377a019df9e4d0d6d58057/app/pages/login.ts
        setFlagImage() {
            let country = PhoneNumberProvider.countries.find((c) => { return c.iso2 == this.formCountryCode; });
            this.flagImage = (country && country.hasOwnProperty('flag') && country.flag!==null ) ? country.flag : null;
        },
        
        onSliderValueChanged(event) {
            // Round slider value to nearest whole number
            const step = 1;
            const rounded = Math.round(event.value / step) * step;
            if (this.formFrequency !== rounded) {
                this.formFrequency = rounded;
            }
        },

        onTapCountryCode() {
            // Show the modal and update country codes on results
            this.$showModal(CountrySelect, { fullscreen: true })
                .then((result) => {
                    if (result && result.hasOwnProperty('iso2') && result.hasOwnProperty('dialCode')) {
                        this.formCountryCode = result['iso2'];
                        this.formCountryDialCode = '+' + result['dialCode'];
                        this.setFlagImage();
                    }
                });
        },

        onTapAddPerson() {
            // Clear any previous error message
            if (this.errorTimer) {
                clearTimeout(this.errorTimer);
            }

            // Set state to processing a submit
            this.isSubmit = true;

            // Validate form fields
            if (!this.nameError && !this.emailError && !this.phoneNumberError) {
                // Valid
            
                try {
                    // TODO: Add this person for this user on the server

                    // Reset submit state
                    this.isSubmit = false;

                    // Redirect to check-in list
                    let options = { clearHistory: true, ...this.backNavOptions };
                    this.$goto('checkInHome', options);
                } catch (e) {
                    // Show an error message
                    this.isSubmitError = true;
                    this.errorTimer = setTimeout(() => {
                        this.isSubmitError = false;
                        this.isSubmit = false;
                    }, 3000);
                }
            } else {
                this.errorTimer = setTimeout(() => {
                this.isSubmit = false;
                this.isSubmitError = false;
            }, 3000);
          }
        },

        onSearchQueryChange(event) {
            this.formName = event.value;
        },

        onTapSearchIcon() {
            // Check if we have permissions first
            requestPermission('contact').then(response => {
                if (response[0] !== 'authorized' && response[0] !== 'limited') {
                    this.showPermissionsError();
                } else {
                    this.permissionsError = false;

                    // Show the modal and update the contact details on close
                    this.$showModal(ContactSelect, { fullscreen: true, props: { /* search: this.formName */ } })
                    .then((result) => {
                        // Check if we have an unauthorised permissions message from modal
                        if (result.authorized && result.authorized === false) {
                            this.showPermissionsError();
                        }

                        // Check if lookup contacts failed
                        if (result.lookupFailed && result.lookupFailed) {
                            // Show failed lookup error
                            this.showContactError();
                        }
                        
                        // If valid results, update the local form values
                        /*

                        returned value (on iOS) is formatted like this:
                        {
                            "id": "410FE041-5C4E-48DA-B4DE-04C15EA3DBAC",
                            "name": "John Appleseed",
                            "firstName": "John",
                            "lastName": "Appleseed",
                            "sortName": "Appleseed John",
                            "emailAddresses": [
                                {
                                    "id": "172726CF-4C0A-44C3-B9D8-0C86F7E654AD",
                                    "label": "Work",
                                    "value": "John-Appleseed@mac.com"
                                }
                            ],
                            "emailAddress": "John-Appleseed@mac.com",
                            "phoneNumbers": [
                                {
                                    "id": "E297F1F7-CAFC-4A9D-ABF8-F79DB4496C87",
                                    "label": "Mobile",
                                    "value": "888-555-5512"
                                },
                                {
                                    "id": "5E423897-5B64-4129-AF55-10B1B3153697",
                                    "label": "Home",
                                    "value": "888-555-1212"
                                }
                            ],
                            "phoneNumber": "888-555-5512",
                            "internationalPhoneNumber": {
                                "countryCode": "NZ",
                                "countryDialCode": 64,
                                "nationalNumber": 8885555512,
                                "e164Number": "+648885555512"
                            }
                        }
                        */

                        if (result && result.hasOwnProperty('id')) {
                            // We save the full record
                            this.contactDetails = result;
                            
                            // Check if we have a valid name
                            if (result.hasOwnProperty('name') && result.name.length) {
                                this.formName = result.name;
                            }

                            // Check if we have a valid email
                            if (result.hasOwnProperty('emailAddress') && result.emailAddress.length) {
                                this.formEmail = result.emailAddress;
                            }
                            
                            // Check if we have valid phone number, country code, and dial code
                            if (result.hasOwnProperty('internationalPhoneNumber')) {
                                // Country code
                                if (result.internationalPhoneNumber.hasOwnProperty('countryCode') && result.internationalPhoneNumber.countryCode.length) {
                                    this.formCountryCode = result.internationalPhoneNumber.countryCode.toLowerCase();
                                }

                                // Dial code
                                if (result.internationalPhoneNumber.hasOwnProperty('countryDialCode') && result.internationalPhoneNumber.countryDialCode.length) {
                                    this.formCountryDialCode = result.internationalPhoneNumber.countryDialCode;
                                }
                                
                                // Phone number (may be a number not a string)
                                if (result.internationalPhoneNumber.hasOwnProperty('nationalNumber') && ("" + result.internationalPhoneNumber.nationalNumber.length)) {
                                    this.formPhone = "" + result.internationalPhoneNumber.nationalNumber;           // convert into string
                                    console.log('this.formPhone = ' + result.internationalPhoneNumber.nationalNumber);
                                }
                            }
                        }                        
                    });
                }
            }).catch((err) => {
                console.error("Failed to requestPermissions", err);
                this.showPermissionsError();
            });
        },

        showPermissionsError() {
            // Clear any previous error message
            if (this.permissionsTimer) {
                clearTimeout(this.permissionsTimer);
            }
            
            // Set permissions error
            this.permissionsError = true;

            // Set a timer to clear the message in 5s
            this.permissionsTimer = setTimeout(() => {
                this.permissionsError = false;
            }, 5000);
        },

        showContactError() {
            // Clear any previous error message
            if (this.contactTimer) {
                clearTimeout(this.contactTimer);
            }
            
            // Set permissions error
            this.contactError = true;

            // Set a timer to clear the message in 5s
            this.contactTimer = setTimeout(() => {
                this.contactError = false;
            }, 5000);
        },

        onTapPermissionsError() {
            if (this.canOpenSettings) {
                return openSettings();
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

</style>