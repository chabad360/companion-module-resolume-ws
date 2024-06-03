import {InstanceBase, runEntrypoint, SomeCompanionConfigField} from "@companion-module/base";
import {Config, getConfigFields} from "./config";
import {getActions} from "./actions/actions";
import {Resolume} from "./resolume";
import {Composition} from "resolume/resolume";
import {Variables} from "./variables";
import {getFeedbacks} from "./feedbacks";

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

    public selectedClipColumn: number = -1;
    public selectedClipLayer: number = -1;
    public selectedLayer: number = -1;

    public connectedColumn: number = -1;
    public connectedClips: (number|null)[] = [];

    public variables: Variables | null = null;

    public selectedClipFeedbacks: string[] = [];
    public selectedLayerFeedbacks: string[] = [];
    public connectedClipFeedbacks: string[] = [];

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
        this.connectedClips.fill(null, 0, this.composition?.layers?.length ?? 0);
        this.setActionDefinitions(getActions(this));
        this.setFeedbackDefinitions(getFeedbacks(this));
        this.variables?.updateDefinitions();
    }
}

export = ResolumeInstance

runEntrypoint(ResolumeInstance, [])

/*
That's a lot of data, I think even with big vMix projects the APi only gives about <200 KB.

Some of the things I've worked with when trying to optimize the vMix module is that processing the data
(in my case, parsing the XML from vMix into JSON, and structuring it how I need), takes a negligible amount of time.
The slowest parts will be if you update a large number of PNG's concurrently.
For example the vMix module supports a feedback for a volume meter for each input and bus.
If you have a hundred buttons each with that feedback, updating 10 times per second (the limit vMix modules poll the API),
it can be high enough CPU usage that older devices, and things like raspberry pi's will struggle with,
so you'll want to think about some sort of config option to limit how fast you're polling the API (or updating feedbacks/variables).
10x per second feels close to 'real time' so any faster than that may be wasted.

Additionally, another major CPU bottleneck is updating a large number of variables at once.
In vMix I have variables to reference each property of an input, and that is duplicated 3 times because you can use the
inputs name, number, or GUID, in the variable. Which is why in the latest versions of the module I have config options
to let the user select what they want to use, and minimize unused variables.

Finally, If you plan to have a large number of variables, the definitions can crash the web interface because when
 it pops up the autocomplete there are so many things it'll run out of RAM on the browser tab.
 So, for some variables you may not want a definition, for example in my Google Sheets module every single cell
 has a variable so it can be used on a button, in another action, etc... but there are hundreds of thousands of cells
 potentially, so I only have the definition for the cell A1 in each sheet such as $(sheet:spreadsheet1!a1), $(sheet:spreadsheet2!a1)  etc...
  and the user can just infer how to get the variable G33 despite it not auto-completing
 */