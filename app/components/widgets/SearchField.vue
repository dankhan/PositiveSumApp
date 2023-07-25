<template>
    <!-- Search field - uses a background effect to make icon look like it's in the search field -->
    <GridLayout class="input-border" columns="*, auto" v-bind="$attrs">
        <TextField ref="searchBar" col="0" class="form-input" v-model="searchQuery" :hint="hint" @textChange="onTextChange" @returnPress="onReturnPress"></TextField>
        <Image src="res://search" col="1" class="form-icon" verticalAlignment="middle" height="24" @tap="onTapIcon" />
    </GridLayout>
</template>

<script>
import { isAndroid } from "@nativescript/core/platform";

  export default {
    props: {
        search: { type: String, default: '' },
        hint: { type: String, default: 'Search...' },
        preventFocus: { type: Boolean, default: false },
    },
    
    data() {
      return {
        searchQuery: '',
      };
    },

    watch: {
        search(text) {
            this.searchQuery = text;
        },

        preventFocus(prevent) {
            if (prevent) {
                this.preventFieldFocus();
            }
        },
    },

    mounted() {
        this.searchQuery = this.search;
        if (this.preventFocus) {
            this.preventFieldFocus();
        }
    },
    
    methods: {
        onTextChange(event) {
            // let parent know we changed
            this.$emit('textChange', event);
        },

        onReturnPress(event) {
            // let parent know we changed
            this.$emit('returnPress', event);
        },

        onTapIcon(event) {
            // let parent know we changed
            this.$emit('tapIcon', event);
        },

        /*
            SearchField automatically gains focus when loaded on Android and triggers soft keyboard
            This method dismisses clears focus and dismisses soft keyboard
        */
        preventFieldFocus() {
            if (isAndroid) {
                if (this.$refs.searchBar.nativeElement.android) {
                    setTimeout(() => { this.$refs.searchBar.nativeElement.android.clearFocus(); }, 0); // clears focus and dismisses soft keyboard
                } else {
                    setTimeout(() => { this.preventFocus(); }, 10); // sometimes nativeElement is not available yet
                }
            }
        },
    }
  }
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';

.form-icon {
    margin-left: 10;
    margin-right: 10;
    height: 44;
}

.input-border {
    height: 44;
    padding: 0;

    background-color: $color-form-input-background;
    border-color: $color-form-input-background;
    border-radius: $button-radius;
}
</style>