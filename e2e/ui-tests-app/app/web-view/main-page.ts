import { EventData } from "tns-core-modules/data/observable";
import { SubMainPageViewModel } from "../sub-main-page-view-model";
import { WrapLayout } from "tns-core-modules/ui/layouts/wrap-layout";
import { Page } from "tns-core-modules/ui/page";

export function pageLoaded(args: EventData) {
    const page = <Page>args.object;
    const wrapLayout = <WrapLayout>page.getViewById("wrapLayoutWithExamples");
    page.bindingContext = new SubMainPageViewModel(wrapLayout, loadExamples());
}

export function loadExamples() {
    const examples = new Map<string, string>();
    examples.set("webview", "web-view/web-view-page");
    examples.set("webtest", "web-view/web-view-test-page");
    examples.set("query", "web-view/query-params-page");

    return examples;
}
