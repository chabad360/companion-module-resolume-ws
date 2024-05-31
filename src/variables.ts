import {CompanionVariableDefinition, CompanionVariableValue} from "@companion-module/base";
import ResolumeInstance from "./index";
import {difference, isEqual, throttle} from 'lodash';
import {MessageType, Parameter, ParameterMessage} from "resolume/ws";
import {Clip, Column, paramToString} from "resolume/resolume";
import {Composition, Layer} from "resolume/resolume";

interface InstanceVariableValue {
    [key: string]: string | number | boolean | Record<string, never> | undefined
}

interface ResolumeVariableDefinition extends CompanionVariableDefinition {
    parameter?: number,
    source?: Parameter,
    useFormat?: <T>(value: any) => T
    callback?: (value: any) => void
    ignore?: boolean
    initial?: CompanionVariableValue
}

type ResolumeVariableDefinitions = ResolumeVariableDefinition[];

class ManyToOneMap{
    private MasterMap: Map<string, Set<string>> = new Map();
    private SlaveMap: Map<string, string> = new Map();
    private variableMap: Map<string, ResolumeVariableDefinition> = new Map();

    public add(variable: ResolumeVariableDefinition): string | undefined {
        const master = variable.parameter?.toString() ?? variable.source?.id.toString() ?? variable.initial?.toString();
        const slave = variable.variableId;

        if (!master) {
            return;
        }

        if (!this.MasterMap.has(master)) {
            this.MasterMap.set(master, new Set());
        }

        let deleted: string | undefined;

        if (this.SlaveMap.has(slave)) {
            const oldMaster = this.SlaveMap.get(slave) as string;
            if (oldMaster === master) {
                return;
            }
            this.MasterMap.get(oldMaster)?.delete(slave);
            if (this.MasterMap.get(oldMaster)?.size === 0) {
                this.MasterMap.delete(oldMaster);
                deleted = oldMaster;
            }
        }
        // @ts-ignore
        this.MasterMap.get(master).add(slave);
        this.SlaveMap.set(slave, master);
        this.variableMap.set(slave, variable);

        return deleted;
    }

    public get(param: string): ResolumeVariableDefinition[] | undefined {
        const vars = this.MasterMap.get(param);
        if (!vars) {
            return;
        }

        const variables: ResolumeVariableDefinition[] = [];
        for (const variable of vars) {
            variables.push(this.variableMap.get(variable) as ResolumeVariableDefinition);
        }

        return variables;
    }

    public getVariable(variable: string): ResolumeVariableDefinition | undefined {
        return this.variableMap.get(variable);
    }

    public delete(variable: ResolumeVariableDefinition | string): string | undefined {
        const slave = typeof variable === "string" ? variable : variable.variableId;

        if (!slave) {
            return;
        }

        const master = this.SlaveMap.get(slave);
        if (!master) {
            return;
        }

        this.MasterMap.get(master)?.delete(slave);

        let deleted;
        if (this.MasterMap.get(master)?.size === 0) {
            this.MasterMap.delete(master);
            deleted = master;
        }
        this.SlaveMap.delete(slave);
        this.variableMap.delete(slave);
        return deleted;
    }

    public getAll(): ResolumeVariableDefinition[] {
        return [...this.variableMap.values()];
    }

    public getAllVariables(): string[] {
        return [...this.variableMap.keys()];
    }

    public getAllParameters(): string[] {
        return [...this.MasterMap.keys()];
    }
}

export class Variables {
    private readonly instance: ResolumeInstance;
    // private currentDefinitions: Set<ResolumeVariableDefinition> = new Set();
    private readonly definitionMap: ManyToOneMap = new ManyToOneMap();
    public currentVariables: any = {};


    constructor(instance: ResolumeInstance) {
        this.instance = instance;
    }

