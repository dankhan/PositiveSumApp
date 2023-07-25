<template>
    <Page actionBarHidden="true" @loaded="onPageLoaded">
      <DockLayout>
          <!-- Top Nav -->
          <TopNav dock="top" title="Add Person?" :leftIsBackButton="true" />
          
          <!-- Bottom container -->
          <StackLayout dock="bottom" verticalAlignment="bottom" marginLeft="20" marginRight="20" marginBottom="10">
              <Label class="paragraph" :textWrap="true" text="Add people to your Positive Sum Network so you can check-in with them, ask them for help, and share your expertise with each other."></Label>
              <Label class="paragraph" :textWrap="true" text="Add contacts directly or by pressing the search icon to add them from your phone contacts."></Label>
              <Label class="paragraph" :textWrap="true" text="We will send an invite to them to join your network on Positive Sum."></Label>
              <Label class="paragraph" :textWrap="true" text="Depending upon how close this person is, we will bump the person up your contact list to remind you to check-in regularly."></Label>
              <Label class="paragraph bold" :textWrap="true" text="Add your contact's details directly or click the search icon to get started!"></Label>
  
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