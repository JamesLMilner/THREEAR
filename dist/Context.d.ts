import * as THREE from "three";
import { MarkerPositioning } from "./MarkerPositioning";
import { WebGLRenderer } from "three";
export declare class Context extends THREE.EventDispatcher {
    initialized: boolean;
    private parameters;
    private arController;
    private _arMarkerControls;
    private _updatedAt;
    private _artoolkitProjectionAxisTransformMatrix;
    private contextError;
    constructor(parameters: any);
    setParameters(parameters: any): void;
    onResize(renderer: WebGLRenderer): void;
    start(): Promise<{}>;
    update(srcElement: any): boolean;
    addMarker(arMarkerControls: MarkerPositioning): void;
    removeMarker(arMarkerControls: MarkerPositioning): void;
    _initArtoolkit(onCompleted: () => any): this;
    getProjectionMatrix(): THREE.Matrix4;
    private _updateArtoolkit;
}
export default Context;
