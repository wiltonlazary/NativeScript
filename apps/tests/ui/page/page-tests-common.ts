﻿// >> article-require-module
import pageModule = require("ui/page");
//// FrameModule is needed in order to have an option to navigate to the new page.
import frameModule = require("ui/frame");
// << article-require-module

// >> article-set-bindingcontext
function pageLoaded(args) {
  var page = args.object;
  page.bindingContext = { name : "Some name" };
}
exports.pageLoaded = pageLoaded;
// << article-set-bindingcontext
import TKUnit = require("../../TKUnit");
import labelModule = require("ui/label");
import {StackLayout} from "ui/layouts/stack-layout";
import helper = require("../helper");
import view = require("ui/core/view");
import observable = require("data/observable");
import {Page, ShownModallyData, NavigatedData} from "ui/page";
import {Label} from "ui/label";
import {EventData} from "data/observable";

export function addLabelToPage(page: Page, text?: string) {
    var label = new Label();
    label.text = text || "The quick brown fox jumps over the lazy dog.";
    page.content = label;
}

export function test_AfterPageLoaded_is_called_NativeInstance_is_created() {

    var page: Page;
    var label: Label;
    var nativeInstanceCreated = false;

    var handler = function (data) {
        if (label.ios || label.android) {
            nativeInstanceCreated = true;
        }
    }

    var pageFactory = function (): Page {
        page = new Page();
        page.on(view.View.loadedEvent, handler);

        label = new Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);

    TKUnit.assertTrue(nativeInstanceCreated, "nativeInstanceCreated");
    page.off(view.View.loadedEvent, handler);
}

export function test_PageLoaded_is_called_once() {

    var page1: Page;
    var page2: Page;

    var loaded = 0;
    var handler = function (data) {
        loaded++;
    }

    var pageFactory = function (): Page {
        page1 = new Page();
        addLabelToPage(page1, "Page 1");
        return page1;
    };

    helper.navigate(pageFactory);
    TKUnit.assertEqual(loaded, 0);

    var pageFactory2 = function (): Page {
        page2 = new Page();
        addLabelToPage(page2, "Page 2");
        page2.on(view.View.loadedEvent, handler);
        return page2;
    };

    helper.navigate(pageFactory2);

    TKUnit.assertEqual(loaded, 1);
    page2.off(view.View.loadedEvent, handler);
}

export function test_NavigateToNewPage() {
    // >> artivle-create-navigate-to-page
    var currentPage;
    var topFrame = frameModule.topmost();
    currentPage = topFrame.currentPage;

    
    var testPage: Page;
    var pageFactory = function (): Page {
        testPage = new pageModule.Page();
        let label = new labelModule.Label();
        label.text = "The quick brown fox jumps over the lazy dog.";
        testPage.content = label;
        return testPage;
    };
    var navEntry = {
        create: pageFactory,
        animated: false
    };
    topFrame.navigate(navEntry);
    // << artivle-create-navigate-to-page

    TKUnit.waitUntilReady(() => { return testPage.isLayoutValid });

    // >> article-navigating-backward
    topFrame.goBack();
    // << article-navigating-backward

    TKUnit.waitUntilReady(() => { return topFrame.currentPage !== null && topFrame.currentPage === currentPage });
    TKUnit.assert(testPage.parent === undefined, "Page.parent should become undefined after navigating back");
    TKUnit.assert(testPage._context === undefined, "Page._context should become undefined after navigating back");
    TKUnit.assert(testPage.isLoaded === false, "Page.isLoaded should become false after navigating back");
    TKUnit.assert(testPage.frame === undefined, "Page.frame should become undefined after navigating back");
    TKUnit.assert(testPage._isAddedToNativeVisualTree === false, "Page._isAddedToNativeVisualTree should become false after navigating back");
}

export function test_PageNavigation_EventSequence_WithTransition() {
    _test_PageNavigation_EventSequence(true);
}

export function test_PageNavigation_EventSequence_WithoutTransition() {
    _test_PageNavigation_EventSequence(false);
}

