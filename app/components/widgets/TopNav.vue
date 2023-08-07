<template>
    <!-- Top Nav Buttons -->
    <GridLayout class="topnav" rows="26" columns="26,*,26" iosOverflowSafeArea="true" marginLeft="20" marginRight="20" marginTop="20" marginBottom="10" v-bind="$attrs">
        <Image col="0" class="topnav-icon-left" width="26" height="26" stretch="aspectFit" :src="leftIconSrc" @tap="onTapLeftIcon" v-if="hasLeftIcon" />
        <Label col="1" class="topnav-title" horizontalAlignment="center" :text="title"></Label>
        <Image col="2" class="topnav-icon-left" width="26" height="26" horizontalAlignment="right" stretch="aspectFit" :src="rightIconSrc" marginLeft="15" @tap="onTapRightIcon" v-if="hasRightIcon" />
    </GridLayout>
</template>

<script>
// In-page components
import { Dialogs } from "@nativescript/core";

// Use the social-share plugin to access share button functionality
import { shareText } from '@nativescript/social-share'

export default {
    props: {
        // Title Config
        title: { type: String, default: "" },

        // Left Button Config
        leftIsBackButton: { type: Boolean, default: false },
        leftIsCloseButton: { type: Boolean, default: false },
        leftIsHomeButton: { type: Boolean, default: false },
        modalData: { type: [ String, Boolean, Array, Object ], default: true },

        // Right Button Config
        rightIsHelpButton: { type: Boolean, default: false },
        rightIsEditButton: { type: Boolean, default: false },
        rightIsCancelEditButton: { type: Boolean, default: false },
        rightIsProfile: { type: Boolean, default: false },
        rightRoute: { type: [ String, Boolean ], default: false },
        rightIsShareButton: { type: Boolean, default: false },
        shareData: { type: Object, default() { return {} } },
        shareSubject: { type: String, default: null },
        rightIsDeleteButton: { type: Boolean, default: false },
        deleteText: { type: String, default: "Please confirm you wish to delete this item?" },
    },
    
    data() {
        return {
            homeRoute: 'home',
        }
    },
    
    computed: {
        hasLeftIcon() {
            return this.leftIsBackButton || this.leftIsCloseButton || this.leftIsHomeButton;
        },

        hasRightIcon() {
            return this.rightIsHelpButton || this.rightIsProfile || this.rightIsShareButton || this.rightIsDeleteButton || this.rightIsEditButton || this.rightIsCancelEditButton;
        },

        // Return a string version of the left icon type (or false if no icon)
        leftType() {
            if (!this.hasLeftIcon) return false;
            if (this.leftIsBackButton) return "back";
            if (this.leftIsCloseButton) return "close";
            if (this.leftIsHomeButton) return "home";
            return false;
        },
        
        rightType() {
            // Return a string version of the right icon type (or false if no icon)
            if (!this.hasRightIcon) return false;
            if (this.rightIsHelpButton) return "help";
            if (this.rightIsShareButton) return "share";
            if (this.rightIsDeleteButton) return "delete";
            if (this.rightIsProfile) return "profile";
            if (this.rightIsEditButton) return "edit";
            if (this.rightIsCancelEditButton) return "canceledit";
            return false;
        },

        leftIconSrc() {
            switch (this.leftType) {
                case "back": { return "res://icons_back"; }
                case "close": { return "res://icons_close"; }
                case "home": { return "res://icons_home"; }
                default: { return ""; }
            }
        },

        rightIconSrc() {
            switch (this.rightType) {
                case "help": { return "res://icons_help"; }
                case "share": { return "res://icons_share"; }
                case "delete": { return "res://icons_delete"; }
                case "profile": { return "res://icons_profile"; }
                case "edit": { return "res://icons_edit"; }
                case "canceledit": { return "res://icons_close"; }
                default: { return ""; }
            }
        },

        backNavOptions() {
            return { transition: { name: "slideRight", duration: 300, curve: "ease" } }
        },
      
        navOptions() {
            return { transition: { name: "slideLeft", duration: 300, curve: "ease" } }
        },
    },

    methods: {
        onTapLeftIcon() {
            // Perform different action based on icon type
            switch (this.leftType) {
                case "back": { return this.onTapBack(); }
                case "close": { return this.onTapClose(); }
                case "home": { return this.onTapHome(); }
                default: { return true; }
            }
        },
        
        onTapRightIcon() {
            // Perform different action based on icon type
            switch (this.rightType) {
                case "help": { return this.onTapHelp(); }
                case "share": { return this.onTapShare(); }
                case "delete": { return this.onTapDelete(); }
                case "profile": { return this.onTapProfile(); }
                case "edit": { return this.onTapEdit(); }
                case "canceledit": { return this.onTapCancelEdit(); }
                default: { return true; }
            }
        },

        onTapBack() {
            // Let parent know we performed an action so it can respond if needed
            this.$emit('back');

            // Navigate
            this.$navigateBack(this.backNavOptions);
        },

        onTapClose() {
            // Let parent know we performed an action so it can respond if needed
            this.$emit('close', this.modalData);

            // Pass back any modal data that was passed in
            this.$modal.close(this.modalData);
        },

        onTapHome() {
            // Let parent know we performed an action so it can respond if needed
            this.$emit('home');

            // We clear the history when going to the home page
            let options = { clearHistory: true, ...this.backNavOptions };
            this.$goto(this.homeRoute, options);
        },

        onTapHelp() {
            // Let parent know we performed an action so it can respond if needed
            this.$emit('help', { route: this.rightRoute });

            if (this.rightRoute) {
                this.$goto(this.rightRoute, this.navOptions);
            }
        },

        onTapShare() {
            // Let parent know we performed an action so it can respond if needed
            this.$emit('share', { data: this.shareData });

            // Show the share dialog
            if (Object.keys(this.shareData).length) {
                shareText(JSON.stringify(this.shareData), this.shareSubject);
            }
        },

        async onTapDelete() {
            return Dialogs.confirm(this.deleteText)
                .then((result) => {
                    if (result) {
                        console.log('delete');
                        return true;
                    } else {
                        console.log('cancel delete');
                        return false;
                }
            });
        },

        onTapProfile() {
            // Let parent know we performed an action so it can respond if needed
            this.$emit('profile', { route: this.rightRoute });

            if (this.rightRoute) {
                this.$goto(this.rightRoute, this.navOptions);
            }
        },

        onTapEdit() {
            // Let parent know we performed an action so it can respond if needed
            this.$emit('edit');
        },

        onTapCancelEdit() {
            // Let parent know we performed an action so it can respond if needed
            this.$emit('canceledit');
        },
    },
  }
</script>

<style scoped lang="scss">
  @import '~/assets/scss/app.scss';
</style>