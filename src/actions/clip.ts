import {CompanionActionContext, CompanionActionDefinitions, CompanionActionEvent} from "@companion-module/base";
import ResolumeInstance from "../index";
import {ActionType} from "resolume";
import {NumberOrVariable} from "./actions";

export function getClipActions(instance: ResolumeInstance): CompanionActionDefinitions {
    return {
        "set-playmodeaway": {
            name: "Set Clip Start Mode",
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
                {
                    type: "dropdown",
                    label: "Start Mode",
                    id: "playmodeaway",
                    default: 0,
                    choices: [
                        {id: 0, label: "Restart"},
                        {id: 1, label: "Continue"},
                        {id: 2, label: "Relative"},
                    ]
                }
            ],
            callback: (action, context) => action.options.selected ?
                setPlaymodeaway(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn) :
                setPlaymodeaway(action, context, instance)
        },

        "set-playmode": {
            name: "Set Clip End Mode",
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
                {
                    type: "dropdown",
                    label: "Loop Mode",
                    id: "playmode",
                    default: 0,
                    choices: [
                        {id: 0, label: "Loop"},
                        {id: 1, label: "Bounce"},
                        {id: 2, label: "Random"},
                        {id: 3, label: "Play Once & Clear"},
                        {id: 4, label: "Play Once & Hold"},
                    ]
                }
            ],
            callback: (action, context) => action.options.selected ?
                setPlaymode(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn) :
                setPlaymode(action, context, instance)
        },
        "set-playdirection": {
            name: "Set Clip Play Mode",
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
                {
                    type: "dropdown",
                    label: "Playback Direction",
                    id: "playdirection",
                    default: 0,
                    choices: [
                        {id: 0, label: "Backward"},
                        {id: 1, label: "Pause"},
                        {id: 2, label: "Forward"},
                    ]
                }
            ],
            callback: (action, context) => action.options.selected ?
                setPlaydirection(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn) :
                setPlaydirection(action, context, instance)
        },
        "toggle-playdirection": {
            name: "Toggle Between Clip Play Modes",
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
                {
                    type: "dropdown",
                    label: "From",
                    id: "playdirectionfrom",
                    default: 1,
                    choices: [
                        {id: 0, label: "Backward (0)"},
                        {id: 1, label: "Pause (1)"},
                        {id: 2, label: "Forward (2)"},
                    ]
                },
                {
                    type: "dropdown",
                    label: "To",
                    id: "playdirectionto",
                    default: 2,
                    choices: [
                        {id: 0, label: "Backward (0)"},
                        {id: 1, label: "Pause (1)"},
                        {id: 2, label: "Forward (2)"},
                    ]
                }
            ],
            callback: (action, context) => (action.options.selected ?
                togglePlaydirection(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn) :
                togglePlaydirection(action, context, instance))
        },

        "set-clip-resize": {
            name: "Set Clip Resize Mode",
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
                {
                    type: "dropdown",
                    label: "Resize Mode",
                    id: "resize",
                    default: 0,
                    choices: [
                        {id: 0, label: "Fill"},
                        {id: 1, label: "Fit"},
                        {id: 2, label: "Stretch"},
                        {id: 3, label: "Original"},
                    ]
                }
            ],
            callback: (action, context) => action.options.selected ?
                setResize(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn) :
                setResize(action, context, instance)
        },
        "toggle-clip-resize": {
            name: "Toggle Between Clip Resize Modes",
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
                {
                    type: "dropdown",
                    label: "From",
                    id: "resizeFrom",
                    default: 0,
                    choices: [
                        {id: 0, label: "Fill (0)"},
                        {id: 1, label: "Fit (1)"},
                        {id: 2, label: "Stretch (2)"},
                        {id: 3, label: "Original (3)"},
                    ]
                },
                {
                    type: "dropdown",
                    label: "To",
                    id: "resizeTo",
                    default: 3,
                    choices: [
                        {id: 0, label: "Fill (0)"},
                        {id: 1, label: "Fit (1)"},
                        {id: 2, label: "Stretch (2)"},
                        {id: 3, label: "Original (3)"},
                    ]
                }
            ],
            callback: (action, context) => action.options.selected ?
                toggleResize(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn) :
                toggleResize(action, context, instance)
        },
    }
}

