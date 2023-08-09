<template>
    <Page actionBarHidden="true" @loaded="onPageLoaded">
      <DockLayout>
          <!-- Top Nav -->
          <TopNav dock="top" title="Add Group?" :leftIsBackButton="true" :frameId="frameId" />
          
          <!-- Bottom container -->
          <StackLayout dock="bottom" verticalAlignment="bottom" marginLeft="20" marginRight="20" marginBottom="10">
              <Label class="paragraph" :textWrap="true" text="Group people into 'check-in' groups to check-in with them or ask them for help in one go, or use groups to create novel check-in contexts."></Label>
              <Label class="paragraph" :textWrap="true" text="People in your groups only see a 1:1 connection with you and can reply only to you."></Label>
              <Label class="paragraph" :textWrap="true" text="Use the slider to determine how often we should bump this group up your list to remind you to check-in regularly."></Label>
              <Label class="paragraph bold" :textWrap="true" text="Add your group name to get started!"></Label>
  
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
      
    // The person item is passed as item
    props: {
        frameId: { type: String, default: "default" },
    },
    
    data() {
        return {
        }
    },
  
    computed: {
        backNavOptions() {
            return { transition: { name: "slideRight", duration: 300, curve: "ease" }, frame: this.frameId, props: { frameId: this.frameId }  }
        },
        
        navOptions() {
            return { transition: { name: "slideLeft", duration: 300, curve: "ease" }, frame: this.frameId, props: { frameId: this.frameId }  }
        },
    },
  
    methods: {
        onPageLoaded(event) {
            // Set the Status bar style (light or dark based on the *page* content)
            event.object.page.statusBarStyle = 'light';
        },
  
        onTapBack() {
            console.log(this.frameId, this.backNavOptions);
            this.$navigateBack(this.backNavOptions);
        },
    },
  }
  </script>
  
  <style scoped lang="scss">
  @import '~/assets/scss/app.scss';
  </style>