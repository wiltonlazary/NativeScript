import { EventData } from "tns-core-modules/data/observable";
import { WrapLayout } from "tns-core-modules/ui/layouts/wrap-layout";
import { Page } from "tns-core-modules/ui/page";

import { SubMainPageViewModel } from "../sub-main-page-view-model";

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    const wrapLayout = <WrapLayout>page.getViewById("wrapLayoutWithExamples");
    page.bindingContext = new SubMainPageViewModel(wrapLayout, loadExamples());
}

export function loadExamples() {
    const examples = new Map<string, string>();
    examples.set("tabs", "tabs/tabs-page");
    examples.set("issue-5470", "tabs/issue-5470-page");
    examples.set("background-color", "tabs/background-color-page");
    examples.set("color", "tabs/color-page");
    examples.set("font", "tabs/font-page");
    examples.set("text-transform", "tabs/text-transform-page");
    examples.set("highlight-color", "tabs/highlight-color-page");
    examples.set("icon-title-placement", "tabs/icon-title-placement-page");
    examples.set("icon-change", "tabs/icon-change-page");
    examples.set("swipe-enabled", "tabs/swipe-enabled-page");
    examples.set("strip-item", "tabs/tab-strip-item-page");
    examples.set("strip-items", "tabs/tab-strip-items-page");
    examples.set("tabs-position", "tabs/tabs-position-page");
    examples.set("tabs-binding", "tabs/tabs-binding-page");
    examples.set("font-icons", "tabs/font-icons-page");

    return examples;
}
