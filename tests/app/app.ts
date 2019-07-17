let start;
if (typeof NSDate !== "undefined") {
    start = NSDate.date();
} else {
    start = java.lang.System.currentTimeMillis();
}

import * as application from "tns-core-modules/application";

if (application.ios) {
    // Observe application notifications.
    application.ios.addNotificationObserver(UIApplicationDidFinishLaunchingNotification, (notification: NSNotification) => {
        console.log("UIApplicationDidFinishLaunchingNotification: " + notification);
    });
}

// Common events for both Android and iOS.
application.on(application.displayedEvent, function (args: application.ApplicationEventData) {
    (<any>global).isDisplayedEventFired = true;

    if (args.android) {
        // For Android applications, args.android is an Android activity class.
        console.log("Displayed Activity: " + args.android);
    } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        console.log("Displayed UIApplication: " + args.ios);
    }
});

application.on(application.launchEvent, function (args: application.ApplicationEventData) {
    if (args.android) {
        // For Android applications, args.android is an android.content.Intent class.
        console.log("Launched Android application with the following intent: " + args.android + ".");
    } else if (args.ios !== undefined) {
        // For iOS applications, args.ios is NSDictionary (launchOptions).
        console.log("Launched iOS application with options: " + args.ios);
    }
});

application.on(application.suspendEvent, function (args: application.ApplicationEventData) {
    if (args.android) {
        // For Android applications, args.android is an Android activity class.
        console.log("Suspend Activity: " + args.android);
    } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        console.log("Suspend UIApplication: " + args.ios);
    }
});

application.on(application.resumeEvent, function (args: application.ApplicationEventData) {
    if (args.android) {
        // For Android applications, args.android is an Android activity class.
        console.log("Resume Activity: " + args.android);
    } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        console.log("Resume UIApplication: " + args.ios);
    }
});

application.on(application.exitEvent, function (args: application.ApplicationEventData) {
    if (args.android) {
        // For Android applications, args.android is an Android activity class.
        console.log("Exit Activity: " + args.android);
    } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        console.log("Exit UIApplication: " + args.ios);
    }
});

application.on(application.lowMemoryEvent, function (args: application.ApplicationEventData) {
    if (args.android) {
        // For Android applications, args.android is an Android activity class.
        console.log("Low Memory: " + args.android);
    } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        console.log("Low Memory: " + args.ios);
    }
});

// Error events.
application.on(application.uncaughtErrorEvent, function (args: application.UnhandledErrorEventData) {
    console.log("NativeScriptError: " + args.error);
    console.log((<any>args.error).nativeException || (<any>args.error).nativeError);
    console.log((<any>args.error).stackTrace || (<any>args.error).stack);
});

application.on(application.discardedErrorEvent, function (args: application.DiscardedErrorEventData) {
    console.log("[Discarded] NativeScriptError: " + args.error);
    console.log((<any>args.error).nativeException || (<any>args.error).nativeError);
    console.log((<any>args.error).stackTrace || (<any>args.error).stack);
});

// Android activity events.
if (application.android) {
    application.android.on(application.AndroidApplication.activityCreatedEvent, function (args: application.AndroidActivityBundleEventData) {
        console.log("Event: " + args.eventName + ", Activity: " + args.activity + ", Bundle: " + args.bundle);
    });

    application.android.on(application.AndroidApplication.activityDestroyedEvent, function (args: application.AndroidActivityEventData) {
        console.log("Event: " + args.eventName + ", Activity: " + args.activity);
    });

    application.android.on(application.AndroidApplication.activityStartedEvent, function (args: application.AndroidActivityEventData) {
        console.log("Event: " + args.eventName + ", Activity: " + args.activity);
    });

    application.android.on(application.AndroidApplication.activityPausedEvent, function (args: application.AndroidActivityEventData) {
        console.log("Event: " + args.eventName + ", Activity: " + args.activity);
    });

    application.android.on(application.AndroidApplication.activityResumedEvent, function (args: application.AndroidActivityEventData) {
        console.log("Event: " + args.eventName + ", Activity: " + args.activity);
    });

    application.android.on(application.AndroidApplication.activityStoppedEvent, function (args: application.AndroidActivityEventData) {
        console.log("Event: " + args.eventName + ", Activity: " + args.activity);
    });

    application.android.on(application.AndroidApplication.saveActivityStateEvent, function (args: application.AndroidActivityBundleEventData) {
        console.log("Event: " + args.eventName + ", Activity: " + args.activity + ", Bundle: " + args.bundle);
    });

    application.android.on(application.AndroidApplication.activityResultEvent, function (args: application.AndroidActivityResultEventData) {
        console.log("Event: " + args.eventName + ", Activity: " + args.activity +
            ", requestCode: " + args.requestCode + ", resultCode: " + args.resultCode + ", Intent: " + args.intent);
    });

    application.android.on(application.AndroidApplication.activityBackPressedEvent, function (args: application.AndroidActivityBackPressedEventData) {
        console.log("Event: " + args.eventName + ", Activity: " + args.activity);
        // Set args.cancel = true to cancel back navigation and do something custom.
    });

    application.android.on(application.AndroidApplication.activityNewIntentEvent, function (args: application.AndroidActivityNewIntentEventData) {
        console.log("Event: " + args.eventName + ", Activity: " + args.activity + ", Intent: " + args.intent);
    });
}

let time;
if (typeof NSDate !== "undefined") {
    time = NSDate.date().timeIntervalSinceDate(start) * 1000;
} else {
    time = java.lang.System.currentTimeMillis() - start;
}

console.log(`TIME TO LOAD APP: ${time} ms`);

application.run({ moduleName: "app-root" });