    private readonly onMessage = (data: ParameterMessage): void => {
        const variables = this.definitionMap.get(data.id.toString());
        if (!variables) {
            return;
        }

        if (data.valuetype === "ParamChoice") {
            for (const variable of variables) {
                this.newVariables[variable.variableId + "_text"] = data.value;
                this.newVariables[variable.variableId] = data.index;
                if (variable.callback) {
                    variable.callback(data.index);
                }
                if (variable.useFormat) {
                    this.newVariables[variable.variableId] = variable.useFormat(data.index);
                }
            }
        } else if (data.valuetype === "ParamRange") {
            for (const variable of variables) {
                this.newVariables[variable.variableId + "_min"] = data.min;
                this.newVariables[variable.variableId + "_max"] = data.max;
                this.newVariables[variable.variableId] = data.value;
                if (variable.callback) {
                    variable.callback(data.value);
                }
                if (variable.useFormat) {
                    this.newVariables[variable.variableId] = variable.useFormat(data.value);
                    this.newVariables[variable.variableId + "_min"] = variable.useFormat(data.min);
                    this.newVariables[variable.variableId + "_max"] = variable.useFormat(data.max);
                }
            }

        } else {
            for (const variable of variables) {
                this.newVariables[variable.variableId] = data.value;
                if (variable.callback) {
                    variable.callback(data.value);
                }
                if (variable.useFormat) {
                    this.newVariables[variable.variableId] = variable.useFormat(data.value);
                }

            }
        }

        for (const variable of variables) {
            if (variable.source) {
                variable.source.value = data.value;
                if ((data.valuetype === "ParamChoice" && variable.source.valuetype === "ParamChoice") ||
                    (data.valuetype === "ParamState" && variable.source.valuetype === "ParamState")
                ) {
                    variable.source.index = data.index;
                }
            }
        }

        this.Set();
    }

    private readonly set = (): void => {
        const variables = this.newVariables;
        this.newVariables = {};
        const changes: { [variableId: string]: CompanionVariableValue | undefined } = {};

        for (const name in variables) {
            // @ts-ignore
            if (this.currentVariables[name] !== variables[name]) changes[name] = variables[name];
        }

        this.currentVariables = {...this.currentVariables, ...changes};
        this.instance.setVariableValues(changes);
    }

    public readonly Set = throttle(this.set, 100)

    public newVariables: InstanceVariableValue = {}

