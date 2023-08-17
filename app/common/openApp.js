/**
 * Library to open external apps
 *
 * @file   XML-RPC library
 * @author <dan.khan@gmail.com>
 * @since  1.0.0
 * @copyright (c) 2022 All rights reserved.
 * @see based on forked code from https://github.com/ludwiktrammer/nativescript-open-app
 * 
 */

import { utils } from "@nativescript/core";

function openApp(appID, storeFallback, appleStoreId, action='', data='') {
    if (storeFallback === void 0) { storeFallback = true; }
    if (global.isIOS) {
        var sharedApplication = UIApplication.sharedApplication;
        var url = NSURL.URLWithString(appID.trim());
        if (sharedApplication.canOpenURL(url)) {
            // open app
            sharedApplication.openURL(url);
            return true;
        }
        else if (storeFallback && appleStoreId) {
            // can't open app - open store
            url = NSURL.URLWithString("itms-apps://itunes.apple.com/app/id" + appleStoreId);
            if (sharedApplication.canOpenURL(url)) {
                sharedApplication.openURL(url);
            }
            else {
                // can't open store - open the website
                url = NSURL.URLWithString("https://itunes.apple.com/app/id" + appleStoreId);
                sharedApplication.openURL(url);
            }
        }
        return false;
    } else {
        // Android
        var context = utils.ad.getApplicationContext();
        var Intent = android.content.Intent;
        
        // Use action passed in as intent or get the default
        if (action) {
            var intent = new Intent(action, data);
        } else {
            var intent = context.getPackageManager().getLaunchIntentForPackage(appID);
        }
        
        if (intent) {
            // Set any custom data
            if (data.length) {
                intent.setData(android.net.Uri.parse(data));
            }

            // Open app
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            return true;
        }
        else if (storeFallback) {
            // Can't open app - open store
            intent = new Intent(Intent.ACTION_VIEW);
            intent.setData(android.net.Uri.parse("https://play.google.com/store/apps/details?id=" + appID));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        }
        return false;
    }
}

export { openApp };