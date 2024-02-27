import ResolumeInstance from "./index";
import {CompanionActionContext, CompanionActionDefinitions, CompanionActionEvent, Regex} from "@companion-module/base";
import {ActionType} from "resolume";

export function getActions(instance: ResolumeInstance): CompanionActionDefinitions {
    return {
        "set-param": {
            name: "Set Parameter",
            options: [
                {
                    type: "textinput",
                    label: "Parameter ID",
                    id: "parameter",
                    regex: Regex.NUMBER,
                    useVariables: true,
                },
                {
                    type: "dropdown",
                    label: "Parameter Type",
                    id: "type",
                    default: "float",
                    choices: [
                        {id: "float", label: "Float"},
                        {id: "int", label: "Integer"},
                        {id: "bool", label: "Boolean"},
                        {id: "string", label: "String"},
                    ]
                },
                {
                    type: "textinput",
                    label: "Value",
                    id: "value",
                    useVariables: true,
                }
            ],
            callback: async (action, context) => {
                let param = context.parseVariablesInString(<string>action.options.parameter);
                let value: any = action.options.value;
                switch (action.options.type) {
                    case "float":
                        value = parseFloat(value);
                        break;
                    case "int":
                        value = parseInt(value);
                        break;
                    case "bool":
                        value = value === "true";
                        break;
                }
                if (isNaN(value)) {
                    return instance.log("warn", "Invalid value");
                }
                if (param === undefined || typeof param !== "string") {
                    return instance.log("warn", "Invalid parameter");
                }

                if (instance.resolume) {
                    return instance.resolume.send({
                        action: ActionType.Set,
                        parameter: "/parameter/by-id/" + param,
                        value: value,
                    });
                }
            }
        },
        "set-playmodeaway": {
            name: "Set Clip Start Mode",
            options: [
                {
                    type: "textinput",
                    label: "Clip Layer",
                    id: "layer",
                    regex: "/^(\\d+|\\$\\(.+\\))/",
                    useVariables: true,
                },
                {
                    type: "textinput",
                    label: "Column",
                    id: "column",
                    regex: "/^(\\d+|\\$\\(.+\\))/",
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
                    regex: "/^(\\d+|\\$\\(.+\\))/",
                    useVariables: true,
                },
                {
                    type: "textinput",
                    label: "Column",
                    id: "column",
                    regex: "/^(\\d+|\\$\\(.+\\))/",
                    useVariables: true,
                },
                {
                    type: "dropdown",
                    label: "Loop Mode",
                    id: "playmode",
                    default: 0,
                    choices: [
                        {id: 0, label: "Loop"},
                        {id: 1, label: "Clear"},
                        {id: 2, label: "Hold"},
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
                        {id: 3, label: "Clear"},
                        {id: 4, label: "Hold"},
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
                    regex: "/^(\\d+|\\$\\(.+\\))/",
                    useVariables: true,
                },
                {
                    type: "textinput",
                    label: "Column",
                    id: "column",
                    regex: "/^(\\d+|\\$\\(.+\\))/",
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
                    regex: "/^(\\d+|\\$\\(.+\\))/",
                    useVariables: true,
                },
                {
                    type: "textinput",
                    label: "Column",
                    id: "column",
                    regex: "/^(\\d+|\\$\\(.+\\))/",
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

        "clear-layer": {
            name: "Clear Layer",
            options: [
                {
                    type: "textinput",
                    label: "Layer",
                    id: "layer",
                    regex: "/^(\\d+|\\$\\(.+\\))/",
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
        "clear-selected-clip": {
            name: "Clear Selected Clip (if playing)",
            options: [],
            callback: (action, context) => clearClip(action, context, instance, instance.selectedClipLayer, instance.selectedClipColumn)
        }
    }
}

const setPlaymodeaway = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, l?: number|null, c?: number|null) => {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>action.options.layer));
    let column = c ?? parseInt(await context.parseVariablesInString(<string>action.options.column));
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

const setPlaymode = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, l?: number|null, c?: number|null) => {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>action.options.layer));
    let column = c ?? parseInt(await context.parseVariablesInString(<string>action.options.column));
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

const setPlaydirection = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, l?: number|null, c?: number|null) => {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>action.options.layer));
    let column = c ?? parseInt(await context.parseVariablesInString(<string>action.options.column));
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

const togglePlaydirection = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, l?: number|null, c?: number|null) => {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>action.options.layer));
    let column = c ?? parseInt(await context.parseVariablesInString(<string>action.options.column));
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

const clearLayer = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, l?: number|null) => {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>action.options.layer));
    if (layer === undefined || typeof layer !== "number") {
        return;
    }

    const lay = instance.composition?.layers?.[layer];
    if (lay === undefined) {
        return;
    }

    if (instance.resolume) {
        return instance.resolume.send({
            action: ActionType.Trigger,
            parameter: "/composition/layers/by-id/" + lay.id + "/clear",
        });
    }
}

const clearClip = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance, l?: number|null, c?: number|null) => {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>action.options.layer));
    let column = c ?? parseInt(await context.parseVariablesInString(<string>action.options.column));
    if (layer === undefined || typeof layer !== "number" || column === undefined || typeof column !== "number") {
        return;
    }

    const clip = instance.composition?.layers?.[layer]?.clips?.[column];
    if (clip === undefined) {
        return;
    }

    if (clip.connected?.index === undefined || clip.connected.index < 4) {
        return;
    }

    // const lay = instance.composition?.layers?.[layer];

    if (instance.resolume) {
        return instance.resolume.send({
            action: ActionType.Post,
            path: "/composition/clips/selected/clear",
            id: "testing"
        });
        // return instance.resolume.send({
        //     action: ActionType.Trigger,
        //     // @ts-ignore
        //     parameter: "/composition/layers/by-id/"+lay.id+"/clear",
        // });
    }
}