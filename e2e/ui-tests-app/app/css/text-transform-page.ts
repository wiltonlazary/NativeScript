﻿import { Label } from "tns-core-modules/ui/label";
import { Button } from "tns-core-modules/ui/button";
import { TextField } from "tns-core-modules/ui/text-field";
import { TextView } from "tns-core-modules/ui/text-view";
import { Page } from "tns-core-modules/ui/page";

export function onChangeText(args) {
    const page = <Page>args.object.page;
    const lblElelemtn = <Label>page.getViewById("Label");
    const btnElement = <Button>page.getViewById("Button");
    const textFieldElement = <TextField>page.getViewById("TextField");
    const textViewElement = <TextView>page.getViewById("TextView");

    if (lblElelemtn.text === "Change text") {
        lblElelemtn.text = btnElement.text = textFieldElement.text = textViewElement.text = "Text changed";
    } else {
        lblElelemtn.text = btnElement.text = textFieldElement.text = textViewElement.text = "Change text";
    }
}

export function onChangeTextTransformation(args) {
    const page = <Page>args.object.page;
    const lblElelemtn = <Label>page.getViewById("Label");
    const btnElement = <Button>page.getViewById("Button");
    const textFieldElement = <TextField>page.getViewById("TextField");
    const textViewElement = <TextView>page.getViewById("TextView");
    let style = lblElelemtn.style.textTransform;
    if (lblElelemtn.style.textTransform === "none") {
        style = "capitalize";
    } else if (lblElelemtn.style.textTransform === "capitalize") {
        style = "uppercase";
    } else if (lblElelemtn.style.textTransform === "uppercase") {
        style = "lowercase";
    } else if (lblElelemtn.style.textTransform === "lowercase") {
        style = "none";
    }

    lblElelemtn.style.textTransform = style;
    btnElement.style.textTransform = style;
    textFieldElement.style.textTransform = style;
    textViewElement.style.textTransform = style;
}
