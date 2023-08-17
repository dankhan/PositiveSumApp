<template>
    <!-- Progress Bar Button -->
    <GridLayout class="listButtonContainer" columns="*,auto,auto" rows="auto">
        <GridLayout class="progressbarbutton" colSpan="3" v-if="hasLongPress">
            <StackLayout col="0" class="progressbarbutton-value" :width="percentCurrent+'%'" :backgroundColor="backgroundColor"></StackLayout>
        </GridLayout>

        <!-- Label-->
        <label col="0" class="listbutton" :text="itemText" v-if="text" @touch="onTouchItem"></label>

        <!-- Notify Icon -->
        <label col="1" class="notifytext" :text="notifyCount" v-if="showNotify" @tap="onTapNotify"></label>

        <!-- Group/Chevron Icon -->
        <Image col="2" class="chevron" src="res://icons_button_chevron_right" width="26" height="26" stretch="aspectFit" marginRight="10" v-if="showArrow" @tap="onTapArrow"></Image>
    </GridLayout>
</template>

<script>
export default {
    props: {
        // Display a label over the progress bar
        text: { type: String, default: "" },

        // Can turn off the longPress to make into a simple listbutton
        hasLongPress: { type: Boolean, default: true },

        // Configure the colour
        selectedColor: { type: String, default: "#85BCCB" },
        successColor: { type: String, default: "#86F3B2" },
        errorColor: { type: String, default: "#F88F8F" },

        // An item object we pass to the action function to represent ths item
        item: { type: Object, default() {
            return {}
        } },
        
        // We pass in a callback to fire on longPress
        onLongPress: { type: Function, default: null },
        tapRoute: { type: String, default: "" },

        // Success and Error Messages (nly shown if this has a text prop)
        successMessage: { type: String, default: "Updated successfully" },
        errorMessage: { type: String, default: "Problem updating this item" },

        // Notify options
        notifyCount: { type: Number, default: null },
        notifyRoute: { type: String, default: "" },
        
        // Arrow options
        showArrow: { type: Boolean, default: false },
        arrowRoute: { type: String, default: "" },
    },
    
    data() {
        return {
            // Track the current % on longPress
            percentCurrent: 0,
            intervalId: null,
            startTouch: null,
            errorTimer: null,
            successTimer: null,
            
            
            // We track position to see if this is really a tap/longPress
            startX: null,
            startY: null,
            curX: null,
            curY: null,
            maxDistance: 20,             // any touch event that is further out than this from touchdown event coords is not considered tap/longpress gesture
            
            // Local mutators
            selfIsError: false,
            selfIsSuccess: false,

            // Timers and intervals
            longPressActionTimeMs: 0.75 * 1000,
            tapDuration: 200,
            errorInterval: 1 * 1000,
            successInterval: 1 * 1000,
            
            // Do we reset the progress on reaching 100% (or do we let parent do this by updating success/error?)
            resetProgressOnMax: false,
        }
    },

    computed: {
        navOptions() {
            return { transition: { name: "slideLeft", duration: 300, curve: "ease" }, props: { item: this.item } };
        },
        
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

        showNotify() {
            return this.notifyCount && this.notifyCount > 0;
        },

        isTapOrLongPress() {
            return Math.abs(this.curX - this.startX) <= this.maxDistance && Math.abs(this.curY - this.startY) <= this.maxDistance;
        }
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

            // Reset position data
            this.startX = null;
            this.startY = null;
            this.curX = null;
            this.curY = null;
        },
        
        onTouchItem(args) {
            if(args.action === "down") {
                this.reset();

                // Save start time
                this.startTouch = new Date().getTime();

                // We save the start position, so we can detect if this is really a move/swipe instead of a tap
                this.startX = args.getX();
                this.startY = args.getY();
                this.curX = this.startX;
                this.curY = this.startY;

                // We cancel any animation if this isn't a tap/longPress gesture
                if (!this.isTapOrLongPress) {
                    this.reset();
                } else {
                    // Set animation update interval timer, do after an initial delay to ensure we don't start animating for tap event
                    if (this.hasLongPress) {
                        setTimeout(() => {
                            // Check the current X and Y and make sure we're not really doing a move/swipe/or some other gesture instead of tap/longpress
                            

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
                                        this.$emit("longPress", this.item);

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
                }
            }

            if(args.action === "up") {
                // Calc duration since we started tap
                const endTouch = new Date().getTime();
                const duration = Math.abs(this.startTouch - endTouch);
                
                // Clear any pending animation (note we let parent reset % based on responding to the tap events)
                clearInterval(this.intervalId);
                this.startTouch = null;
                
                // Clear coords
                this.startX = null;
                this.startY = null;
                this.curX = null;
                this.curY = null;

                if (this.percentCurrent < 100 || this.resetProgressOnMax) {
                    this.percentCurrent = 0;
                }
                
                // Process tap if not a longPress - we check if we've moved significantly and this isn't a tap anymore
                if (duration <= this.tapDuration && this.isTapOrLongPress) {
                    this.onTap();
                }
            }

            if(args.action === "move") {
                // We update the current position, so we can detect if this is really a move/swipe instead of a tap/longPress
                this.curX = args.getX();
                this.curY = args.getY();

                // Cancel any animation if we moved too far
                if (!this.isTapOrLongPress) {
                    this.reset();
                }
            }

            if(args.action === "cancel") {
                this.reset();
            }
        },
        
        // Navigate to the tap page
        onTap() {
            // Let parent know we tapped
            this.$emit("tap", this.item);

            // Navigate to the new route if specified
            if (this.tapRoute.length) {
                this.$goto(this.tapRoute, this.navOptions);
            }
        },
        
        // Navigate to the notify page
        onTapNotify() {
            // Let parent know we tapped
            this.$emit("notify", this.item);

            // Navigate to the new route if specified
            if (this.notifyRoute.length) {
                this.$goto(this.notifyRoute, this.navOptions);
            }
        },

        // Navigate to the arrow page
        onTapArrow() {
            // Let parent know we tapped
            this.$emit("expand", this.item);

            // Navigate to the new route if specified
            if (this.arrowRoute.length) {
                this.$goto(this.arrowRoute, this.navOptions);
            }
        }
    },
}
</script>

<style scoped lang="scss">
@import '~/assets/scss/app.scss';
.listbutton {
    color: $color-listbutton;
    font-family: $font-family-semibold;
    font-weight: $font-weight;
    padding: 10;
    height: 44;
}

.progressbarbutton-value {
  horizontal-align: left;
  height: 44;
}

.listButtonContainer .notifytext {
    width: 30;
    height: 24;
    padding: 5 10 5 10;
    margin-right: 10;
    border-radius: 3;
    color: $color-listbutton;
    background-color: $color-listbutton-notify-background;
    font-size: $font-size-small;
    text-align: center;
}
</style>