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
            callback: (action, context) => setPlaymodeaway(action, context, instance)
        },

        "set-selected-playmodeaway": {
            name: "Set Selected Clip Start Mode",
            options: [
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
            callback: (action, context) => setPlaymodeaway(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn)
        },
        "set-playmode": {
            name: "Set Clip End Mode",
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
            callback: (action, context) => setPlaymode(action, context, instance)
        },
        "set-selected-playmode": {
            name: "Set Selected Clip End Mode",
            options: [
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
            callback: (action, context) => setPlaymode(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn)
        },
        "set-playdirection": {
            name: "Set Clip Play Mode",
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
            callback: (action, context) => setPlaydirection(action, context, instance)
        },
        "set-selected-playdirection": {
            name: "Set Selected Clip Play Mode",
            options: [
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
            callback: (action, context) => setPlaydirection(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn)
        },
        "toggle-playdirection": {
            name: "Toggle Between Clip Play Modes",
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
            callback: (action, context) => togglePlaydirection(action, context, instance)
        },
        "toggle-selected-playdirection": {
            name: "Toggle Between Selected Clip Play Modes",
            options: [
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
            callback: (action, context) => togglePlaydirection(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn)
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