    private readonly selectedClip = (layer: number, column: number): (value: boolean) => void  => {
        return (selected) => {
            const clip = this.instance.composition?.layers?.[layer]?.clips?.[column];
            if (!clip) {
                return;
            }
            if (!selected) {
                if (this.instance.selectedClipColumn === column && this.instance.selectedClipLayer === layer) {
                    this.instance.selectedClipColumn = null;
                    this.instance.selectedClipLayer = null;

                    this.newVariables[`selected_clip_layer`] = undefined;
                    this.newVariables[`selected_clip_column`] = undefined;
                    this.newVariables[`selected_clip_id`] = undefined;
                }
                return;
            }

            // @ts-ignore
            clip.selected.value = true;

            this.instance.selectedClipColumn = column;
            this.instance.selectedClipLayer = layer;

            this.newVariables[`selected_clip_layer`] = layer+1;
            this.newVariables[`selected_clip_column`] = column+1;
            this.newVariables[`selected_clip_id`] = clip.id;


            const newDefinitions: ResolumeVariableDefinition[] = []

            newDefinitions.push({ variableId: `selected_clip_id`, name: `Selected Clip ID`, parameter: clip.id as number, initial: clip.id });
            // @ts-ignore
            newDefinitions.push({ variableId: `selected_clip_name`, name: `Selected Clip Name`, source: clip.name });
            // @ts-ignore
            newDefinitions.push({ variableId: `selected_clip_connected`, name: `Selected Clip Connected`, source: clip.connected });
            // @ts-ignore
            newDefinitions.push({ variableId: `selected_clip_ignorecolumntrigger`, name: `Selected Clip Ignore Column Trigger`, source: clip.ignorecolumntrigger });
            if (clip.transport?.position !== undefined) {
                // @ts-ignore
                newDefinitions.push({ variableId: `selected_clip_transport_position`, name: `Selected Clip Play Head`, source: clip.transport.position });
                // @ts-ignore
                newDefinitions.push({ variableId: `selected_clip_transport_position_time`, name: `Selected Clip Play Head (time)`, source: clip.transport.position, useFormat: (value: number) => {return msToTime(value)}});
            } else {
                newDefinitions.push({ variableId: `selected_clip_transport_position`, name: `Selected Clip Play Head`});
                newDefinitions.push({ variableId: `selected_clip_transport_position_time`, name: `Selected Clip Play Head (time)`});
            }

            if (clip.transport?.controls) {
                // @ts-ignore
                newDefinitions.push({ variableId: `selected_clip_transport_playdirection`, name: `Selected Clip Play Direction`, source: clip.transport.controls.playdirection});
                // @ts-ignore
                newDefinitions.push({ variableId: `selected_clip_transport_playmode`, name: `Selected Clip Play Mode`, source: clip.transport.controls.playmode});
                // @ts-ignore
                newDefinitions.push({ variableId: `selected_clip_transport_playmodeaway`, name: `Selected Clip Play Mode Away`, source: clip.transport.controls.playmodeaway});
                if (clip.transport?.controls?.duration !== undefined) {
                    // @ts-ignore
                    newDefinitions.push({ variableId: `selected_clip_transport_duration`, name: `Selected Clip Duration`, source: clip.transport.controls.duration});
                    // @ts-ignore
                    newDefinitions.push({ variableId: `selected_clip_transport_duration_time`, name: `Selected Clip Duration (time)`, source: clip.transport.controls.duration, useFormat: (value: number) => {return msToTime(value*1000)}});
                } else {
                    newDefinitions.push({ variableId: `selected_clip_transport_duration`, name: `Selected Clip Duration`});
                    newDefinitions.push({ variableId: `selected_clip_transport_duration_time`, name: `Selected Clip Duration (time)`});
                }
            } else {
                newDefinitions.push({ variableId: `selected_clip_transport_playdirection`, name: `Selected Clip Play Direction`});
                newDefinitions.push({ variableId: `selected_clip_transport_playmode`, name: `Selected Clip Play Mode`});
                newDefinitions.push({ variableId: `selected_clip_transport_playmodeaway`, name: `Selected Clip Play Mode Away`});
                newDefinitions.push({ variableId: `selected_clip_transport_duration`, name: `Selected Clip Duration`});
                newDefinitions.push({ variableId: `selected_clip_transport_duration_time`, name: `Selected Clip Duration (time)`});
            }

            if (clip.video) {
                // @ts-ignore
                newDefinitions.push({ variableId: `selected_clip_video_width`, name: `Selected Clip Width`, source: clip.video.width })
                // @ts-ignore
                newDefinitions.push({ variableId: `selected_clip_video_height`, name: `Selected Clip Height`, source: clip.video.height })
                // @ts-ignore
                newDefinitions.push({ variableId: `selected_clip_video_opacity`, name: `Selected Clip Opacity`, source: clip.video.opacity })
                // @ts-ignore
                newDefinitions.push({ variableId: `selected_clip_video_blend_mode`, name: `Selected Clip Blend Mode`, source: clip.video.mixer["Blend Mode"] })
                // @ts-ignore
                newDefinitions.push({ variableId: `selected_clip_video_resize`, name: `Selected Clip Resize`, source: clip.video.resize })
                // @ts-ignore
                newDefinitions.push({ variableId: `selected_clip_video_description`, name: `Selected Clip Description`, initial: clip.video.description })
                // @ts-ignore
                newDefinitions.push({ variableId: `selected_clip_video_fileinfo`, name: `Selected Clip File Info`, initial: JSON.stringify(clip.video.fileinfo) })
            } else {
                newDefinitions.push({ variableId: `selected_clip_video_width`, name: `Selected Clip Width`})
                newDefinitions.push({ variableId: `selected_clip_video_height`, name: `Selected Clip Height`})
                newDefinitions.push({ variableId: `selected_clip_video_opacity`, name: `Selected Clip Opacity`})
                newDefinitions.push({ variableId: `selected_clip_video_blend_mode`, name: `Selected Clip Blend Mode`})
                newDefinitions.push({ variableId: `selected_clip_video_resize`, name: `Selected Clip Resize`})
                newDefinitions.push({ variableId: `selected_clip_video_description`, name: `Selected Clip Description`})
                newDefinitions.push({ variableId: `selected_clip_video_fileinfo`, name: `Selected Clip File Info`})
            }
            if (clip.audio) {
                // @ts-ignore
                newDefinitions.push({ variableId: `selected_clip_audio_volume`, name: `Selected Clip Audio Volume`, source: clip.audio.volume })
                // @ts-ignore
                newDefinitions.push({ variableId: `selected_clip_audio_pan`, name: `Selected Clip Audio Pan`, source: clip.audio.pan })
                // @ts-ignore
                newDefinitions.push({ variableId: `selected_clip_audio_description`, name: `Selected Clip Audio Description`, initial: clip.audio.description })
                // @ts-ignore
                newDefinitions.push({ variableId: `selected_clip_audio_fileinfo`, name: `Selected Clip Audio File Info`, initial: JSON.stringify(clip.audio.fileinfo) })
            } else {
                newDefinitions.push({ variableId: `selected_clip_audio_volume`, name: `Selected Clip Audio Volume`})
                newDefinitions.push({ variableId: `selected_clip_audio_pan`, name: `Selected Clip Audio Pan`})
                newDefinitions.push({ variableId: `selected_clip_audio_description`, name: `Selected Clip Audio Description`})
                newDefinitions.push({ variableId: `selected_clip_audio_fileinfo`, name: `Selected Clip Audio File Info`})
            }

            this.refreshDefinitions(newDefinitions, true);
        }
    }

