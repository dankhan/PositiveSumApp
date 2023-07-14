<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <!--<GridLayout rows="90,auto,* auto,*,auto,auto,*,auto,2*" iosOverflowSafeArea="true" class="page-container" v-if="!loadingDashboard">

      <-- heading --
      <StackLayout row="1" verticalAlignment="top" horizontalAlignment="center" v-if="!fromChangePassword">
        <Label text="Sign-In" class="heading" marginBottom="15" />
        <Label text="Please enter your sign-in details to continue" class="blurb" />
      </StackLayout>

      <StackLayout row="1" verticalAlignment="top" horizontalAlignment="center" v-if="fromChangePassword">
        <Label text="Please sign-in now" class="heading" marginBottom="15" />
        <Label text="Sign-in with your new details to continue" class="blurb" />
      </StackLayout>

      <-- form --
      <StackLayout row="5" verticalAlignment="middle" horizontalAlignment="center" class="container">
        <TextField v-model="formEmail" hint="Your email..." class="form-input" keyboardType="email" :autocorrect="false" @textChange="formEmail=$event.value" @returnPress="formEmail=$event.value" />
        <label v-if="emailError" class="error" horizontalAlignment="center">Please enter a valid email address</label>
      </StackLayout>

      <StackLayout row="6" verticalAlignment="middle" horizontalAlignment="center" class="container" marginTop="10">
        <TextField v-model="formPassword" hint="Your password..." class="form-input" :secure="true" :autocorrect="false" marginTop="20" @textChange="formPassword=$event.value" @returnPress="formPassword=$event.value" />
        <label v-if="passwordError" class="error" horizontalAlignment="center">Please enter a password >7 characters</label>
        <label v-if="isValidError" class="error" horizontalAlignment="center">The email or password was incorrect</label>
        <label v-if="isSubmitError" class="error" horizontalAlignment="center">Oops! There was a problem signing in</label>
      </StackLayout>

      <-- Button --
      <StackLayout verticalAlignment="top" horizontalAlignment="center" row="9">
        <GridLayout width="144" height="32" verticalAlignment="top">
          <AppButton text="Sign-in" width="140" @tap="onTapSubmit" :disabled="formPassword.length <= 7 || !formEmail.length ? true : false" />
        </GridLayout>

        <Label class="blurb link" horizontalAlignment="center" :textWrap="true" text="Forgotten your password?" @tap="$goto('forgotpassword', { backstackVisible: false } )" marginTop="20" />

      </StackLayout>

      <-- Back/Close Bar - it appears offset on iOS when loading/animating as a popover --
      <GridLayout ref="topBar" rowSpan="9" columns="auto, *" rows="68" height="68" verticalAlignment="top" android:marginTop="15" ios:marginTop="5" :iosOverflowSafeArea="false">
          <BackNav />
      </GridLayout>
    </GridLayout>

    <-- Loading page --
    <Stacklayout horizontalAlignment="center" verticalAlignment="middle" v-if="loadingDashboard">
      <label class="blurb semibold" text="Preparing your home page..." marginBottom="50" />
      <Gif width="30" height="30" src="~/assets/images/icons/refresh_spinner_animated.gif" verticalAlignment="middle" horizontalAlignment="center"/>
    </StackLayout>
    -->
    <Label class="" horizontalAlignment="center" :textWrap="true" text="Login page TODO:" />
  </Page>
</template>

<script>
// In-page components
/*import BackNav from '~/components/widgets/BackNav';
import ProfileBox from '~/components/widgets/ProfileBox';
import AppButton from '~/components/widgets/AppButton';*/

export default {
    /*components: {
        BackNav,
        ProfileBox,
        AppButton,
    },*/

    /*props: {
      fromChangePassword: { type: Boolean, default: false },
      email: { type: String, default: '' },
    },*/
    
    data() {
      return {
        formEmail: '',
        formPassword: '',
        backgroundImgSrc: '',
        
        // Submit related
        loadingDashboard: false,
        isSubmit: false,
        isValidError: false,
        isSubmitError: false,
        errorTimer: null,
      }
    },

    computed: {
        emailError() {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;            // Note simple anystring@anystring.anystring and checking no double @
            return (this.formEmail.trim() === "" || !re.test(this.formEmail)) && this.isSubmit;
        },

        passwordError() {
            return this.formPassword.trim().length <= 7 && this.isSubmit;
        },
    },

    async mounted() {
      /*
      // Get first background from store
      const backgrounds = this.$store.getters['Backgrounds/backgrounds'](['profile']);
      this.backgroundImgSrc = backgrounds[0] ? '~/assets/backgrounds/profile/' + backgrounds[0]._name : '';

      // Copy any email passed in
      this.formEmail = this.email;
      */
    },
    
    methods: {
        onPageLoaded(event) {
            // Set the Status bar style (light or dark based on the *page* content)
            event.object.page.statusBarStyle = 'dark';
        },

        /*async onTapSubmit() {
            if (this.errorTimer) {
                clearTimeout(this.errorTimer);
            }

            this.isSubmit = true;

            // Validate form fields
            if (!this.emailError && !this.passwordError) {
                // Valid
                
                // Login through API
                try {
                    // Login
                    const valid = await this.$store.dispatch('Auth/login', { email: this.formEmail, password: this.formPassword } );
                    if (!valid) {
                        this.isValidError = true;
                        this.errorTimer = setTimeout(() => {
                            this.isValidError = false;
                            this.isSubmit = false;
                        }, 3000);
                    } else {
                        // Show loading screen as the dashboard takes a little while to load
                        this.loadingDashboard = true;

                        // Reset submit state
                        this.isSubmit = false;

                        // Redirect to Dashboard, give a little time to show the loading page
                        setTimeout(() => {
                            setTimeout( () => this.$goto('dashboard', { clearHistory: true, backstackVisible: true, props: { 'fromLogin': true }} ), 50);
                        }, 50);
                    }
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
                }, 3000);
            }
        },*/
    },
  }
</script>

<style scoped lang="scss">
@import '~/assets/scss/theme-variables.scss';

/*.heading, .form, .form-input, .blurb, .container {
  margin-left: $main-container-margin + 25;
  margin-right: $main-container-margin + 25;
}*/

/*.heading {
  text-align: center;
  color: $color-heading;
  font-size: $font-size-heading-1;
  font-family: $font-family;
  font-weight: $font-weight;
}*/

/*.form-input {
  height: 40;
  padding: 10;
  text-align: center;
  background-color: #ffffff;
  border-color: #ffffff;
  border-radius: 10;
  width: 100%;
  text-align: left;
}*/

/*.blurb {
  color: $color-heading;
  font-family: $font-family;
  font-weight: $font-weight;
  font-size: $font-size;
  text-align: center;
}*/

/*.error {
    color: $color-form-error;
    font-family: $font-family;
    font-weight: $font-weight;
    font-size: $font-size;
    margin-top: 5;
    margin-left: $main-container-margin;
    margin-right: $main-container-margin;
}*/

/*.link {
  color: $color-hyperlink;
}*/
</style>