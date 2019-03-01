import { Object3D } from "three";
export declare class PatternMarker {
    static markerCount: number;
    id: number;
    size: number;
    minConfidence: number;
    patternUrl: string;
    markerObject: Object3D;
    constructor(parameters: any);
}
export default PatternMarker;
