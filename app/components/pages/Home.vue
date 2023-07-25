<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <DockLayout>
        <!-- Top Nav -->
        <TopNav dock="top" title="+Σ" :rightIsProfile="true" rightRoute="" />
        
        <!-- Bottom container -->
        <GridLayout rows="auto, auto" columns="*" dock="bottom" verticalAlignment="bottom" marginLeft="20" marginRight="20">

            <!-- Heading and blurb -->
            <StackLayout>
                <Label class="heading" :textWrap="true" :text="greeting"></Label>
                <Label class="paragraph" :textWrap="true" text="Build a more positive-sum network by checking-in, asking for help, & sharing your expertise with others."></Label>
            </StackLayout>

            <!-- Grid Nav -->
            <GridLayout row="1" rows="160,160" columns="*,*">
                
                <!-- Check-ins -->
                <GridLayout row="0" col="0" columns="*" rows="*,auto,auto,*" class="gridbox left" @tap="onTapCheckIn">
                    <Label class="grid" row="1" text="Check-In"></Label>
                    <!-- notifications -->
                    <GridLayout row="2" columns="*,30,*" rows="20" class="notify">
                        <Label class="notifytext" col="1" text="1"></Label>
                    </GridLayout>
                </GridLayout>
                
                <!-- Ask For Help -->
                <GridLayout row="0" col="1" columns="*" rows="*,auto,auto,*" class="gridbox right">
                    <Label class="grid" row="1" text="Ask For Help"></Label>
                    <!-- notifications -->
                    <GridLayout row="2" columns="*,30,*" rows="20" class="notify">
                        <Label class="notifytext" col="1" text="3"></Label>
                    </GridLayout>
                </GridLayout>

                <!-- Office Hours -->
                <GridLayout row="1" col="0" columns="*" rows="*,auto,auto,*" class="gridbox left">
                    <Label class="grid" row="1" text="Office Hours"></Label>
                    <!-- notifications -->
                    <GridLayout row="2" columns="*,30,*" rows="20" class="notify" v-if="false">
                        <Label class="notifytext" col="1" text="1"></Label>
                    </GridLayout>
                </GridLayout>

                <!-- Value Exchange -->
                <GridLayout row="1" col="1" columns="*" rows="*,auto,auto,*" class="gridbox right">
                    <Label class="grid" row="1" text="Value Exchange"></Label>
                    <!-- notifications -->
                    <GridLayout row="2" columns="*,30,*" rows="20" class="notify" v-if="false">
                        <Label class="notifytext" col="1" text="1"></Label>
                    </GridLayout>
                </GridLayout>
            </GridLayout>
        </GridLayout>
    </DockLayout>
  </Page>
</template>

<script>
// In-page components
import TopNav from '~/components/widgets/TopNav';

export default {
    props: {
        fromLogin: { type: Boolean, default: false },
        fromSignUp: { type: Boolean, default: false },
    },
    
    components: {
        TopNav,
    },
    
    data() {
        return {
            name: 'Dan'
        }
    },

    computed: {
        greeting() {
            // We create a default greeting based on the time of day
            // Good morning 2-12, Good Afternoon 12-3, Hi 4-6, Good Evening 6-11, Good night 11-2
            const time = new Date().getHours();
            let str = '';
            if (time >= 22 && time <= 1) {
                str = 'Late';
            } else if (time >= 2 && time <= 4) {
                str = 'Night time';
            } else if (time >= 2 && time < 12) {
                str = 'Morning';
            } else if (time >= 12 && time <= 15) {
                str = 'Good Afternoon';
            } else if (time >= 16 && time < 19) {
                str = 'Hi';
            } else if (time >= 19 && time <= 21) {
                str = 'Good Evening';
            }
            
            if (this.name.length) {
                return str + ", " + this.name + "!"
            } else {
                return str + "!"
            }
        },

        navOptions() {
            return { transition: { name: "slideLeft", duration: 300, curve: "ease" } }
        },
    },

    methods: {
        onPageLoaded(event) {
            // Set the Status bar style (light or dark based on the *page* content)
            event.object.page.statusBarStyle = 'dark';
        },

        onTapCheckIn() {
            this.$goto('checkInHome', this.navOptions);
        }
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';

.heading, .paragraph {
    margin-bottom: 20;
}

.gridbox {
    background-color: $color-gridbox-background;
    border-radius: 5;
    margin-bottom: 10;
}

.gridbox.left {
    margin-right: 5;
}

.gridbox.right {
    margin-left: 5;
}

.grid {
    color: $color-gridbox-text;
    text-align: center;
}

.notify {
    text-align: center;
    margin-top: 5;
}

.notifytext {
    color: $color-gridbox-text;
    background-color: $color-gridbox-notify-background;
    border-radius: 3;
    font-size: $font-size-small;
}
</style>