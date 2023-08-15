<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <DockLayout>
        <!-- Top Nav -->
        <TopNav dock="top" title="Your Check-Ins?" :leftIsBackButton="true" />
        
        <!-- Bottom container -->
        <StackLayout dock="bottom" verticalAlignment="bottom" marginLeft="20" marginRight="20" marginBottom="10">
            <Label class="paragraph" :textWrap="true" text="People who want to check-in with you are summarised in 'Your Check-Ins' list."></Label>
            <Label class="paragraph" :textWrap="true" text="Choose a person and check-in how you're feeling."></Label>
            <Label class="paragraph" :textWrap="true" text="People can also respond to your reply with a simple suggested next step, like getting in touch."></Label>
            <Label class="paragraph bold" :textWrap="true" text="Reply to one or more people who checked-in with you to get started!"></Label>

            <!-- Got It! button -->
            <Button marginTop="20" class="button-primary" text="Got it!" @tap="onTapBack"></Button>
        </StackLayout>
    </DockLayout>
  </Page>
</template>

<script>
// In-page components
import TopNav from '~/components/widgets/TopNav';

export default {
    components: {
        TopNav,
    },
    
    data() {
        return {
        }
    },

    computed: {
        backNavOptions() {
            return { transition: { name: "slideRight", duration: 300, curve: "ease" } }
        },
      
        navOptions() {
            return { transition: { name: "slideLeft", duration: 300, curve: "ease" } }
        },
    },

    methods: {
        onPageLoaded(event) {
            // Set the Status bar style (light or dark based on the *page* content)
            event.object.page.statusBarStyle = 'light';
        },

        onTapBack() {
            this.$navigateBack(this.backNavOptions);
        },
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';
</style>