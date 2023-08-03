<template>
    <!-- Progress Bar Button -->
    <GridLayout class="listButtonContainer" cols="*" rows="auto" ref="listbutton" @touch="onTouchItem">
        <GridLayout class="progressbarbutton">
            <StackLayout col="0" class="progressbarbutton-value" :width="percentCurrent+'%'" :backgroundColor="backgroundColor"></StackLayout>
            <label class="listbutton" :text="itemText" v-if="text"></label>
        </GridLayout>
    </GridLayout>
</template>

<script>
export default {
    props: {
        // Display a label over the progress bar
        text: { type: String, default: "" },

        // Configure the colour
        selectedColor: { type: String, default: "#85BCCB" },
        successColor: { type: String, default: "#86F3B2" },
        errorColor: { type: String, default: "#F88F8F" },

        // An item object we pass to the action function to represent ths item
        item: { type: Object, default: {} },
        
        // We pass in a callback to fire on longPress
        onLongPress: { type: Function, default: null },

        // Success and Error Messages (nly shown if this has a text prop)
        successMessage: { type: String, default: "Updated successfully" },
        errorMessage: { type: String, default: "Problem updating this item" },
    },
    
    data() {
        return {
            // Track the current % on longPress
            percentCurrent: 0,
            intervalId: null,
            startTouch: null,
            errorTimer: null,
            successTimer: null,
            
            // Local mutators
            selfIsError: false,
            selfIsSuccess: false,

            // Timers and intervals
            longPressActionTimeMs: 0.75 * 1000,
            tapDuration: 150,
            errorInterval: 1 * 1000,
            successInterval: 1 * 1000,
            
            // Do we reset the progress on reaching 100% (or do we let parent do this by updating success/error?)
            resetProgressOnMax: false,
        }
    },

    computed: {
        backgroundColor() {
            if (this.selfIsError) return this.errorColor;
            if (this.selfIsSuccess) return this.successColor;
            return this.selectedColor;
        },

        itemText() {
            if (this.selfIsError && this.errorMessage.length) return this.errorMessage;
            if (this.selfIsSuccess && this.successMessage.length) return this.successMessage;
            return this.text;
        },
    },

    beforeUnmount() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        if (this.errorTimer) {
            clearTimeout (this.errorTimer);
        }
        if (this.successTimer) {
            clearTimeout (this.successTimer);
        }
    },

    methods: {
        reset() {
            // Reset action states
            this.selfIsError = false;
            this.selfIsSuccess = false;
            
            // Set progress back to zero
            this.percentCurrent = 0;

            // Clear any timers
            clearInterval(this.intervalId);
            this.startTouch = null;
        },
        
        onTouchItem(args) {
            if(args.action === "down") {
                this.reset();

                // Save start time
                this.startTouch = new Date().getTime();

                // Set animation update interval timer, do after an initial delay to ensure we don't start animating for tap event
                setTimeout(() => {
                    // Only animate if we're still onTouchDown
                    if (this.startTouch) {
                        let percentCurrent = this.percentCurrent;
                        this.intervalId = setInterval(() => {
                            const oldPercent = percentCurrent;

                            // Update the current percentage based on how long has elapsed since start touch
                            const nowTouch = new Date().getTime();
                            const elapsed = nowTouch - this.startTouch - this.tapDuration;          // minus tapDuration to allow for delayed start
                            this.percentCurrent = (elapsed / (this.longPressActionTimeMs)) * 100;

                            // Stop animation if reached 100%
                            if (this.percentCurrent >= 100) {
                                clearInterval(this.intervalId);

                                // Fire longPress to let parent know we took some action
                                this.$emit("longPress");

                                // If we have a callback, we fire it
                                if (this.onLongPress && typeof this.onLongPress === 'function') {
                                    this.onLongPress(this.item)
                                    .then((data) => {
                                        // Show success style
                                        this.selfIsSuccess = true;
                                        this.successTimer = setTimeout(() => {
                                            this.reset();
                                        }, this.successInterval);
                                    })
                                    .catch((error) => {
                                        // Show error style
                                        this.selfIsError = true;
                                        this.errorTimer = setTimeout(() => {
                                            this.reset();
                                        }, this.errorInterval);
                                    });
                                }
                            }
                        }, 10);
                    }
                }, this.tapDuration);
            }

            if(args.action === "up") {
                // Clear any pending animation (note we let parent reset % based on responding to the tap events)
                clearInterval(this.intervalId);
                this.startTouch = null;

                if (this.percentCurrent < 100 || this.resetProgressOnMax) {
                    this.percentCurrent = 0;
                }

                // Emit either tap based on how long we pressed
                const endTouch = new Date().getTime();
                const duration = Math.abs(this.startTouch - endTouch);
                if (duration <= this.tapDuration) {
                    this.$emit("tap");
                }
            }
        },
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';
.listbutton {
    color: $color-listbutton;
    font-family: $font-family-semibold;
    font-weight: $font-weight-semibold;
    padding: 10;
}

.progressbarbutton-value {
  horizontal-align: left;
  height: 44;
}
</style>