<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <DockLayout>
        <!-- Top Nav -->
        <TopNav dock="top" :leftIsBackButton="true" :rightIsEditButton="!isEdit" :rightIsCancelEditButton="isEdit" @edit="onEdit" @canceledit="onCancelEdit" @delete="onDelete" :middleIsDeleteButton="isEdit" deleteText="Remove this contact from your network and delete all of their data?" />
        
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
                            <Image col="9" width="26" height="26" horizontalAlignment="right" stretch="aspectFit" src="res://icons_share" marginLeft="10" @tap="onTapShare" />
                        </GridLayout>

                        <!-- Last Check-in Date -->
                        <Label class="lastcheckin" text="Last check-in 5 days ago" marginTop="0" marginBottom="40"></Label>
                    
                        <!-- Form -->
                    
                        <!-- Name -->
                        <GridLayout v-if="!isEdit" class="listButtonContainer" columns="*" rows="24" marginBottom="10">
                            <label col="0" class="listbutton" :text="formName"></label>
                        </GridLayout>
                        <StackLayout>
                            <GridLayout v-if="isEdit" rows="44,auto" class="input-border" columns="*,auto" marginBottom="10" :backgroundColor="nameBackgroundColor">
                                <TextField col="0" class="form-input" v-model="formName" hint="Name..." :autocorrect="false" :borderColor="nameBackgroundColor" :backgroundColor="nameBackgroundColor"></TextField>

                                <!-- Save or loading indicator -->
                                <Image v-if="!isNameSaving" :src="nameEditIcon" col="1" class="form-icon" verticalAlignment="middle" height="24" width="24" @tap="onTapSaveForm('name')" />
                                <ActivityIndicator col="1" :busy="isNameSaving" v-if="isNameSaving" verticalAlignment="middle" marginRight="5" />
                            </GridLayout>
                        </StackLayout>

                        <!-- Email -->
                        <GridLayout v-if="!isEdit" class="listButtonContainer" columns="*" rows="24" marginBottom="5">
                            <label col="0" class="listbutton" :text="formEmail"></label>
                        </GridLayout>
                        <StackLayout>
                            <GridLayout v-if="isEdit" rows="44,auto" class="input-border" columns="*,auto" marginBottom="5" :backgroundColor="emailBackgroundColor">
                                <TextField col="0" class="form-input" v-model="formEmail" hint="Email address..." keyboardType="email" autocapitalizationType="none" :autocorrect="false" :borderColor="emailBackgroundColor" :backgroundColor="emailBackgroundColor"></TextField>

                                <!-- Save or loading indicator -->
                                <Image v-if="!isEmailSaving" :src="emailEditIcon" col="1" class="form-icon" verticalAlignment="middle" height="24" width="24" @tap="onTapSaveForm('email')" />
                                <ActivityIndicator col="1" :busy="isEmailSaving" v-if="isEmailSaving" verticalAlignment="middle" marginRight="5" />
                            </GridLayout>
                        </StackLayout>

                        <!-- Country code and Phone -->
                        <GridLayout :columns="countryCodeCols" marginTop="5">
                            <StackLayout orientation="horizontal" verticalAlignment="middle" class="form-input" @tap="onTapCountryCode" :backgroundColor="phoneBackgroundColor">
                                <Image v-if="flagImage" :src="'data:image/png;base64,'+flagImage" class="flag" />
                                <Label :text="formCountryDialCode" class="country-code" />
                                <Image src="res://icons_form_expander" verticalAlignment="middle" height="24" :marginLeft="countryCodeMargin" marginRight="3" v-if="isEdit" />
                            </StackLayout>

                            <!-- Phone number -->
                            <GridLayout :row="0" :col="1" class="input-border" columns="*,auto" rows="44" marginLeft="10" :backgroundColor="phoneBackgroundColor">
                                <TextField col="0" class="form-input" v-model="formPhone" hint="Mobile number..." keyboardType="phone" :borderColor="phoneBackgroundColor" :backgroundColor="phoneBackgroundColor"></TextField>

                                <!-- Save or loading indicator -->
                                <Image v-if="!isPhoneSaving" :src="phoneEditIcon" col="1" class="form-icon" verticalAlignment="middle" height="24" width="24" @tap="onTapSaveForm('phone')" />
                                <ActivityIndicator col="1" :busy="isPhoneSaving" v-if="isPhoneSaving" verticalAlignment="middle" marginRight="5" />                                
                            </GridLayout>
                        </GridLayout>
                        
                        <!-- Frequency Slider -->
                        <GridLayout columns="*, auto" rows="auto, auto">
                            <Slider row="0" class="slider" :isEnabled="isEdit" v-model="formFrequency" minValue="1" :maxValue="frequencyOptions.length" @valueChange="onSliderValueChanged" :backgroundColor="frequencyBackgroundColor" color="#ffffff" />
                            <label row="1" class="frequencyLabel" marginTop="-10" marginBottom="5" :text="frequencyLabel"></label>

                            <!-- Save or loading indicator -->
                            <Image v-if="!isFrequencySaving && isEdit" :src="frequencyEditIcon" col="1" class="form-icon" verticalAlignment="middle" height="24" width="24" @tap="onTapSaveForm('frequency')" />
                            <ActivityIndicator col="1" :busy="isFrequencySaving" v-if="isFrequencySaving" verticalAlignment="middle" marginRight="5" marginLeft="9" />
                        </GridLayout>
                        
                        <!-- Groups -->
                        <Label class="heading2" text="Groups" marginTop="20" marginBottom="10"></Label>

                        <!-- Render the group list -->
                        <GridLayout v-for="item in groupsList" :key="item.groupId" v-if="groupsList.length" class="listButtonContainer" columns="*,auto" rows="24" marginBottom="10" :backgroundColor="groupBackgroundColor(item.groupId)">
                            <label col="0" class="listbutton" :text="'#'+item.groupName"></label>

                            <!-- Save or loading indicator -->
                            <Image v-if="isEdit && (!isGroupSaving || item.groupId !== groupIdSaving)" col="1" class="remove" :src="groupEditIcon" width="24" height="24" stretch="aspectFit" @tap="onTapRemoveGroup(item.groupId)"></Image>
                            <ActivityIndicator col="1" :busy="groupIdSaving === item.groupId" width="24" v-if="isGroupSaving && groupIdSaving === item.groupId" verticalAlignment="middle" />
                        </GridLayout>

                        <!-- add to group button -->
                        <GridLayout class="listButtonContainer" columns="*" marginBottom="10" @tap="onTapAddToGroup">
                            <Image class="listbutton" width="26" height="26" stretch="aspectFit" src="res://icons_listbutton_add" />
                        </GridLayout>
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
import { Dialogs } from "@nativescript/core";