function _test_PageNavigation_EventSequence(withTransition: boolean) {
    var testPage: Page;
    var context = { property: "this is the context" };
    var eventSequence = [];
    var pageFactory = function () {
        testPage = new Page();
        addLabelToPage(testPage);

        testPage.on(Page.navigatingToEvent, function (data: NavigatedData) {
            eventSequence.push("navigatingTo");
            TKUnit.assertEqual(data.context, context, "navigatingTo: navigationContext");
        });

        testPage.on(Page.loadedEvent, function (data: observable.EventData) {
            eventSequence.push("loaded");
            TKUnit.assertNotEqual(frameModule.topmost().currentPage, data.object);
        });

        testPage.on(Page.navigatedToEvent, function (data: NavigatedData) {
            eventSequence.push("navigatedTo");
            TKUnit.assertEqual(data.context, context, "navigatedTo : navigationContext");
            TKUnit.assertEqual(frameModule.topmost().currentPage, data.object);
        });

        testPage.on(Page.navigatingFromEvent, function (data: NavigatedData) {
            eventSequence.push("navigatingFrom");
            TKUnit.assertEqual(data.context, context, "navigatingFrom: navigationContext");
        });

        testPage.on(Page.navigatedFromEvent, function (data: NavigatedData) {
            eventSequence.push("navigatedFrom");
            TKUnit.assertEqual(data.context, context, "navigatedFrom: navigationContext");
        });

        testPage.on(Page.unloadedEvent, function (data) {
            eventSequence.push("unloaded");
        });

        return testPage;
    };

    let currentPage = frameModule.topmost().currentPage;
    if (withTransition) {
        var navigationTransition: frameModule.NavigationTransition = {
            name: "slide",
            duration: 100,
        };
        var navigationEntry: frameModule.NavigationEntry = {
            create: pageFactory,
            context: context,
            animated: true,
            transition: navigationTransition
        }
        frameModule.topmost().navigate(navigationEntry);
    }
    else {
        var navigationEntry: frameModule.NavigationEntry = {
            create: pageFactory,
            context: context,
        }
        frameModule.topmost().navigate(navigationEntry);
    }

    TKUnit.waitUntilReady(() => frameModule.topmost().currentPage !== null && frameModule.topmost().currentPage === testPage);

    frameModule.goBack();
    TKUnit.waitUntilReady(() => frameModule.topmost().currentPage !== null && frameModule.topmost().currentPage === currentPage);

    var expectedEventSequence = ["navigatingTo", "loaded", "navigatedTo", "navigatingFrom", "unloaded", "navigatedFrom"];
    TKUnit.arrayAssert(eventSequence, expectedEventSequence, "Actual event sequence is not equal to expected. Actual: " + eventSequence + "; Expected: " + expectedEventSequence);
}

export function test_NavigateTo_WithContext() {
    let currentPage = frameModule.topmost().currentPage;
    // >> article-pass-data
    var testPage: pageModule.Page;
    var pageFactory = function (): pageModule.Page {
        testPage = new pageModule.Page();
        testPage.on(pageModule.Page.navigatedToEvent, function () {
            ////console.log(JSON.stringify(context));
        });
        return testPage;
    };
    var navEntry = {
        create: pageFactory,
        context: "myContext",
        animated: false
    };
    let topFrame = frameModule.topmost();
    topFrame.navigate(navEntry);
    // << article-pass-data
    TKUnit.waitUntilReady(() => topFrame.currentPage !== null && topFrame.currentPage !== currentPage && testPage.isLayoutValid);

    var actualContextValue = testPage.navigationContext;
    TKUnit.assertEqual(actualContextValue, "myContext");

    topFrame.goBack();
    TKUnit.waitUntilReady(() => topFrame.currentPage !== null && topFrame.currentPage === currentPage);

    TKUnit.assertNull(testPage.navigationContext, "Navigation context should be cleared on navigating back");
}

export function test_FrameBackStack_WhenNavigatingForwardAndBack() {
    var testPage: Page;
    var pageFactory = function () {
        testPage = new Page();
        addLabelToPage(testPage);
        return testPage;
    };

    let topFrame = frameModule.topmost();
    let currentPage = topFrame.currentPage;

    topFrame.navigate(pageFactory);
    TKUnit.waitUntilReady(() => topFrame.currentPage !== null && topFrame.currentPage === testPage);

    TKUnit.assertEqual(topFrame.backStack.length, 1);
    TKUnit.assertTrue(topFrame.canGoBack(), "We should can go back.");

    topFrame.goBack();
    TKUnit.waitUntilReady(() => topFrame.currentPage !== null && topFrame.currentPage === currentPage);

    TKUnit.assertEqual(topFrame.backStack.length, 0);
    TKUnit.assertFalse(topFrame.canGoBack(), "canGoBack should return false.");
}

export function test_LoadPageFromModule() {
    let topFrame = frameModule.topmost();
    helper.navigateToModule("ui/page/test-page-module");

    TKUnit.assert(topFrame.currentPage.content instanceof Label, "Content of the test page should be a Label created within test-page-module.");
    let testLabel = <Label>topFrame.currentPage.content;
    TKUnit.assertEqual(testLabel.text, "Label created within a page module.");
}

export function test_LoadPageFromDeclarativeWithCSS() {
    let topFrame = frameModule.topmost();
    helper.navigateToModule("ui/page/test-page-declarative-css");

    TKUnit.assert(topFrame.currentPage.content instanceof Label, "Content of the test page should be a Label created within test-page-module-css.");
    var testLabel = <Label>topFrame.currentPage.content;
    TKUnit.assertEqual(testLabel.text, "Label created within a page declarative file with css.");
    TKUnit.assertEqual(testLabel.style.backgroundColor.hex, "#ff00ff00");
}

