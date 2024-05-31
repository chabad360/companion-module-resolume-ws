import ResolumeInstance from "../index";
import {
    CompanionActionContext,
    CompanionActionDefinitions,
    CompanionActionEvent
} from "@companion-module/base";
import {ActionType} from "resolume";
import {getCursorActions} from "./cursor";
import {getClipActions} from "./clip";

export const NumberOrVariable = "/^(\\d+|\\$\\(.+\\))/";

export function getActions(instance: ResolumeInstance): CompanionActionDefinitions {
    return {
        "set-param": {
            name: "Set Parameter",
            options: [
                {
                    type: "textinput",
                    label: "Parameter ID",
                    id: "parameter",
                    regex: NumberOrVariable,
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
            callback: (action, context) => setParam(action, context, instance),
        },
        ... getCursorActions(instance),
        ... getClipActions(instance),
    }
}

export const setParam = async (action: CompanionActionEvent, context: CompanionActionContext, instance: ResolumeInstance) => {
    let param = await context.parseVariablesInString(<string>action.options.parameter);
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
        return instance.log("warn", `Invalid value "${value}" for type ${action.options.type}`);
    }
    if (param === undefined || typeof param !== "string") {
        return instance.log("warn", `Invalid parameter: ${param}`);
    }

    if (instance.resolume) {
        return instance.resolume.send({
            action: ActionType.Set,
            parameter: "/parameter/by-id/" + param,
            value: value,
        });
    }
}