    private readonly selectedLayer = (layerIdx: number): (value: boolean) => void  => {
        return (selected) => {
            const layer = this.instance.composition?.layers?.[layerIdx];
            if (!layer) {
                return;
            }
            if (!selected) {
                if (this.instance.selectedLayer === layerIdx) {
                    this.instance.selectedLayer = null;

                    this.newVariables[`selected_layer`] = undefined;
                    this.newVariables[`selected_layer_id`] = undefined;
                }
                return;
            }

            // @ts-ignore
            layer.selected.value = true;

            this.instance.selectedLayer = layerIdx;
            this.newVariables[`selected_layer`] = layerIdx+1;
            this.newVariables[`selected_layer_id`] = layer.id;
        }
    }

    private readonly connectedColumn = (columnIdx: number): (value: boolean) => void  => {
        return (connected) => {
            const column = this.instance.composition?.columns?.[columnIdx];
            if (!column) {
                return;
            }

            if (!connected) {
                if (this.instance.connectedColumn === columnIdx) {
                    this.instance.connectedColumn = null;

                    this.newVariables[`connected_column`] = undefined;
                    this.newVariables[`connected_column_id`] = undefined;
                }
                return;
            }

            // @ts-ignore
            column.connected.value = true;

            this.instance.connectedColumn = columnIdx
            this.newVariables[`connected_column`] = columnIdx+1;
            this.newVariables[`connected_column_id`] = column.id;
        }
    }

