<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <DockLayout>
        <!-- Top Nav -->
        <TopNav dock="top" title="Check-In?" :leftIsBackButton="true" />
        
        <!-- Bottom container -->
        <StackLayout dock="bottom" verticalAlignment="bottom" marginLeft="20" marginRight="20" marginBottom="10">
            <Label class="paragraph" :textWrap="true" text="Check-ins are a lightweight way to let people important to you know that you're thinking about them."></Label>
            <Label class="paragraph" :textWrap="true" text="Let people know how you're feeling by replying to their check-in or checking in with them yourself."></Label>
            <Label class="paragraph" :textWrap="true" text="If people need deeper support, you can drop into further contact options."></Label>
            <Label class="paragraph bold" :textWrap="true" text="Reply to the check-in to get started!"></Label>

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