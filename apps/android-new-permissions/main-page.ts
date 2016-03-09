import {EventData as ObservableEventData, Observable} from "data/observable";
import {Page} from "ui/page";
import {AndroidApplication, AndroidRequestPermissionsResultEventData, android as appInstance} from "application";

declare type ContextCompat = android.support.v4.content.ContextCompat;
declare type ActivityCompat = android.support.v4.app.ActivityCompat;

const MY_CODE = -10;
let model: Observable;

// Event handler for Page "loaded" event attached in main-page.xml
export function onLoaded(args: ObservableEventData): void {
    // Get the event sender
    let page = <Page>args.object;
    model = new Observable();
    model.set("result", android.os.Build.VERSION.SDK_INT >= 23 ? "Click the button." : "Set targetSDK >= 23 and run on Android 6.0+");
    page.bindingContext = model;
    appInstance.on(AndroidApplication.requestPermissionsEvent, onRequestPermission);
}

export function onRequestTap(args: ObservableEventData): void {
    let activity = (<any>args.object)._context;
    if ((<any>android.support.v4.content.ContextCompat).checkSelfPermission(activity, (<any>android).Manifest.permission.READ_EXTERNAL_STORAGE) !== android.content.pm.PackageManager.PERMISSION_GRANTED) {

        // Should we show an explanation?
        if ((<any>android.support.v4.app.ActivityCompat).shouldShowRequestPermissionRationale(activity, (<any>android).Manifest.permission.READ_EXTERNAL_STORAGE)) {

            // Show an expanation to the user *asynchronously* -- don't block
            // this thread waiting for the user's response! After the user
            // sees the explanation, try again to request the permission.

        } else {

            // No explanation needed, we can request the permission.

            (<any>android.support.v4.app.ActivityCompat).requestPermissions(activity, [(<any>android).Manifest.permission.READ_EXTERNAL_STORAGE], MY_CODE);

            // MY_PERMISSIONS_REQUEST_READ_CONTACTS is an
            // app-defined int constant. The callback method gets the
            // result of the request.
        }
    }
}

function onRequestPermission(data: AndroidRequestPermissionsResultEventData): void {

    // Not our request
    if (data.requestCode !== MY_CODE) {
        return;
    }

    appInstance.off(AndroidApplication.requestPermissionsEvent, onRequestPermission);

    if (data.grantResults.length > 0 && data.grantResults[0] === android.content.pm.PackageManager.PERMISSION_GRANTED) {
        model.set("result", "PERMISSION_GRANTED");
    }
    else {
        model.set("result", "PERMISSION_DENIED");
    }

    // clean up memory.
    model = null;
}