    public readonly updateDefinitions = async (): Promise<void> => {
        if (!this.instance.connected) return
        const composition = this.instance.composition as Composition
        // @ts-ignore
        const variables: ResolumeVariableDefinitions = [
            {variableId: 'selected_clip_column', name: 'Selected Clip Column'},
            {variableId: 'selected_clip_layer', name: 'Selected Clip Layer'},
            {variableId: 'selected_layer', name: 'Selected Layer'},
            {variableId: 'selected_layer_id', name: 'Selected Layer ID'},
            {variableId: 'connected_column', name: 'Connected Column'},
            {variableId: 'connected_column_id', name: 'Connected Column ID'},
            // @ts-ignore
            { variableId: 'composition_name', name: 'Composition Name', source: composition.name },
            // @ts-ignore
            { variableId: 'composition_master', name: 'Composition Master', source: composition.master },
            // @ts-ignore
            {variableId: 'composition_speed', name: 'Composition Speed', source: composition.speed },
            // @ts-ignore
            { variableId: 'composition_audio_volume', name: 'Composition Audio Volume', source: composition.audio.volume },
            // @ts-ignore
            { variableId: 'composition_audio_pan', name: 'Composition Audio Pan', source: composition.audio.pan },
            // @ts-ignore
            { variableId: 'composition_video_opacity', name: 'Composition Opacity', source: composition.video.opacity },
        ];

        // Layers
        if (composition.layers) {
            for (const [index, layer] of composition.layers?.entries()) {
                this.updateLayerVariableDefinitions(layer, index, variables);

                // Clips
                if (layer.clips) {
                    for (const [clipIndex, clip] of layer.clips.entries()) {
                        this.updateClipVariableDefinitions(clip, clipIndex, index, variables);
                    }
                }
            }
        }

        // Columns
        if (composition.columns) {
            for (const [index, column] of composition.columns.entries()) {
                this.updateColumnVariableDefinitions(column, index, variables);
            }
        }

        this.refreshDefinitions(variables);
    }

