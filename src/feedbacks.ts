import ResolumeInstance from "./index";
import {
    CompanionAdvancedFeedbackResult,
    CompanionFeedbackAdvancedEvent,
    CompanionFeedbackDefinitions
} from "@companion-module/base";
import {NumberOrVariable} from "./actions/actions";
import {CompanionCommonCallbackContext} from "@companion-module/base/dist/module-api/common";
import Jimp from "jimp";

export function getFeedbacks(instance: ResolumeInstance): CompanionFeedbackDefinitions {
    return {
        "clip-thumbnail": {
            type: "advanced",
            name: "Clip Thumbnail",
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
            ],
            callback: (feedback, context) => feedback.options.selected ?
                getThumbnail(instance, feedback, context, instance.selectedClipLayer, instance.selectedClipColumn) :
                getThumbnail(instance, feedback, context),
            subscribe: (feedback, _) => {
                if (feedback.options.selected) {
                    instance.log('info', `Subscribing to selected clip thumbnail feedback ${feedback.id}`);
                    instance.selectedClipFeedbacks.push(feedback.id);
                }
            },
            unsubscribe: (feedback, _) => {
                instance.selectedClipFeedbacks = instance.selectedClipFeedbacks.filter((id) => id !== feedback.id);
            }
        },
        "connected-clip-thumbnail": {
            type: "advanced",
            name: "Connected Clip Thumbnail",
            options: [
                {
                    type: "checkbox",
                    label: "Selected Layer",
                    id: "selected",
                    default: false,
                },
                {
                    type: "textinput",
                    label: "Layer",
                    id: "layer",
                    regex: NumberOrVariable,
                    useVariables: true,
                    isVisible: (options) => !options.selected,
                },
            ],
            callback: (feedback, context) => feedback.options.selected ?
                getThumbnail(instance, feedback, context, instance.selectedLayer, instance.connectedClips[instance.selectedLayer]) :
                getThumbnail(instance, feedback, context),
            subscribe: (feedback, _) => {
                instance.connectedClipFeedbacks.push(feedback.id);
                if (feedback.options.selected) {
                    instance.selectedLayerFeedbacks.push(feedback.id);
                }
            },
            unsubscribe: (feedback, _) => {
                instance.connectedClipFeedbacks = instance.connectedClipFeedbacks.filter((id) => id !== feedback.id);
                instance.selectedLayerFeedbacks = instance.selectedLayerFeedbacks.filter((id) => id !== feedback.id);
            }
        }
    }
}

export async function getThumbnail(instance: ResolumeInstance, feedback: CompanionFeedbackAdvancedEvent, context: CompanionCommonCallbackContext, l?: number, c?: number | null): Promise<CompanionAdvancedFeedbackResult> {
    let layer = l ?? parseInt(await context.parseVariablesInString(<string>feedback.options.layer))-1;
    let column = c ?? parseInt(await context.parseVariablesInString(<string>feedback.options.column))-1;
    instance.log('info', `Getting thumbnail for layer ${layer} column ${column}`);
    if (layer === null && column === null) {
        return {};
    }
    if (column === null) {
        const connectedClip = instance.connectedClips[layer];
        if (connectedClip === null) {
            return {};
        }
        column = connectedClip;
    }
    instance.log('info', `Getting thumbnail for layer ${layer} column ${column}`);

    const clip = instance.composition?.layers?.[layer]?.clips?.[column];
    if (!clip) {
        return {};
    }

    // @ts-ignore - thumbnail.path is not in the schema yet.
    const url = clip.thumbnail.path;
    if (!url) {
        return {};
    }

    const img = await Jimp.read(`http://${instance.config.host}:${instance.config.httpPort}${url}`)
        .then((img) => img.scaleToFit(feedback.image?.width ?? 72, feedback.image?.height ?? 72))
        .catch((err) => {
            instance.log('error', `Error fetching thumbnail: ${JSON.stringify(err)}`);
            return null;
        })
    if (!img) {
        return {};
    }

    return {
        png64: await img.getBase64Async(Jimp.MIME_PNG),
    }
}