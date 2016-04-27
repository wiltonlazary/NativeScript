﻿import * as application from "application";
import {NavPage} from "../nav-page";
import * as trace from "trace";
import { Frame } from "ui/frame";

Frame.defaultTransition = { name: "fade" };

trace.enable();
trace.setCategories(trace.categories.concat(
    trace.categories.NativeLifecycle,
    trace.categories.Navigation,
    trace.categories.Transition
));

application.mainEntry = {
    create: () => new NavPage({
        index: 0,
        backStackVisible: true,
        clearHistory: false,
        animated: true,
        transition: 0,
        curve: 0,
        duration: 0,
    })
};
application.start();
