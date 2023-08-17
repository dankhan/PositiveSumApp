<template>
    <!-- Check-In Emoji with Reply -->
    <GridLayout class="checkin" horizontalAlignment="center" rows="auto,auto,auto" columns="auto,auto,auto" v-bind="$attrs">
        
        <!-- Big Icon -->
        <label class="bigicon" colSpan="3" rowSpan="3" :text="checkIn"></label>
        
        <!-- Reply Icon (overlaid) -->
        <GridLayout col="2" row="2" verticalAlignment="bottom" horizontalAlignment="right" marginRight="10" marginBottom="10" v-if="hasReply">
            <label class="smallicon" :text="replyText"></label>
            <ActivityIndicator :busy="isLoading" v-if="isLoading" />
        </GridLayout>
    </GridLayout>
</template>

<script>
  export default {
    props: {
        checkIn: { type: String, default: ''},
        reply: { type: String, default: ''},
        isLoading: { type: Boolean, default: false },
    },
    
    data() {
        return {
        }
    },
    
    computed: {
        hasReply() {
            return this.isLoading || (this.reply && this.reply.length);
        },
        
        replyText() {
            return this.isLoading ? '' : this.reply;
        }
    },
  }
</script>

<style scoped lang="scss">
  @import '~/assets/scss/app.scss';

  .bigicon {
    width: 120;
    height: 120;
    margin: 15;
    padding: 20;
    text-align: center;
    font-size: $font-size-emoji-large;
    clip-path: circle(100% at 50% 50%);
    border-radius: 50%;
    background-color: $color-emojiboard-button;
  }

  .smallicon {
    width: 50;
    height: 50;
    padding: 10;
    text-align: center;
    font-size: $font-size-emoji;
    clip-path: circle(100% at 50% 50%);
    border-radius: 50%;
    background-color: $color-emojiboard-button-overlay;
  }
</style>