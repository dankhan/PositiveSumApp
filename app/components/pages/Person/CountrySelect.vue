<template>
    <Page actionBarHidden="true" @loaded="onPageLoaded">
        <DockLayout>
        
            <!-- Top Nav -->
            <TopNav dock="top" title="Select Country" :leftIsCloseButton="true" />
        
            <StackLayout marginRight="20" marginTop="20" marginBottom="10" marginLeft="20">
        
                <!-- Search bar to filter results -->
                <SearchBar ref="searchBar" hint="Search" @textChange="searchCountryCode" class="form-input" />

                <!-- Arrow Image -->
                <Image v-if="countriesFound.length" width="26" height="26" src="res://icons_chevron_bottom" class="chevron" />

                <ListView for="item in countriesFound" rowHeight="60" height="100%" marginRight="10" marginBottom="10" marginLeft="10" separatorColor="transparent">
                    <v-template>
                        <!-- template wrapped in StackLayout for class list-item to take effect -->
                        <StackLayout>
                            <GridLayout columns="40,*" rows="auto,auto" class="list-item" @tap="selectCountry($event, item)">
                                <Image v-if="item.flag" :src="'data:image/png;base64,'+item.flag" class="flag" />
                                <Label :text="item.name" row="0" col="1" class="country-name" />
                                <Label :text="'+'+item.dialCode" row="1" col="1" class="country-dialcode" />
                            </GridLayout>
                        </StackLayout>
                    </v-template>
                </ListView>
            </StackLayout>
        </DockLayout>
    </Page>
</template>

<script>
// Use the telephony plugin to get country code details from the phone sim
import { isAndroid } from "@nativescript/core/platform";
import * as PhoneNumberProvider from '~/common/phonenumber';

// In-page components
import TopNav from '~/components/widgets/TopNav';

export default {
    components: {
        TopNav,
    },
    
    data() {
      return {
        countriesFound: [],
      }
    },

    mounted() {
        this.preventFocus();
        this.countriesFound = PhoneNumberProvider.countries;
    },

    methods: {
        onPageLoaded(event) {
            // Set the Status bar style (light or dark based on the *page* content)
            event.object.page.statusBarStyle = 'dark';
        },

        searchCountryCode(event) {
            // trim out anything other than characters
            let str = event.value.replace(/[\\+0-9]/g, "");
            let regex = new RegExp(str, 'i');
            this.countriesFound = PhoneNumberProvider.countries.filter((country) => regex.test(country.name));
        },

        selectCountry(_event, country) {
            // Close window and return the selected information
            console.log({ name: country.name, iso2: country.iso2, dialCode: country.dialCode});
            this.$modal.close({ name: country.name, iso2: country.iso2, dialCode: country.dialCode});
        },

        /*
            SearchBar automatically gains focus when loaded on Android and triggers soft keyboard
            This method dismisses clears focus and dismisses soft keyboard
        */
        preventFocus() {
            if (isAndroid) {
                if (this.$refs.searchBar.nativeElement.android) {
                    setTimeout(() => { this.$refs.searchBar.nativeElement.android.clearFocus(); }, 0); // clears focus and dismisses soft keyboard
                } else {
                    setTimeout(() => { this.preventFocus(); }, 10); // sometimes nativeElement is not available yet
                }
            }
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

.flag {
    border-radius: 3;
    width: 30;
}

.country-name {
    color: $color-listbutton;
    font-family: $font-family-semibold;
    font-weight: $font-weight-semibold;
    font-size: $font-size;
}

.country-dialcode {
    color: $color-primary-muted;
    font-family: $font-family-semibold;
    font-weight: $font-weight-semibold;
    font-size: $font-size;
}

.chevron {
    margin-top: 10;
    margin-bottom: 0;
}
</style>