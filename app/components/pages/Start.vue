<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded" class="page-background">
    <DockLayout>
        <GridLayout rows="*,auto,auto" iosOverflowSafeArea="true" marginLeft="20" marginRight="20" marginTop="20" marginBottom="10" dock="bottom">

            <!-- heading and blurb -->   
            <StackLayout row="1" dock="bottom">
                <!-- heading -->
                <Label :textWrap="false" class="heading" text="Positive Sum +Σ" />

                <!-- blurb -->
                <Label marginTop="40" :textWrap="true" class="title-blurb" text="+Σ is a peer-support network of startups, innovators, and community-builders, who are committed to help each other grow by sharing their knowledge, networks, & know-how to help each other succeed." />
            </StackLayout>

            <!-- Buttons and links -->   
            <StackLayout marginTop="40" row="2" verticalAlignment="top" horizontalAlignment="center" dock="bottom">
                <!-- Sign up button -->
                <Button class="button-primary" text="Sign Up" @tap="onTapSignUp"></Button>

                <!-- Login button -->
                <Button marginTop="10" class="button-inverted" text="Login" @tap="onTapLogin"></Button>
            </StackLayout>
        </GridLayout>
    </DockLayout>
  </Page>
</template>

<script>
import { Page } from '@nativescript/core/ui/page';

export default {
    data() {
        return {
            loginFrameName: 'Start_LoginFrame',
            signupFrameName: 'Start_SignUpFrame',
        }
    },
    
    methods: {
        onPageLoaded(event) {
            // Set the Status bar style (light or dark based on the *page* content)
            event.object.page.statusBarStyle = 'dark';
        },

        async onTapLogin() {
            const data = await this.$showModal(LoginFrame, { fullscreen: true, props: { isPopover: true, frame: this.loginFrameName } });
        },

        async onTapSignUp() {
            const data = await this.$showModal(SignUpFrame, { fullscreen: true, props: { isPopover: true, frame: this.signupFrameName } });
        },
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';

.heading {
    text-align: center;
}

.title-blurb {
    color: $color-primary-muted;
    text-align: center;
    line-height: $line-height-title-blurb;
}

.page-background {
    background-color: transparent;
    background-image: url('~/assets/images/background.png');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
}
</style>