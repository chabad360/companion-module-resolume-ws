import {CompanionActionContext, CompanionActionEvent, CompanionActionDefinitions} from "@companion-module/base";
import ResolumeInstance from "../index";
import {ActionType} from "resolume";
import {NumberOrVariable} from "./actions";

export function getCursorActions(instance: ResolumeInstance): CompanionActionDefinitions {
    return {
        "clear-layer": {
            name: "Clear Layer",
            options: [
                {
                    type: "textinput",
                    label: "Layer",
                    id: "layer",
                    regex: NumberOrVariable,
                    useVariables: true,
                }
            ],
            callback: (action, context) => clearLayer(action, context, instance)
        },
        "clear-selected-layer": {
            name: "Clear Selected Layer",
            options: [],
            callback: (action, context) => clearLayer(action, context, instance, instance.selectedLayer)
        },

        "clear-clip-layer": {
            name: "Clear Layer for Clip (if playing)",
            options: [
                {
                    type: "textinput",
                    label: "Clip Layer",
                    id: "layer",
                    regex: NumberOrVariable,
                    useVariables: true,
                },
                {
                    type: "textinput",
                    label: "Clip Column",
                    id: "column",
                    regex: NumberOrVariable,
                    useVariables: true,
                },
            ],
            callback: (action, context) => clearClipLayer(action, context, instance)
        },
        "clear-selected-clip-layer": {
            name: "Clear Layer for Selected Clip (if playing)",
            options: [],
            callback: (action, context) => clearClipLayer(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn)
        },

        "select-layer": {
            name: "Select Layer",
            options: [
                {
                    type: "textinput",
                    label: "Layer",
                    id: "layer",
                    regex: NumberOrVariable,
                    useVariables: true,
                }
            ],
            callback: (action, context) => selectLayer(action, context, instance)
        },
        "select-clip": {
            name: "Select Clip",
            options: [
                {
                    type: "textinput",
                    label: "Clip Layer",
                    id: "layer",
                    regex: NumberOrVariable,
                    useVariables: {
                        local: true
                    },
                },
                {
                    type: "textinput",
                    label: "Clip Column",
                    id: "column",
                    regex: NumberOrVariable,
                    useVariables: {
                        local: true
                    },
                },
            ],
            callback: (action, context) => selectClip(action, context, instance)
        },

        "connect-clip": {
            name: "Connect Clip",
            options: [
                {
                    type: "textinput",
                    label: "Clip Layer",
                    id: "layer",
                    regex: NumberOrVariable,
                    useVariables: true,
                },
                {
                    type: "textinput",
                    label: "Clip Column",
                    id: "column",
                    regex: NumberOrVariable,
                    useVariables: true,
                },
            ],
            callback: (action, context) => connectClip(action, context, instance)
        },
        "connect-selected-clip": {
            name: "Connect Selected Clip",
            options: [],
            callback: (action, context) => connectClip(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn)
        },

        "clear-clip": {
            name: "Clear Clip",
            options: [
                {
                    type: "textinput",
                    label: "Clip Layer",
                    id: "layer",
                    regex: NumberOrVariable,
                    useVariables: true,
                },
                {
                    type: "textinput",
                    label: "Clip Column",
                    id: "column",
                    regex: NumberOrVariable,
                    useVariables: true,
                },
            ],
            callback: (action, context) => clearClip(action, context, instance)
        },
        "clear-selected-clip": {
            name: "Clear Selected Clip",
            options: [],
            callback: (action, context) => clearClip(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn)
        },
    }
}

export const clearLayer = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, l?: number | null) => {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>action.options.layer)) - 1;

    if (instance.resolume) {
        return instance.resolume.send({
            action: ActionType.Trigger,
            parameter: `/composition/layers/${layer + 1}/clear`,
        });
    }
}
export const clearClipLayer = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, l?: number | null, c?: number | null) => {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>action.options.layer)) - 1;
    let column = c ?? parseInt(await context.parseVariablesInString(<string>action.options.column)) - 1;
    if (layer === undefined || typeof layer !== "number" || column === undefined || typeof column !== "number") {
        return;
    }

    const clip = instance.composition?.layers?.[layer]?.clips?.[column];
    if (clip === undefined) {
        return;
    }

    if (clip.connected?.index === undefined || clip.connected.index < 3) {
        return;
    }

    if (instance.resolume) {
        return instance.resolume.send({
            action: ActionType.Trigger,
            parameter: `/composition/layers/${layer + 1}/clear`,
        });
    }
}
export const selectClip = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance) => {
    let layer = parseInt(await context.parseVariablesInString(<string>action.options.layer));
    let column = parseInt(await context.parseVariablesInString(<string>action.options.column));


    if (instance.resolume) {
        return instance.resolume.send({
            action: ActionType.Trigger,
            parameter: `/composition/layers/${layer}/clips/${column}/select`,
        });
    }
}
export const connectClip = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, l?: number | null, c?: number | null) => {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>action.options.layer)) - 1;
    let column = c ?? parseInt(await context.parseVariablesInString(<string>action.options.column)) - 1;

    if (instance.resolume) {
        instance.resolume.send({
            action: ActionType.Trigger,
            parameter: `/composition/layers/${layer + 1}/clips/${column + 1}/connect`,
            value: true,
        });

        return instance.resolume.send({
            action: ActionType.Trigger,
            parameter: `/composition/layers/${layer + 1}/clips/${column + 1}/connect`,
            value: false,
        });
    }
}
export const clearClip = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, l?: number | null, c?: number | null) => {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>action.options.layer)) - 1;
    let column = c ?? parseInt(await context.parseVariablesInString(<string>action.options.column)) - 1;

    if (instance.resolume) {
        return instance.resolume.send({
            action: ActionType.Post,
            path: `/composition/layers/${layer + 1}/clips/${column + 1}/clear`,
        });
    }
}
export const selectLayer = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance) => {
    let layer = parseInt(await context.parseVariablesInString(<string>action.options.layer));

    if (instance.resolume) {
        return instance.resolume.send({
            action: ActionType.Trigger,
            parameter: `/composition/layers/${layer}/select`,
        });
    }
}