export function test_LoadPageFromModuleWithCSS() {
    let topFrame = frameModule.topmost();
    helper.navigateToModule("ui/page/test-page-module-css");

    TKUnit.assert(topFrame.currentPage.content instanceof Label, "Content of the test page should be a Label created within test-page-module-css.");
    var testLabel = <Label>topFrame.currentPage.content;
    TKUnit.assertEqual(testLabel.text, "Label created within a page module css.");
    TKUnit.assertEqual(testLabel.style.backgroundColor.hex, "#ff00ff00");
}

export function test_NavigateToPageCreatedWithNavigationEntry() {
    var expectedText = "Label created with a NavigationEntry";
    var testPage: Page;
    var pageFactory = function () {
        testPage = new Page();
        addLabelToPage(testPage, expectedText);
        return testPage;
    };

    helper.navigate(pageFactory);

    var actualContent = <Label>testPage.content;
    TKUnit.assertEqual(actualContent.text, expectedText);
}

export function test_cssShouldBeAppliedToAllNestedElements() {
    let expectedText = "Some text";
    let testPage = new Page();
    let label = new Label();
    label.text = expectedText;

    let stackLayout = new StackLayout();
    stackLayout.addChild(label);
    testPage.content = stackLayout;
    testPage.css = "stackLayout {background-color: #ffff0000;} label {background-color: #ff00ff00;}";

    let pageFactory = function () {
        return testPage;
    };

    helper.navigate(pageFactory);
    
    TKUnit.assertEqual(label.style.backgroundColor.hex, "#ff00ff00");
    TKUnit.assertEqual(stackLayout.style.backgroundColor.hex, "#ffff0000");
}

export function test_cssShouldBeAppliedAfterChangeToAllNestedElements() {
    let expectedText = "Some text";
    let testPage = new Page();
    let label = new Label();
    label.text = expectedText;

    let stackLayout = new StackLayout();
    stackLayout.addChild(label);
    testPage.content = stackLayout;
    testPage.css = "stackLayout {background-color: #ffff0000;} label {background-color: #ff00ff00;}";

    let pageFactory = function () {
        return testPage;
    };

    helper.navigate(pageFactory);

    TKUnit.assertEqual(label.style.backgroundColor.hex, "#ff00ff00");
    TKUnit.assertEqual(stackLayout.style.backgroundColor.hex, "#ffff0000");

    testPage.css = "stackLayout {background-color: #ff0000ff;} label {background-color: #ffff0000;}";
    TKUnit.assertEqual(label.style.backgroundColor.hex, "#ffff0000");
    TKUnit.assertEqual(stackLayout.style.backgroundColor.hex, "#ff0000ff");
}

export function test_page_backgroundColor_is_white() {
    let page = new Page();
    let factory = () => page;
    helper.navigate(factory);
    TKUnit.assertEqual(page.style.backgroundColor.hex.toLowerCase(), "#ffffff", "page background-color");
}

export function test_WhenPageIsLoadedFrameCurrentPageIsNotYetTheSameAsThePage() {
    var page;
    var loadedEventHandler = function (args) {
        TKUnit.assertNotEqual(frameModule.topmost().currentPage, args.object, "When a page is loaded it should not yet be the current page.");
    }

    var pageFactory = function (): Page {
        page = new Page();
        page.id = "newPage";
        page.on(view.View.loadedEvent, loadedEventHandler);
        var label = new Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);
    page.off(view.View.loadedEvent, loadedEventHandler);
}

export function test_WhenPageIsNavigatedToFrameCurrentPageIsNowTheSameAsThePage() {
    var page;
    var navigatedEventHandler = function (args) {
        TKUnit.assertEqual(frameModule.topmost().currentPage, args.object, `frame.topmost().currentPage should be equal to args.object page instance in the page.navigatedTo event handler. Expected: ${args.object.id}; Actual: ${frameModule.topmost().currentPage.id};`);
    }

    var pageFactory = function (): Page {
        page = new Page();
        page.id = "newPage";
        page.on(Page.navigatedToEvent, navigatedEventHandler);
        var label = new Label();
        label.text = "Text";
        page.content = label;
        return page;
    };

    helper.navigate(pageFactory);
    page.off(view.View.loadedEvent, navigatedEventHandler);
}

