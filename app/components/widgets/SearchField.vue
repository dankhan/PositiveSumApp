<template>
    <!-- Search field - uses a background effect to make icon look like it's in the search field -->
    <GridLayout class="input-border" columns="*, auto" v-bind="$attrs">
        <TextField col="0" class="form-input" v-model="searchQuery" :hint="hint" @textChange="onTextChange" @returnPress="onReturnPress"></TextField>
        <Image src="res://search" col="1" class="form-icon" verticalAlignment="middle" height="24" @tap="onReturnPress" />
    </GridLayout>

    <!-- Search field - use a background effect to make icon look like it's in the search field -->
    <!--<GridLayout :row="0" :col="1" class="input-border" columns="*, auto" rows="44" marginLeft="10">
        <TextField col="0" class="form-input" v-model="formPhone" hint="Mobile number..." ref="phoneField" @textChange="formPhone=$event.value" @returnPress="formPhone=$event.value" keyboardType="phone"></TextField>
        <Image :src="phoneFieldIcon" col="1" class="form-icon" verticalAlignment="middle" height="20" />
    </GridLayout>-->

</template>

<script>
  export default {
    props: {
        search: { type: String, default: '' },
        hint: { type: String, default: 'Search...' },

        width: { type: [String,Number], default: "100%" },
        /*row: { type: [String,Number], default: "0" },
        col: { type: [String,Number], default: "0" },
        marginLeft: { type: [String,Number], default: "0" },
        marginRight: { type: [String,Number], default: "0" },
        verticalAlignment: { type: String, default: 'middle' },
        horizontalAlignment: { type: String, default: 'stretch' },*/
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
    },

    mounted() {
        this.searchQuery = this.search;
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
    }
  }
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';

/*.input-border {
    background-color: #ffffff;
    border-radius: 10;
}*/

/*.input {
    height: 30;
    padding: 5;
    text-align: left;
    border-bottom-width: 1;
    border-bottom-color: transparent;
    color: $color-heading;
    font-family: $font-family;
    font-weight: $font-weight;
    font-size: $font-size;
}*/

/*.formIcon {
    padding-left: 10;
    padding-right: 5;
    margin-right: 10;
}*/

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