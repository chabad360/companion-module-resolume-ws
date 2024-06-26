// import {WebSocket} from 'ws';
import ResolumeInstance from "./index";
import {WebSocketAPI} from "resolume";
import {Action} from "resolume/ws";
import {Composition} from "resolume/resolume";
import {InstanceStatus} from "@companion-module/base";

export class Resolume {
    ws?: WebSocketAPI;
    private readonly instance: ResolumeInstance;
    private host?: string;
    private port?: number;


    constructor(instance: ResolumeInstance) {
        this.instance  = instance;
        this.host = instance.config.host;
        this.port = instance.config.httpPort;

        this.init();
    }

    destroy() {
        this.ws?.destroy();
    }

    private init() {
        if (!this.host || !this.port) {
            this.instance.updateStatus(InstanceStatus.BadConfig);
            return this.instance.log('warn', 'No host or port set');
        }
        this.instance.updateStatus(InstanceStatus.Connecting);
        this.ws = new WebSocketAPI(this.host, this.port);
        this.ws.ws.onopen = () => {
            this.instance.log('info', 'Connected to Resolume');
            this.instance.connected = true;
            this.instance.updateStatus(InstanceStatus.Ok);
        };
        this.ws.ws.onclose = () => {
            this.instance.log('info', 'Disconnected from Resolume');
            this.instance.connected = false;
            this.instance.updateStatus(InstanceStatus.Disconnected);
        }
        this.ws.ws.onerror = (err) => {
            this.instance.log('error', `Error connecting to Resolume: ${JSON.stringify(err)}`);
            this.instance.updateStatus(InstanceStatus.ConnectionFailure);
            setTimeout(() => {
                this.init();
            }, 5000);
        }


        this.ws.on("composition", (data: Composition) => {
            this.instance.composition = data;
            this.instance.log('info', 'Composition updated');
            this.instance.updateInstance();
        });
        this.ws.onError((error) => {
            this.instance.log('warn', `Error from Resolume: ${JSON.stringify(error)}`);
        })
    }

    update() {
        if (this.host !== this.instance.config.host || this.port !== this.instance.config.httpPort) {
            this.host = this.instance.config.host;
            this.port = this.instance.config.httpPort;
            this.destroy();
            this.init();
        }
    }

    send(data: Action) {
        // this.instance.log('debug', 'Sending data to Resolume: ' + JSON.stringify(data));
        this.ws?.send(data);
    }
}