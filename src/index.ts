import {InstanceBase, runEntrypoint, SomeCompanionConfigField} from "@companion-module/base";
import {Config, getConfigFields} from "./config";
import {getActions} from "./actions";
import {Resolume} from "./resolume";
import {Composition} from "resolume/ws";
import {Variables} from "./variables";

class ResolumeInstance extends InstanceBase<Config> {
    constructor(internal: unknown) {
        super(internal);
    }
    public config: Config = {
        label: '',
        host: '',
        httpPort: 7003,
    };
    public connected = false;
    public resolume: Resolume | null = null;

    public composition: Composition | null = null;
    public selectedClipColumn: number | null = null;
    public selectedClipLayer: number | null = null;
    public selectedLayer: number | null = null;

    public variables: Variables | null = null;

    public async init(config:Config): Promise<void> {
        await this.configUpdated(config);
        this.variables = new Variables(this);

        this.resolume = new Resolume(this);
    }

    public async configUpdated(config:Config): Promise<void> {
        this.config = config;

        this.resolume?.update();
        this.updateInstance();
    }

    public getConfigFields(): SomeCompanionConfigField[] {
        return getConfigFields()
    }

    public async destroy(): Promise<void> {
        this.resolume?.destroy();
        this.connected = false;
    }

    public updateInstance() {
        this.setActionDefinitions(getActions(this));
        this.variables?.updateDefinitions();
    }
}

export = ResolumeInstance

runEntrypoint(ResolumeInstance, [])