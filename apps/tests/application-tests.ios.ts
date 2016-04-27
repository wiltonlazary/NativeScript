﻿/* tslint:disable:no-unused-variable */
import app = require("application");
import TKUnit = require("./TKUnit");
import commonTests = require("./application-tests-common");

global.moduleMerge(commonTests, exports);

// >> application-ios-observer
//// Add the notification observer
if (app.ios) {
    var observer = app.ios.addNotificationObserver(UIDeviceBatteryLevelDidChangeNotification,
        function onReceiveCallback(notification: NSNotification) {
            var percent = UIDevice.currentDevice().batteryLevel * 100;
            var message = "Battery: " + percent + "%";
            ////console.log(message);
        });
}
//// When no longer needed, remove the notification observer
if (app.ios) {
    app.ios.removeNotificationObserver(observer, UIDeviceBatteryLevelDidChangeNotification);
}
// << application-ios-observer