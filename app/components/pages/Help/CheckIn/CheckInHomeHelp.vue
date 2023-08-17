<template>
  <Page actionBarHidden="true" @loaded="onPageLoaded">
    <DockLayout>
        <!-- Top Nav -->
        <TopNav dock="top" title="Check-In?" :leftIsBackButton="true" />
        
        <!-- Bottom container -->
        <StackLayout dock="bottom" verticalAlignment="bottom" marginLeft="20" marginRight="20" marginBottom="10">
            <Label class="paragraph" :textWrap="true" text="Send a lightweight 'check-in' to let people important to you know that you're thinking about them, and then drop into other contact options if they need more support."></Label>
            <Label class="paragraph" :textWrap="true" text="Add multiple people into 'check-in' groups to check-in with them all at the same time or to create different check-in contexts."></Label>
            <Label class="paragraph" :textWrap="true" text="People in your groups only see a 1:1 connection and can reply only to you."></Label>
            <Label class="paragraph" :textWrap="true" text="Building a habit of checking in with others regularly is a great way to create deeper, lasting connections."></Label>
            <Label class="paragraph bold" :textWrap="true" text="Add one or more people to check-in with to get started!"></Label>

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