// Use the social-share plugin to access share button functionality
import { shareText } from '@nativescript/social-share'

// Modal pages
import CountrySelect from '~/components/pages/Person/CountrySelect';
import GroupSelect from '~/components/pages/Person/GroupSelect';

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
            formCountryDialCode: '+64',  // country dial code (e.g. 1)
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

            // Save unedited values so we know if they changed
            originalFormName: '',
            originalFormEmail: '',
            originalFormPhone: '',
            originalFormCountryCode: '',      // ISO 2 char country code (e.g. US)
            originalFormCountryDialCode: '',  // country dial code (e.g. 1)
            originalFormPhoneNationalNumber: '',
            originalFormFrequency: 2,

            // Is Edit Mode
            isEdit: false,
            
            // Phone number validation related
            flagImage: null,            // base64 encoded flag image currently displayed in form
            defaultCountryCode: 'us',
            defaultCountryDialCode: '+1',

            // Submit related
            saveTimer: null,
            isSaveSuccess: false,
            isSaveError: false,
            isNameSaving: false,
            isEmailSaving: false,
            isPhoneSaving: false,
            isFrequencySaving: false,
            isGroupSaving: false,
            groupIdSaving: 0,
            isNameEdit: false,
            isEmailEdit: false,
            isPhoneEdit: false,
            isFrequencyEdit: false,
            saveInterval: 1 * 1000,

            // Background colors for save/error fields
            defaultColor: "#F7F1F1",
            successColor: "#86F3B2",
            errorColor: "#F88F8F",
            sliderBackgroundColor: "#85BCCB",
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
            return ((this.formName ? this.formName.trim() : "") === "") && this.isEdit;
        },
        
        emailError() {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;            // Note simple anystring@anystring.anystring and checking no double @
            return (this.formEmail.trim() === "" || !re.test(this.formEmail)) && this.isEdit;
        },

        frequencyError() {
            return typeof this.frequencyOptions[this.formFrequency-1] === 'undefined' && this.isEdit;
        },

        phoneNumberError() {
            return !this.isValidPhoneNumber && this.isEdit;
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

        isValidPhoneNumber() {
            // Trim off any leading zero and add country dial code
            let phoneNumber = (this.formPhone === undefined) ? '' : this.formPhone.replace(/^(\(0\)|0)/,'');
            phoneNumber = this.formCountryDialCode + phoneNumber;

            // Validate using the google lib
            return PhoneNumberProvider.isValidMobile(phoneNumber, this.formCountryCode);
        },

        nameEditIcon() { 
            return (this.isEdit && this.formName !== this.originalFormName ? (this.nameError || this.isEmailSaving || this.isPhoneSaving || this.isFrequencySaving || this.isGroupSaving ? 'res://icons_button_tick_gray' : 'res://icons_button_tick') : '');
        },

        emailEditIcon() { 
            return (this.isEdit && this.formEmail !== this.originalFormEmail ? (this.emailError || this.isNameSaving || this.isPhoneSaving || this.isFrequencySaving || this.isGroupSaving ? 'res://icons_button_tick_gray' : 'res://icons_button_tick') : '');
        },

        phoneEditIcon() { 
            return (this.isEdit && (this.formPhone !== this.originalFormPhone || this.formCountryDialCode !== this.originalFormCountryDialCode) ? (this.phoneNumberError ? 'res://icons_phonenumber_invalid' : this.isNameSaving || this.isEmailSaving || this.isFrequencySaving || this.isGroupSaving ? 'res://icons_button_tick_gray' : 'res://icons_button_tick') : '');
        },

        frequencyEditIcon() { 
            return (this.isEdit ? (this.frequencyError || this.formFrequency === this.originalFormFrequency || this.isNameSaving || this.isEmailSaving || this.isPhoneSaving || this.isGroupSaving ? 'res://icons_tick_gray' : 'res://icons_tick') : "");
        },

        groupEditIcon() {
            return (this.isEdit ? (this.isNameSaving || this.isEmailSaving || this.isPhoneSaving || this.isFrequencySaving || this.isGroupSaving ? 'res://icons_button_cross_gray' : 'res://icons_button_cross') : '');
        },

        nameBackgroundColor() {
            if (this.isNameEdit && this.isSaveError) return this.errorColor;
            if (this.isNameEdit && this.isSaveSuccess) return this.successColor;
            return this.defaultColor;
        },

        emailBackgroundColor() {
            if (this.isEmailEdit && this.isSaveError) return this.errorColor;
            if (this.isEmailEdit && this.isSaveSuccess) return this.successColor;
            return this.defaultColor;
        },

        phoneBackgroundColor() {
            if (this.isPhoneEdit && this.isSaveError) return this.errorColor;
            if (this.isPhoneEdit && this.isSaveSuccess) return this.successColor;
            return this.defaultColor;
        },

        frequencyBackgroundColor() {
            if (this.isFrequencyEdit && this.isSaveError) return this.errorColor;
            if (this.isFrequencyEdit && this.isSaveSuccess) return this.successColor;
            return this.sliderBackgroundColor;
        },

        groupBackgroundColor() {
            return (groupId) => {
                if (this.isGroupRemove && this.isSaveError && groupId === this.groupIdSaving) return this.errorColor;
                return this.defaultColor;
            }
        },
    },

    mounted() {
        // Stash original form values so we can know if they changed
        this.originalFormName = this.formName;
        this.originalFormEmail = this.formEmail;
        this.originalFormPhone = this.formPhone,
        this.originalFormCountryCode = this.formCountryCode;
        this.originalFormCountryDialCode = this.formCountryDialCode;
        this.originalFormPhoneNationalNumber = this.formPhoneNationalNumber;
        this.originalFormFrequency = this.formFrequency;

        // Set the flag image
        this.setFlagImage();
    },

    beforeUnmount() {
        if (this.saveTimer) {
            clearTimeout (this.saveTimer);
        }
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

        onEdit() {
            this.isEdit = true;
        },

        onCancelEdit() {
            this.resetForm();
            this.isEdit = false;
        },

        resetForm() {
            // Save original form values
            this.formName = this.originalFormName;
            this.formEmail = this.originalFormEmail;
            this.formPhone = this.originalFormPhone;
            this.formCountryCode = this.originalFormCountryCode;
            this.formCountryDialCode = this.originalFormCountryDialCode;
            this.formPhoneNationalNumber = this.originalFormPhoneNationalNumber;
            this.formFrequency = this.originalFormFrequency;

            // Set the flag image
            this.setFlagImage();

            // Reset any save states
            this.isNameEdit = false;
            this.isEmailEdit = false;
            this.isPhoneEdit = false;
            this.isGroupRemove = false;
            this.isNameSaving = false;
            this.isEmailSaving = false;
            this.isPhoneSaving = false;
            this.isSaveSuccess = false;
            this.isSaveError = false;
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
            if (!this.isEdit) return;

            // Show the modal and update country codes on results
            this.$showModal(CountrySelect, { fullscreen: true })
                .then((result) => {
                    if (result && result.hasOwnProperty('iso2') && result.hasOwnProperty('dialCode')) {
                        this.formCountryCode = result['iso2'];
                        this.formCountryDialCode = '+' + result['dialCode'];
                        this.setFlagImage();
                    }

                    console.log(this.originalFormCountryCode, this.originalFormCountryDialCode, this.originalFormPhone, result['iso2'], result['dialCode'], this.formPhone);
                });
        },
        
        onTapSaveForm(field) {
            this.isSaveSuccess = false;
            this.isSaveError = false;

            // Validate fields and only let one field save at once
            if (field === 'name' && (this.nameError || this.isEmailSaving || this.isPhoneSaving || this.isFrequencySaving || this.isGroupSaving || this.formName === this.originalFormName)) return;
            if (field === 'email' && (this.emailError || this.isNameSaving || this.isPhoneSaving || this.isFrequencySaving || this.isGroupSaving || this.formEmail === this.originalFormEmail)) return;
            if (field === 'phone' && (this.phoneNumberError || this.isNameSaving || this.isEmailSaving || this.isFrequencySaving || this.isGroupSaving || (this.formPhone === this.originalFormPhone && this.formCountryDialCode === this.originalFormCountryDialCode))) return;
            if (field === 'frequency' && (this.frequencyError || this.isNameSaving || this.isEmailSaving || this.isPhoneSaving || this.isGroupSaving || this.formFrequency === this.originalFormFrequency)) return;

            // Set the save state for the field
            if (field === 'name') { this.isNameEdit = true; this.isNameSaving = true; }
            if (field === 'email') { this.isEmailEdit = true; this.isEmailSaving = true; }
            if (field === 'phone') { this.isPhoneEdit = true; this.isPhoneSaving = true; }
            if (field === 'frequency') { this.isFrequencyEdit = true; this.isFrequencySaving = true; }

            // Simulate success
            setTimeout(() => {
                if (field === 'name') { this.isNameSaving = false; }
                if (field === 'email') { this.isEmailSaving = false; }
                if (field === 'phone') { this.isPhoneSaving = false; }
                if (field === 'frequency') { this.isFrequencySaving = false; }

                //this.isSaveSuccess = true;
                this.isSaveError = true;

                // TODO: Trim length of fields
                
                // Update fields to saved values
                if (this.isSaveSuccess) {
                    this.originalFormName = this.formName;
                    this.originalFormEmail = this.formEmail;
                    this.originalFormPhone = this.formPhone,
                    this.originalFormCountryCode = this.formCountryCode;
                    this.originalFormCountryDialCode = this.formCountryDialCode;
                    this.originalFormPhoneNationalNumber = this.formPhoneNationalNumber;
                    this.originalFormFrequency = this.formFrequency;
                }

                // Flash background color based on save result
                this.saveTimer = setTimeout(() => {
                    if (field === 'name') { this.isNameEdit = false; }
                    if (field === 'email') { this.isEmailEdit = false; }
                    if (field === 'phone') { this.isPhoneEdit = false; }
                    if (field === 'frequency') { this.isFrequencyEdit = false; }
                    this.isSaveError = false;
                    this.isSaveSuccess = false;
                }, this.saveInterval);

            }, 1000);
        },

        onTapRemoveGroup(groupId) {
            const group = this.groupsList.find((g) => g.groupId === groupId);
            return Dialogs.confirm('Really remove this contact from ' + group.groupName + '?')
                .then((result) => {
                    if (result) {
                        this.isSaveSuccess = false;
                        this.isSaveError = false;

                        // Save state for this group
                        this.isGroupSaving = true;
                        this.isGroupRemove = true;
                        this.groupIdSaving = groupId;

                        // Simulate success
                        setTimeout(() => {
                            this.isGroupSaving = false;

                            //this.isSaveSuccess = true;
                            this.isSaveError = true;

                            // Update fields to saved values
                            if (this.isSaveSuccess) {
                                this.groupsList = this.groupsList.filter(item => item.groupId !== this.groupId);
                            }

                            // Flash background color based on save result
                            this.saveTimer = setTimeout(() => {
                                this.isGroupRemove = false;
                                this.groupIdSaving = 0;
                                this.isSaveError = false;
                                this.isSaveSuccess = false;
                            }, this.saveInterval);

                        }, 1000);
                        
                        return true;
                    } else {
                        return false;
                }
            });
        },

        onTapAddToGroup() {
            // Show the choose group modal and update the groupList on close
            this.$showModal(GroupSelect, { fullscreen: true })
            .then((result) => {
                // Update the group list
                this.groupsList = result;
            });
        },

        onDelete() {
            console.log('deleting user');
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