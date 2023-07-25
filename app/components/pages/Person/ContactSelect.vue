<template>
    <Page actionBarHidden="true" @loaded="onPageLoaded">
        <DockLayout>
        
            <!-- Top Nav -->
            <TopNav dock="top" title="Contact" :leftIsCloseButton="true" />
        
            <StackLayout marginRight="20" marginTop="20" marginBottom="10" marginLeft="20">
                <!-- Search bar to filter results -->
                <SearchField :search="searchStr" :preventFocus="true" @textChange="onSearchQueryChange" @returnPress="onSearchQueryChange" />

                <!-- Arrow Image -->
                <Image v-if="searchResults.length" width="26" height="26" src="res://icons_chevron_bottom" class="chevron" />
                
                <!-- Loading and no contacts messages -->
                <label verticalAlignment="middle" horizontalAlignment="center" class="paragraph" text="Contacts loading..." marginTop="100" v-if="loadingContacts"></label>
                <label verticalAlignment="middle" horizontalAlignment="center" class="paragraph" text="No contacts found" marginTop="100" v-if="!loadingContacts && !searchResults.length"></label>

                <ScrollView scrollBarIndicatorVisible="true" class="maxheight">
                    <ListView for="person in searchResults" rowHeight="60" height="100%" marginRight="10" marginBottom="10" marginLeft="10" separatorColor="transparent">
                        <v-template>
                            <StackLayout>
                                <GridLayout columns="10,*,36" rows="25,25" class="list-item" @tap="selectPerson(person)">
                                    <Label :text="person.name" row="0" col="1" class="person-name"></Label>
                                    <Label v-if="person.emailAddress" :text="person.emailAddress" row="1" col="1" class="person-detail"></Label>
                                    <Label v-else-if="person.phoneNumber" :text="person.phoneNumber" row="1" col="1" class="person-detail"></Label>
                                    <Image marginRight="10" col="2" rowSpan="2" width="26" height="26" src="res://icons_listbutton_add" class="person-add" />
                                </GridLayout>
                            </StackLayout>
                        </v-template>
                    </ListView>
                </ScrollView>
            </StackLayout>
        </DockLayout>
    </Page>
</template>

<script>
// In-page components
import TopNav from '~/components/widgets/TopNav';
import SearchField from '~/components/widgets/SearchField';

// Use the nativescript-community/perms to check and request device permissions
import { request as requestPermission } from '@nativescript-community/perms';

// Uses the @nativescript/contacts for accessing contact records
import { Contacts } from '@nativescript/contacts';

// Use the telephony plugin to get country code details from the phone sim
import * as PhoneNumberProvider from '~/common/phonenumber';
const Sim = require('nativescript-telephony');

