import {SomeCompanionConfigField} from "@companion-module/base";

export interface Config {
    label: string
    host: string
    httpPort: number
}

export const getConfigFields = (): SomeCompanionConfigField[] => {
    return [
        {
            type: 'textinput',
            id: 'host',
            label: 'Target host',
            width: 6,
            default: '127.0.0.1',
        },
        {
            type: 'number',
            id: 'httpPort',
            label: 'HTTP Server Port',
            width: 6,
            default: 7003,
            min: 1,
            max: 65535,
            step: 1,
        },
    ]
    }