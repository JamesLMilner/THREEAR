import { Object3D } from "three";

export class PatternMarker {
    public static markerCount = 0;
    public id: number;
    public size: number;
    public minConfidence: number;
    public patternUrl: string;
    public markerObject: Object3D;

    constructor(parameters: any) {
        if (!parameters.patternUrl) {
            throw Error("Pattern Marker requires a patternUrl to be passed");
        }

        if (parameters.markerObject === undefined) {
            throw Error("Pattern Marker requires a markerObject to be passed");
        }

        this.id = PatternMarker.markerCount++;
        this.size = parameters.size || 1;
        this.minConfidence = parameters.size || 0.6;
        this.patternUrl = parameters.patternUrl;
        this.markerObject = parameters.markerObject;

        this.markerObject.visible = false;
    }
}

export default PatternMarker;
