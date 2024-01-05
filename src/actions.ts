import ResolumeInstance from "./index";
import {CompanionActionDefinitions, Regex} from "@companion-module/base";
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
            },
            {
                type: "dropdown",
                label: "Parameter Type",
                id: "type",
                default: "float",
                choices: [
                    {id: "float", label: "Float"},
                    {id: "int", label: "Int"},
                    {id: "bool", label: "Bool"},
                    {id: "string", label: "String"},
                ]
            },
            {
                type: "textinput",
                label: "Value",
                id: "value",
            }
        ],
        callback: async (action) => {
            let param = action.options.parameter;
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
    }
}
}