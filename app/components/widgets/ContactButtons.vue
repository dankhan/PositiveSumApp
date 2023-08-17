<template>
    <!-- Contact Buttons -->
    <GridLayout :columns="columns" marginBottom="0" v-bind="$attrs">
        <Button col="1" :class="{ 'button-primary': email.length, 'button-primary-disabled': !email.length }" backgroundImage="res://icons_button_email" backgroundRepeat="no-repeat" backgroundPosition="10% 50%" @tap="onTapAction('email')">
            <FormattedString>
                <Span text="    Email" class="button-label"></Span>
            </FormattedString>
        </Button>
        
        <Button col="4" :class="{ 'button-primary': phone.length, 'button-primary-disabled': !phone.length }" backgroundImage="res://icons_button_phone" backgroundRepeat="no-repeat" backgroundPosition="15% 50%" @tap="onTapAction('phone')">
            <FormattedString>
                <Span text="    Call" class="button-label"></Span>
            </FormattedString>
        </Button>
        
        <Button col="7" :class="{ 'button-primary': phone.length, 'button-primary-disabled': !phone.length }" backgroundImage="res://icons_button_msg" backgroundRepeat="no-repeat" backgroundPosition="15% 55%" @tap="onTapAction('msg')">
            <FormattedString>
                <Span text="    Msg" class="button-label"></Span>
            </FormattedString>
        </Button>

        <!-- Share Button -->
        <Image col="9" width="26" height="26" horizontalAlignment="right" stretch="aspectFit" src="res://icons_share" marginLeft="10" @tap="onTapShare" v-if="hasShare" />
        <Image col="9" width="26" height="26" horizontalAlignment="right" stretch="aspectFit" src="res://icons_profile" marginLeft="10" @tap="onTapContact" v-if="hasContact" />
    </GridLayout>
</template>

<script>
// In-page components
import { openApp } from "@/common/openApp";

// Use the social-share plugin to access share button functionality
import { shareText } from '@nativescript/social-share';

export default {
    props: {
        userId: { type: Number, default: 0 },
        name: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        countryDialCode: { type: String, default: '' },
        nationalNumber: { type: String, default: '' },
        hasShare: { type: Boolean, default: false },
        hasContact: { type: Boolean, default: false },
    },
    
    data() {
        return {
        }
    },
    
    computed: {
        navOptions() {
            return { transition: { name: "slideLeft", duration: 300, curve: "ease" }, props: { userId: this.userId } }
        },
        
        hasIcon() {
            return this.hasShare || this.hasContact;
        },
        
        columns() {
            return this.hasIcon ? 'auto,*,10,auto,*,10,auto,*,10,30' : 'auto,*,10,auto,*,10,auto,*';
        }
    },

    methods: {
        onTapAction(type) {
            // Opening apps differs on android and iOS
            let url = '';
            let scheme = '';
            let appUrl = '';
            let action = '';
            let data = '';

            if (global.isIOS) {
                // Use scheme URLs
                if (type === 'email') {
                    url = this.email.length ? this.email : '';
                    scheme = 'mailto';
                }

                if (type === 'phone') {
                    url = this.nationalNumber.length && this.phone.length ? this.nationalNumber + this.phone : '';
                    scheme = 'tel';
                }

                if (type === 'msg') {
                    url = this.nationalNumber.length && this.phone.length ? this.nationalNumber + this.phone : '';
                    scheme = 'sms';
                }

                if (url.length && scheme.length) {
                    const appUrl = scheme + ':' + url;
                }
            } else {
                // Use android application Ids
                const emailAppId = 'com.google.android.gm';                 // gmail
                const messagesAppId = 'com.google.android.apps.messaging';
                const phoneAppId = 'com.google.android.dialer';

                if (type === 'email') {
                    url = emailAppId;
                    action = android.content.Intent.ACTION_SENDTO;
                    data = this.email.length ? 'mailto:' + this.email : '';
                }

                if (type === 'phone') {
                    url = phoneAppId;
                    action = android.content.Intent.ACTION_DIAL;
                    data = this.phone.length ? 'tel:+' + this.nationalNumber + this.phone : '';
                }

                if (type === 'msg') {
                    url = messagesAppId;
                    action = android.content.Intent.ACTION_VIEW;
                    scheme = 'sms';
                    data = this.phone.length ? 'tel:+' + this.nationalNumber + this.phone : '';
                }
            }

            // open the app
            if (url.length) {
                openApp(appUrl, true, null, action, data);
            }
        },
        
        onTapShare() {
            const share = {
                "name": this.name,
                "email": this.email,
                "phone": this.nationalNumber,
            };
            shareText(JSON.stringify(share), this.name);
        },

        onTapContact() {
            // Show the modal and update country codes on results
            this.$goto("viewPerson", this.navOptions);
        },
    }
  }
</script>

<style scoped lang="scss">
  @import '~/assets/scss/app.scss';
</style>