export const setPlaymodeaway = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, l?: number | null, c?: number | null) => {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>action.options.layer)) - 1;
    let column = c ?? parseInt(await context.parseVariablesInString(<string>action.options.column)) - 1;
    let playmodeaway = action.options.playmodeaway;
    if (layer === undefined || typeof layer !== "number" || column === undefined || typeof column !== "number" || playmodeaway === undefined || typeof playmodeaway !== "number") {
        return;
    }
    let clip = instance.composition?.layers?.[layer]?.clips?.[column];
    if (clip === undefined) {
        return;
    }
    let pma = clip.transport?.controls?.playmodeaway;
    if (pma === undefined) {
        return;
    }
    if (instance.resolume) {
        return instance.resolume.send({
            action: ActionType.Set,
            parameter: "/parameter/by-id/" + pma.id,
            value: playmodeaway,
        });
    }
}
export const setPlaymode = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, l?: number | null, c?: number | null) => {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>action.options.layer)) - 1;
    let column = c ?? parseInt(await context.parseVariablesInString(<string>action.options.column)) - 1;
    let playmode = action.options.playmode;
    if (layer === undefined || typeof layer !== "number" || column === undefined || typeof column !== "number" || playmode === undefined || typeof playmode !== "number") {
        return;
    }
    let clip = instance.composition?.layers?.[layer]?.clips?.[column];
    if (clip === undefined) {
        return;
    }
    let pm = clip.transport?.controls?.playmode;
    if (pm === undefined) {
        return;
    }
    if (instance.resolume) {
        return instance.resolume.send({
            action: ActionType.Set,
            parameter: "/parameter/by-id/" + pm.id,
            value: playmode,
        });
    }
}
export const setPlaydirection = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, l?: number | null, c?: number | null) => {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>action.options.layer)) - 1;
    let column = c ?? parseInt(await context.parseVariablesInString(<string>action.options.column)) - 1;
    let playdirection = action.options.playdirection;
    if (layer === undefined || typeof layer !== "number" || column === undefined || typeof column !== "number" || playdirection === undefined || typeof playdirection !== "number") {
        return;
    }
    let clip = instance.composition?.layers?.[layer]?.clips?.[column];
    if (clip === undefined) {
        return;
    }
    let pd = clip.transport?.controls?.playdirection;
    if (pd === undefined) {
        return;
    }
    if (instance.resolume) {
        return instance.resolume.send({
            action: ActionType.Set,
            parameter: "/parameter/by-id/" + pd.id,
            value: playdirection,
        });
    }
}
export const togglePlaydirection = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, l?: number | null, c?: number | null) => {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>action.options.layer)) - 1;
    let column = c ?? parseInt(await context.parseVariablesInString(<string>action.options.column)) - 1;
    let playdirectionfrom = action.options.playdirectionfrom;
    let playdirectionto = action.options.playdirectionto;
    if (layer === undefined || column === undefined || playdirectionfrom === undefined || typeof playdirectionfrom !== "number" || playdirectionto === undefined || typeof playdirectionto !== "number") {
        return;
    }
    let clip = instance.composition?.layers?.[layer]?.clips?.[column];
    if (clip === undefined) {
        return;
    }
    let pd = clip.transport?.controls?.playdirection;
    if (pd === undefined || pd.id === undefined) {
        return;
    }

    const current = pd.index;
    if (current === undefined) {
        return;
    }

    let next = current + 1;
    if (next > playdirectionto) {
        next = playdirectionfrom;
    } else if (next < playdirectionfrom && next != playdirectionto) {
        next = playdirectionfrom;
    }

    if (instance.resolume) {
        return instance.resolume.send({
            action: ActionType.Set,
            parameter: "/parameter/by-id/" + pd.id,
            value: next,
        });
    }
}

export const setResize = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, l?: number | null, c?: number | null) => {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>action.options.layer)) - 1;
    let column = c ?? parseInt(await context.parseVariablesInString(<string>action.options.column)) - 1;
    let resize = action.options.resize;
    if (layer === undefined || typeof layer !== "number" || column === undefined || typeof column !== "number" || resize === undefined || typeof resize !== "number") {
        return;
    }
    let clip = instance.composition?.layers?.[layer]?.clips?.[column];
    if (clip === undefined) {
        return;
    }
    let r = clip.video?.resize;
    if (r === undefined) {
        return;
    }
    if (instance.resolume) {
        return instance.resolume.send({
            action: ActionType.Set,
            parameter: "/parameter/by-id/" + r.id,
            value: resize,
        });
    }
}
export const toggleResize = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, l?: number | null, c?: number | null) => {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>action.options.layer)) - 1;
    let column = c ?? parseInt(await context.parseVariablesInString(<string>action.options.column)) - 1;
    let resizeTo = action.options.resizeTo;
    let resizeFrom = action.options.resizeFrom;
    if (layer === undefined || typeof layer !== "number" || column === undefined || typeof column !== "number" || resizeTo === undefined || typeof resizeTo !== "number" || resizeFrom === undefined || typeof resizeFrom !== "number") {
        return;
    }
    let clip = instance.composition?.layers?.[layer]?.clips?.[column];
    if (clip === undefined) {
        return;
    }
    let r = clip.video?.resize;
    if (r === undefined || r.id === undefined) {
        return;
    }

    const current = r.index;
    if (current === undefined) {
        return;
    }

    let next = current + 1;
    if (next > resizeTo) {
        next = resizeFrom;
    } else if (next < resizeFrom && next != resizeTo) {
        next = resizeFrom;
    }

    if (instance.resolume) {
        return instance.resolume.send({
            action: ActionType.Set,
            parameter: "/parameter/by-id/" + r.id,
            value: next,
        });
    }
}