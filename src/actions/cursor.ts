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
                    type: "checkbox",
                    label: "Selected Layer",
                    id: "selected",
                    default: false,
                },
                {
                    type: "textinput",
                    label: "Layer",
                    id: "layer",
                    regex: NumberOrVariable,
                    useVariables: true,
                    isVisible: (options) => !options.selected,
                }
            ],
            callback: (action, context) => action.options.selected ?
                clearLayer(action, context, instance, instance.selectedLayer) :
                clearLayer(action, context, instance)
        },

        "clear-clip-layer": {
            name: "Clear Layer for Clip (if playing)",
            options: [
                {
                    type: "checkbox",
                    label: "Selected Clip",
                    id: "selected",
                    default: false,
                },
                {
                    type: "textinput",
                    label: "Clip Layer",
                    id: "layer",
                    regex: NumberOrVariable,
                    useVariables: true,
                    isVisible: (options) => !options.selected,
                },
                {
                    type: "textinput",
                    label: "Clip Column",
                    id: "column",
                    regex: NumberOrVariable,
                    useVariables: true,
                    isVisible: (options) => !options.selected,
                },
            ],
            callback: (action, context) => action.options.selected ?
                clearClipLayer(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn) :
                clearClipLayer(action, context, instance)
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
                    type: "checkbox",
                    label: "Selected Clip",
                    id: "selected",
                    default: false,
                },
                {
                    type: "textinput",
                    label: "Clip Layer",
                    id: "layer",
                    regex: NumberOrVariable,
                    useVariables: true,
                    isVisible: (options) => !options.selected,
                },
                {
                    type: "textinput",
                    label: "Clip Column",
                    id: "column",
                    regex: NumberOrVariable,
                    useVariables: true,
                    isVisible: (options) => !options.selected,
                },
            ],
            callback: (action, context) => action.options.selected ?
                connectClip(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn) :
                connectClip(action, context, instance)
        },

        "clear-clip": {
            name: "Clear Clip",
            options: [
                {
                    type: "checkbox",
                    label: "Selected Clip",
                    id: "selected",
                    default: false,
                },
                {
                    type: "textinput",
                    label: "Clip Layer",
                    id: "layer",
                    regex: NumberOrVariable,
                    useVariables: true,
                    isVisible: (options) => !options.selected,
                },
                {
                    type: "textinput",
                    label: "Clip Column",
                    id: "column",
                    regex: NumberOrVariable,
                    useVariables: true,
                    isVisible: (options) => !options.selected,
                },
            ],
            callback: (action, context) => action.options.selected ?
                clearClip(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn) :
                clearClip(action, context, instance)
        },

        "connect-column": {
            name: "Connect Column",
            options: [
                {
                    type: "textinput",
                    label: "Column",
                    id: "column",
                    regex: NumberOrVariable,
                    useVariables: true,
                }
            ],
            callback: (action, context) => connectColumn(action, context, instance)
        },
        "connect-current-column": {
            name: "Reconnect Current Column",
            options: [],
            callback: (action, context) => connectColumn(action, context, instance, instance.connectedColumn)
        },
        "connect-next-column": {
            name: "Connect Next Column",
            options: [],
            callback: (action, context) => connectColumn(action, context, instance, (instance.connectedColumn ?? 0) + 1)
        },
        "connect-previous-column": {
            name: "Connect Previous Column",
            options: [],
            callback: (action, context) => connectColumn(action, context, instance, (instance.connectedColumn ?? 0) - 1)
        }
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

export const connectColumn = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, c?: number | null) => {
    let column = c ?? parseInt(await context.parseVariablesInString(<string>action.options.column)) - 1;

    if (instance.resolume) {
        instance.resolume.send({
            action: ActionType.Trigger,
            parameter: `/composition/columns/${column + 1}/connect`,
            value: true,
        });

        return instance.resolume.send({
            action: ActionType.Trigger,
            parameter: `/composition/columns/${column + 1}/connect`,
            value: false,
        });
    }
}