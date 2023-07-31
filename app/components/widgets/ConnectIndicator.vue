<template>
    <!-- Connect Indicator -->
    <GridLayout id="connectIndicator" horizontalAlignment="center" rows="*,auto,auto,auto" columns="*" verticalAlignment="bottom" v-bind="$attrs" v-if="isLoading || isError" marginBottom="20">
        
        <!-- Title and icon if not loading -->
        <label row="1" class="heading" :text="iconText" marginBottom="20" v-if="!isLoading && isError"></label>
        <Image row="2" width="134" height="134" stretch="aspectFit" :src="iconSrc" v-if="!isLoading && isError" @tap="onTapIcon"></Image>
        
        <!-- Show activity indicator if loading -->
        <ActivityIndicator row="0" :busy="isLoading" v-if="isLoading" />

        <!-- retry message if error -->
        <label row="3" class="paragraph" text="tap icon to retry" horizontalAlignment="center" marginTop="20" v-if="!isLoading && isError"></label>
    </GridLayout>
</template>

<script>
  export default {
    props: {
        iconType: { type: String, validator (val) {
                return ['connecterror', 'fetcherror', ''].includes(val)
            }
        },
        isLoading: { type: Boolean, default: false },
    },
    
    data() {
        return {
        }
    },
    
    computed: {
        iconSrc() {
            switch (this.iconType) {
                case "connecterror": { return "res://icons_error_connect"; }
                case "fetcherror": { return "res://icons_error_server"; }
                default: { return ""; }
            }
        },

        iconText() {
            switch (this.iconType) {
                case "connecterror": { return "Problem contacting server"; }
                case "fetcherror": { return "Problem fetching data"; }
                default: { return ""; }
            }
        },

        isError() {
            return this.iconType === 'connecterror' ||  this.iconType === 'fetcherror';
        },
    },

    methods: {
        onTapIcon() {
            // Emit an event so parent can deal with tap
            this.$emit('tap');
        },
    },
  }
</script>

<style scoped lang="scss">
  @import '~/assets/scss/app.scss';
</style>