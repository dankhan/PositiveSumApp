<template>
    <!-- Emoji Board -->
    <GridLayout class="emojiboard" horizontalAlignment="center" rows="auto,auto,auto,auto" columns="*,*,*,*,*" v-bind="$attrs" marginLeft="20" marginRight="20" :key="`emojiboard-${showAltBoard}`">
        
        <!-- Rows -->
        <label v-for="(emoji, index) in emojiList[0]" row="0" :col="index" :key="`emoji-row0-${index}`" :class="emojiClass(emoji)" :text="emoji" @tap="onTap(emoji)"></label>
        <label v-for="(emoji, index) in emojiList[1]" row="1" :col="index" :key="`emoji-row1-${index}`" :class="emojiClass(emoji)" :text="emoji" @tap="onTap(emoji)"></label>
        <label v-for="(emoji, index) in emojiList[2]" row="2" :col="index" :key="`emoji-row2-${index}`" :class="emojiClass(emoji)" :text="emoji" @tap="onTap(emoji)"></label>

        <!-- Custom Emoji Entry Form -->
        <TextField row="3" colSpan="5" v-model="selectedForm" maxLength=1 hint="Enter custom emoji..." class="form-input" v-if="showForm" @textChange="onCustomEmoji" @returnPress="onCustomEmoji" marginTop="10" />
    </GridLayout>
</template>

<script>
  export default {
    props: {
        showAltBoard: { type: Boolean, default: false },            // do we show alternative last row?
    },
    
    data() {
        return {
            emojis: [
                ['😀','🙂','🤔','😐','🙁'],
                ['😡','🤧','😵‍💫','🙏','❤'],
                ['🥳','💪','😭','😎','⋯'],
            ],
            altEmojis: [
                ['😀','🤔','🙁','❤','🥳'],
                ['💪','😢','😎','🙏','🤗'],
                ['📞','💬','✉️','🏠','⋯'],
            ],
            selected: '',
            
            // Form field-related
            formTrigger: '⋯',           // which emoji triggers the form entry field
            selectedForm: '',
            showForm: false,
        }
    },
    
    computed: {
        emojiClass() {
            return (emoji) => this.selected === emoji ? 'emoji selected' : 'emoji';
        },

        emojiList() {
            return this.showAltBoard ? this.altEmojis : this.emojis;
        }
    },

    methods: {
        onTap(selected) {
            // toggle
            if (this.selected === selected) {
                this.selected = '';
            } else {
                this.selected = selected;
            }

            // Toggle the form field
            if (selected === this.formTrigger) {
                this.showForm = !this.showForm;
            } else {
                this.showForm = false;
                this.$emit('selected', this.selected);
            }
        },

        onCustomEmoji() {
            // Emit so parent know the selected emoji changed
            this.$emit('selected', this.selectedForm);
        }
    },
  }
</script>

<style scoped lang="scss">
  @import '~/assets/scss/app.scss';

  .emojiboard {
    width: 100%;
    background-color: $color-emojiboard-background;
    border-radius: $button-radius;
    padding: 10;
  }

  .emoji {
    width: 70;
    height: 50;
    margin: 7;
    padding: 10;
    text-align: center;
    font-size: $font-size-emoji;
    clip-path: circle(100% at 50% 50%);
    border-radius: 50%;
    background-color: $color-emojiboard-button;
  }

  .selected {
    background-color: $color-emojiboard-button-selected;
  }
</style>