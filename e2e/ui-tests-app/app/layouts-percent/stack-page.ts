﻿import * as enums from "tns-core-modules/ui/enums";
import * as pageModule from "tns-core-modules/ui/page";
import * as model from "./myview";

export function onLoaded(args: { eventName: string, object: any }) {
    var page = <pageModule.Page>args.object;
    page.bindingContext = new model.ViewModelWithPercentage();
}

export function onOrientation(args: { eventName: string, object: any }) {
    var layout = args.object.parent;
    if (layout.orientation === enums.Orientation.vertical) {
        layout.orientation = enums.Orientation.horizontal;
    } else {
        layout.orientation = enums.Orientation.vertical;
    }
}
