<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <GridLayout rows="*,2*,*" iosOverflowSafeArea="true">

        <!-- heading and blurb -->   
        <StackLayout row="1" verticalAlignment="top" horizontalAlignment="center">
            <!-- heading -->
            <Label :textWrap="false" class="heading" text="Positive Sum +Σ" />

            <!-- blurb -->
            <Label marginTop="40" :textWrap="true" class="heading-blurb" text="+Σ is a peer-support network of startups, innovators, and community-builders, who are committed to help each other grow by sharing their knowledge, networks, & know-how to help each other succeed." />
        </StackLayout>

        <!-- Buttons and links -->   
        <StackLayout row="2" verticalAlignment="top" horizontalAlignment="center">
            <!-- login link -->
            <Label class="link" marginTop="25" text="Sign Up" @tap="$goto('signup')" />

            <!-- login link -->
            <Label class="link" marginTop="25" text="Login" @tap="$goto('login')" />
        </StackLayout>
    </GridLayout>
  </Page>
</template>

<script>
//const utilsModule = require("tns-core-modules/utils/utils");

// In-page components
// import AppButton from '~/components/widgets/AppButton';

export default {
    /*components: {
        AppButton,
    },*/

    methods: {
        onPageLoaded(event) {
            // Set the Status bar style (light or dark based on the *page* content)
            event.object.page.statusBarStyle = 'dark';
        },
    }
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/theme-variables.scss';
/*Page {
  background-image: url('~/assets/images/main-background.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}*/

/*.heading {
  text-align: center;
  color: $color-heading;
  font-size: $font-size;
  font-family: $font-family-semibold;
  font-weight: $font-weight-semibold;
  margin-left: $main-container-margin + 25;
  margin-right: $main-container-margin + 25;
  line-height: 5;
}*/

/*.heading-blurb {
    text-align: center;
    color: $color-heading-blurb;
}*/


/*.link {
  text-align: center;
  color: $color-hyperlink;
  font-size: $font-size;
  font-family: $font-family;
  font-weight: $font-weight;
}*/
</style>