export function test_WhenNavigatingForwardAndBack_IsBackNavigationIsCorrect() {
    var page1;
    var page2;
    var forwardCounter = 0;
    var backCounter = 0;
    var navigatedEventHandler = function (args: NavigatedData) {
        if (args.isBackNavigation) {
            backCounter++;
        }
        else {
            forwardCounter++;
        }
    }

    var pageFactory1 = function (): Page {
        page1 = new Page();
        page1.on(Page.navigatedToEvent, navigatedEventHandler);
        return page1;
    };

    var pageFactory2 = function (): Page {
        page2 = new Page();
        page2.on(Page.navigatedToEvent, navigatedEventHandler);
        return page2;
    };

    let topFrame = frameModule.topmost();
    helper.navigateWithHistory(pageFactory1);
    helper.navigateWithHistory(pageFactory2);

    frameModule.goBack();
    TKUnit.waitUntilReady(() => topFrame.currentPage !== null && topFrame.currentPage === page1);

    TKUnit.assertEqual(forwardCounter, 2, "Forward navigation counter should be 1");
    TKUnit.assertEqual(backCounter, 1, "Backward navigation counter should be 1");
    page1.off(Page.navigatedToEvent, navigatedEventHandler);
    page2.off(Page.navigatedToEvent, navigatedEventHandler);
}

export function test_WhenPageIsNavigatedToItCanShowAnotherPageAsModal() {
    var masterPage;
    var ctx = {
        shownModally: false
    };

    var modalClosed = false;
    var modalCloseCallback = function (returnValue: any) {
        TKUnit.assertTrue(ctx.shownModally, "Modal-page must be shown!");
        TKUnit.assertEqual(returnValue, "return value", "Modal-page must return value!");
        modalClosed = true;
    }

    let modalPage: Page;

    let shownModally = 0;
    var onShownModal = function (args: ShownModallyData) {
        shownModally++;
        modalPage.off(Page.shownModallyEvent, onShownModal);
    }

    let modalLoaded = 0;
    var onModalLoaded = function (args: EventData) {
        modalLoaded++;
        modalPage.off(Page.loadedEvent, onModalLoaded);
    }

    let modalUnloaded = 0;
    var onModalUnloaded = function (args: EventData) {
        modalUnloaded++;
        modalPage.off(Page.unloadedEvent, onModalUnloaded);
        TKUnit.assertNull(masterPage.modal, "currentPage.modal should be undefined when no modal page is shown!");
    }

    var navigatedToEventHandler = function (args) {
        let page = <Page>args.object;
        TKUnit.assertNull(page.modal, "currentPage.modal should be undefined when no modal page is shown!");
        let basePath = "ui/page/";
        let entry: frameModule.NavigationEntry = {
            moduleName: basePath + "modal-page"
        };

        modalPage = <Page>frameModule.resolvePageFromEntry(entry);
        modalPage.on(Page.shownModallyEvent, onShownModal);
        modalPage.on(Page.loadedEvent, onModalLoaded);
        modalPage.on(Page.unloadedEvent, onModalUnloaded);

        page.showModal(modalPage, ctx, modalCloseCallback, false);
        TKUnit.assertTrue((<any>modalPage).showingModally, "showingModally");
    };

    var masterPageFactory = function (): Page {
        masterPage = new Page();
        masterPage.id = "newPage";
        masterPage.on(Page.navigatedToEvent, navigatedToEventHandler);
        var label = new Label();
        label.text = "Text";
        masterPage.content = label;
        return masterPage;
    };

    helper.navigate(masterPageFactory);

    TKUnit.waitUntilReady(() => { return modalUnloaded > 0; });
    TKUnit.assertEqual(shownModally, 1, "shownModally");
    TKUnit.assertEqual(modalLoaded, 1, "modalLoaded");
    TKUnit.assertEqual(modalUnloaded, 1, "modalUnloaded");

    masterPage.off(Page.navigatedToEvent, navigatedToEventHandler);
}

//export function test_ModalPage_Layout_is_Correct() {
//    var testPage: Page;
//    var label: Label;
//    var pageFactory = function () {
//        testPage = new Page();
//        label = new Label();
//        label.text = "Will Show modal page";
//        testPage.content = label;
//        return testPage;
//    };

//    helper.navigate(pageFactory);
//    var basePath = "ui/page/";
//    testPage.showModal(basePath + "page21", testPage, () => { }, false);

//    // TODO: Remove this once navigate and showModal returns Promise<Page>.
//    TKUnit.wait(0.350);
//    var childPage = (<any>testPage).childPage;
//    var closeCallback: Function = (<any>testPage).close;

//    try {
//        var layout = <StackLayout>childPage.content;
//        var repeater = layout.getChildAt(1);
//        TKUnit.assertTrue(repeater.isLayoutValid, "layout should be valid.");
//        var bounds = repeater._getCurrentLayoutBounds();
//        var height = bounds.bottom - bounds.top;
//        TKUnit.assertTrue(height > 0, "Layout should be >0.");

//        closeCallback();
//        TKUnit.wait(0.150);
//    }
//    finally {
//        helper.goBack
//        helper.goBack();
//    }
//}