    updateLayerVariableDefinitions = (layer: Layer, index: number, variables: ResolumeVariableDefinitions): void => {
        const idxStr = (index + 1).toString();
        variables.push({ variableId: `layer_${idxStr}_id`, name: `Layer ${idxStr} ID`, initial: layer.id })
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_name`, name: `Layer ${idxStr} Name`, source: layer.name })
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_selected`, name: `Layer ${idxStr} Selected`, source: layer.selected, callback: this.selectedLayer(index) })
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_bypassed`, name: `Layer ${idxStr} Bypassed`, source: layer.bypassed })
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_solo`, name: `Layer ${idxStr} Solo`, source: layer.solo })
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_master`, name: `Layer ${idxStr} Master`, source: layer.master })
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_ignorecolumntrigger`, name: `Layer ${idxStr} Ignore Column Trigger`, source: layer.ignorecolumntrigger })
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_audio_volume`, name: `Layer ${idxStr} Audio Volume`, source: layer.audio.volume })
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_audio_pan`, name: `Layer ${idxStr} Audio Pan`, source: layer.audio.pan })
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_video_blend_mode`, name: `Layer ${idxStr} Blend Mode`, source: layer.video.mixer["Blend Mode"]})
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_video_opacity`, name: `Layer ${idxStr} Opacity`, source: layer.video.opacity })
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_video_autosize`, name: `Layer ${idxStr} Autosize`, source: layer.video.autosize})
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_transition_duration`, name: `Layer ${idxStr} Transition Duration`, source: layer.transition.duration })
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_transition_blend_mode`, name: `Layer ${idxStr} Transition Blend Mode`, source: layer.transition.blend_mode})
    }

    updateClipVariableDefinitions = (clip: Clip, clipIndex: number, index: number, variables: ResolumeVariableDefinitions): void => {
        const idxStr = (index + 1).toString();
        const clipIdxStr = (clipIndex + 1).toString();
        if (clip.connected?.index === 0) {
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_selected`, name: `Layer ${idxStr} Clip ${clipIdxStr} Selected`, parameter: clip.selected.id as number, callback: this.selectedClip(index, clipIndex), ignore: true });
            return;
        }
        variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_id`, name: `Layer ${idxStr} Clip ${clipIdxStr} ID`, initial: clip.id })
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_name`, name: `Layer ${idxStr} Clip ${clipIdxStr} Name`, source: clip.name })
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_selected`, name: `Layer ${idxStr} Clip ${clipIdxStr} Selected`, source: clip.selected, callback: this.selectedClip(index, clipIndex) })
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_connected`, name: `Layer ${idxStr} Clip ${clipIdxStr} Connected`, source: clip.connected })
        // @ts-ignore
        variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_ignorecolumntrigger`, name: `Layer ${idxStr} Clip ${clipIdxStr} Ignore Column Trigger`, source: clip.ignorecolumntrigger})
        if (clip.transport?.position) {
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_transport_position`, name: `Layer ${idxStr} Clip ${clipIdxStr} Play Head`, source: clip.transport.position })
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_transport_position_time`, name: `Layer ${idxStr} Clip ${clipIdxStr} Play Head (time)`, source: clip.transport.position, useFormat: (value: number) => {return msToTime(value)}})
        }
        if (clip.transport?.controls) {
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_transport_playdirection`, name: `Layer ${idxStr} Clip ${clipIdxStr} Play Direction`, source: clip.transport.controls.playdirection })
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_transport_playmode`, name: `Layer ${idxStr} Clip ${clipIdxStr} Play Mode`, source: clip.transport.controls.playmode })
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_transport_playmodeaway`, name: `Layer ${idxStr} Clip ${clipIdxStr} Play Mode Away`, source: clip.transport.controls.playmodeaway })
            if (clip.transport?.controls?.duration) {
                // @ts-ignore
                variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_transport_duration`, name: `Layer ${idxStr} Clip ${clipIdxStr} Duration`, source: clip.transport.controls.duration })
                // @ts-ignore
                variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_transport_duration_time`, name: `Layer ${idxStr} Clip ${clipIdxStr} Duration (time)`, source: clip.transport.controls.duration, useFormat: (value: number) => {return msToTime(value*1000)}})
            }
        }
        if (clip.video) {
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_video_width`, name: `Layer ${idxStr} Clip ${clipIdxStr} Width`, source: clip.video.width })
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_video_height`, name: `Layer ${idxStr} Clip ${clipIdxStr} Height`, source: clip.video.height })
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_video_opacity`, name: `Layer ${idxStr} Clip ${clipIdxStr} Opacity`, source: clip.video.opacity })
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_video_blend_mode`, name: `Layer ${idxStr} Clip ${clipIdxStr} Blend Mode`, source: clip.video.mixer["Blend Mode"] })
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_video_resize`, name: `Layer ${idxStr} Clip ${clipIdxStr} Resize`, source: clip.video.resize })
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_video_description`, name: `Layer ${idxStr} Clip ${clipIdxStr} Description`, initial: clip.video.description })
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_video_fileinfo`, name: `Layer ${idxStr} Clip ${clipIdxStr} File Info`, initial: JSON.stringify(clip.video.fileinfo) })
        }
        if (clip.audio) {
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_audio_volume`, name: `Layer ${idxStr} Clip ${clipIdxStr} Audio Volume`, source: clip.audio.volume })
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_audio_pan`, name: `Layer ${idxStr} Clip ${clipIdxStr} Audio Pan`, source: clip.audio.pan })
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_audio_description`, name: `Layer ${idxStr} Clip ${clipIdxStr} Audio Description`, initial: clip.audio.description })
            // @ts-ignore
            variables.push({ variableId: `layer_${idxStr}_clip_${clipIdxStr}_audio_fileinfo`, name: `Layer ${idxStr} Clip ${clipIdxStr} Audio File Info`, initial: JSON.stringify(clip.audio.fileinfo) })
        }
    }

    updateColumnVariableDefinitions = (column: Column, index: number, variables: ResolumeVariableDefinitions): void => {
        const idxStr = (index + 1).toString();
        variables.push({ variableId: `column_${idxStr}_id`, name: `Column ${idxStr} ID`, initial: column.id })
        // @ts-ignore
        variables.push({ variableId: `column_${idxStr}_name`, name: `Column ${idxStr} Name`, source: column.name })
        // @ts-ignore
        variables.push({ variableId: `column_${idxStr}_connected`, name: `Column ${idxStr} Connected`, source: column.connected, callback: this.connectedColumn(index) })
    }

    refreshDefinitions(variables: ResolumeVariableDefinition[], partial?: boolean): void {
        const expandedVariables = variables;
        expandedVariables.forEach((variable) => {
            if (variable.source) {
                if (variable.source.valuetype === "ParamChoice") {
                    expandedVariables.push({variableId: variable.variableId + "_text", name: variable.name + " (text)"})
                } else if (variable.source.valuetype === "ParamRange") {
                    expandedVariables.push({variableId: variable.variableId + "_min", name: variable.name + " (min)"})
                    expandedVariables.push({variableId: variable.variableId + "_max", name: variable.name + " (max)"})
                }
            }
        })

        const oldVariables = this.definitionMap.getAll()
        if (!isEqual(expandedVariables, oldVariables)) {
            const newVariables = difference(expandedVariables, oldVariables);
            const removedVariables = difference(this.definitionMap.getAllVariables(), expandedVariables.map((variable) => variable.variableId));
            if (!partial) {
                for (const variable of removedVariables) {
                    const v = this.definitionMap.getVariable(variable);
                    if (v !== undefined) {
                        if (v.source) {
                            if (v.source.valuetype === "ParamChoice") {
                                this.newVariables[variable + "_text"] = undefined;
                                this.definitionMap.delete(variable + "_text");
                            }
                            if (v.source.valuetype === "ParamRange") {
                                this.newVariables[variable + "_min"] = undefined;
                                this.newVariables[variable + "_max"] = undefined;

                                this.definitionMap.delete(variable + "_min");
                                this.definitionMap.delete(variable + "_max");
                            }
                        }
                    }

                    const deleted =  this.definitionMap.delete(variable);
                    if (deleted) {
                        // @ts-ignore
                        this.instance.resolume?.ws?.unsubscribe(paramToString(deleted));
                    }
                }
            }

            for (const variable of newVariables) {
                if (variable.source || variable.parameter) {
                    const deleted = this.definitionMap.add(variable);
                    if (deleted) {
                        this.instance.resolume?.ws?.unsubscribe(paramToString(deleted));
                    }

                    const param = paramToString(variable.parameter ?? variable.source?.id ?? 0);
                    if (param) {
                        this.instance.resolume?.ws?.subscribe(param);
                    }

                    if (variable.source) {
                        const message: ParameterMessage = {
                            ...variable.source,
                            type: MessageType.ParameterUpdate,
                            path: "/parameters/by-id/" + variable.source.id.toString(),
                        }
                        this.onMessage(message);
                    }
                } else {
                    if (!variable.initial) {
                        variable.parameter = 0;
                    }
                    this.definitionMap.add(variable);
                }
            }

            for (const variable of this.definitionMap.getAll()) {
                if (newVariables.findIndex((v) => variable.variableId.includes(v.variableId)) > -1) {
                    if (variable.parameter === 0 || variable.parameter === undefined) {
                        this.newVariables[variable.variableId] = variable.initial ?? undefined;
                    }
                }
            }

            this.Set();

            this.instance.resolume?.ws?.onAll(this.onMessage);
            this.instance.setVariableDefinitions(this.definitionMap.getAll().filter((variable) => (variable.parameter !== undefined || variable.source !== undefined || variable.initial !== undefined) && !variable.ignore));
        }
    }
}

function msToTime(ms: number): string {
    const milliseconds = Math.floor((ms % 1000) / 10);
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}