export default {
    components: {
        TopNav,
        SearchField,
    },
    
    props: {
        search: { type: String, default: "" },
        defaultCountryCode: { type: String, default: "nz" },
    },

    // Update local mutators from changing props
    watch: {
        search(index) {
            this.searchStr = this.search;
        },
    },
    
    data() {
        return {
            searchStr: '',
            rawContacts: [],                    // from device
            allContacts: [],                    // simpler format we can use
            selectedContacts: [],
            loadingContacts: true,
            showMaxResultsMessage: false,
            showMaxResultMessageTimer: null,

            // Country code defaults
            countryCode: '',
        }
    },

    computed: {
        searchResults() {
            // Remove selected contacts from the list
            const nonSelected = !this.selectedContacts.length ? [...this.allContacts] : this.allContacts.filter(p => !this.selectedContacts.some( c => c['id'] === p['id'] ));

            // Filter list for the search term
            const search = this.searchStr.toLowerCase().trim();
            return (search) ? nonSelected.filter(p => p.name.toLowerCase().indexOf(search) > -1) : nonSelected;
        }
    },
    
    created() {
        // Get all contacts list from the phone contacts
        this.getAllContactsFromPhone();

        // Try to get default country code details based on phone number/sim card
        Sim.Telephony().then((info) => {
            if (info.hasOwnProperty('countryCode')) { 
                this.countryCode = info['countryCode'] || this.defaultCountryCode; 
            }
        }, (error) => {
            console.warn('ContactSelect: Unable to retrieve SIM card info to get default country code');
            console.warn(error);
            
            // Set to defaults
            this.countryCode = this.defaultCountryCode;
        });
    },
    
    mounted() {
        // Create local mutator for passed in search string
        this.searchStr = this.search;
    },

    methods: {
        onPageLoaded(event) {
            // Set the Status bar style (light or dark based on the *page* content)
            event.object.page.statusBarStyle = 'dark';
        },

        getAllContactsFromPhone() {
            // Check we have permissions otherwise close the app and return a message
            requestPermission('contact').then(response => {
                if (response[0] !== 'authorized' && response[0] !== 'limited') {
                    this.$modal.close({ authorized: false });
                } else {
                    // Specify which fields we want to reduce processing time
                    const contactFields = ['name', 'emailAddresses', 'phoneNumbers'];
                    
                    // Populate All contacts
                    Contacts.getAllContacts(contactFields).then(
                        (results) => {
                            // Returns args:
                            // args.data: Generic cross platform JSON object, null if no contacts were found.
                            // args.response: "fetch"

                            // Save raw data
                            if (!results.data) {
                                this.rawContacts = [];
                            } else {
                                this.rawContacts = results.data;
                            }

                            /*
                            Sample contact data (from iOS)

                            {
                                "id": "177C371E-701D-42F8-A03B-C61CA31627F6",
                                "name": {
                                "given": "Kate",
                                "middle": "",
                                "family": "Bell",
                                "prefix": "",
                                "suffix": "",
                                "displayname": "",
                                "phonetic": {
                                "given": "",
                                "middle": "",
                                "family": ""
                                }
                                },
                                "organization": {
                                "name": "",
                                "jobTitle": "",
                                "department": ""
                                },
                                "nickname": "",
                                "notes": "",
                                "photo": null,
                                "urls": [],
                                "phoneNumbers": [
                                {
                                "id": "EF48385D-28C2-48DE-AAB3-A81BC5F16981",
                                "label": "Mobile",
                                "value": "(555) 564-8583"
                                },
                                {
                                "id": "3CD5F927-B150-4104-918B-C26DD6AC811B",
                                "label": "Main",
                                "value": "(415) 555-3695"
                                }
                                ],
                                "emailAddresses": [
                                {
                                "id": "93D6F4AF-5C10-43FC-8405-A8BB02F2F9F7",
                                "label": "Work",
                                "value": "kate-bell@mac.com"
                                }
                                ],
                                "postalAddresses": []
                            }

                            */
                            
                            // Map this into a simpler format for rendering
                            this.allContacts = this.mapSimpleContactData(this.rawContacts).sort(this.sortContacts);
                        },
                        (err) => {
                            this.$modal.close({ lookupFailed: false });
                        }
                    );
                }
            }).catch((err) => {
                console.error("Failed to requestPermissions", err);
                this.$modal.close({ authorized: false });
            }).finally(() => setTimeout(() => this.loadingContacts = false, 100 ));
        },

        // convert raw contact data into a structure we can easily use
        mapSimpleContactData(input) {
            let mapped = input.map(contact => {
                let c = {};
                
                c.id = contact.id;
                c.name = contact.name.given + ' ' + contact.name.family;
                c.firstName = contact.name.given;
                c.lastName = contact.name.family;
                c.sortName = contact.name.family + ' ' + contact.name.given;
                
                // Email is an array and could have multiple entries, if so, we take the first entry
                c.emailAddresses = contact.emailAddresses;
                if (contact.emailAddresses && contact.emailAddresses.length === 1) {
                    c.emailAddress = contact.emailAddresses[0].value;    
                } else {
                    c.emailAddress = "";
                }
                
                // For phone numbers, we look for mobile, otherwise fall back to first number
                c.phoneNumbers = contact.phoneNumbers;
                if (contact.phoneNumbers) {
                    if (contact.phoneNumbers.length === 1) {
                        c.phoneNumber = contact.phoneNumbers[0].value;    
                    } else {
                        const found = contact.phoneNumbers.find(x => x.label.toLowerCase() === 'mobile');
                        c.phoneNumber = found ? found.value : contact.phoneNumbers[0].value;            // fallback to first number
                    }
                } else {
                    c.phoneNumber = "";
                }

                return c;

            });
            return mapped;
        },

        sortContacts(a, b) {
            // Use toUpperCase() to ignore character casing
            const nameA = a.sortName.toUpperCase();
            const nameB = b.sortName.toUpperCase();
            let comparison = 0;
            if (nameA > nameB) {
                comparison = 1;
            } else if (nameA < nameB) {
                comparison = -1;
            }
            return comparison;
        },

        onSearchQueryChange(event) {
            this.searchStr = event.value;
        },

        selectPerson(person) {
            // We convert the selected phone number into an international format number - first test if it's already in that format
            let p = Object.assign({}, person);

            // Get the international components of the number so we can format the return value
            if (p.phoneNumber) {
                p.internationalPhoneNumber = PhoneNumberProvider.getInternationalPhoneNumber(p.phoneNumber, this.countryCode);
            }

            // Close window and return the selected contact
            this.$modal.close(p);
        },
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';

.list-item {
    background-color: $color-form-input-background;
    border-radius: $button-radius;
}

.chevron {
    margin-top: 10;
    margin-bottom: 0;
}

.maxheight {
    height: 100%;
    min-height: 100%;
}
    
.person-name {
    color: $color-listbutton;
    font-family: $font-family-semibold;
    font-weight: $font-weight-semibold;
    padding-bottom: 0;
    padding-left: 0;
}

.person-detail {
    color: $color-primary-muted;
    font-family: $font-family-italic;
    font-style: italic;
    font-size: $font-size-listbutton-small;
    padding-top: 0;
    padding-left: 0;
}
</style>