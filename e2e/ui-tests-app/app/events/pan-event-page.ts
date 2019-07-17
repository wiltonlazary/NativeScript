import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { PanGestureEventData } from "tns-core-modules/ui/gestures";
import { View } from "tns-core-modules/ui/core/view";
import { TextView } from "tns-core-modules/ui/text-view";

var view: View;
export function navigatingTo(args: EventData) {
    var page = <Page>args.object;
    view = page.getViewById<View>("target");
}

export function onPan(data: PanGestureEventData) {
    console.log(`data state:${data.state} [${data.deltaX}, ${data.deltaY}]`);
    var msg = `data state:${data.state} [${data.deltaX}, ${data.deltaY}]`;
        (<TextView>view.page.getViewById("output")).text += msg + "\n";
    view.translateX = data.deltaX;
    view.translateY = data.deltaY;
}

export function clear(args) {
    args.object.page.getViewById("output").text = "";
}
