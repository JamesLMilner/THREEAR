import * as THREE from "three";
export declare class ARContext extends THREE.EventDispatcher {
    private parameters;
    private arController;
    private _arMarkerControls;
    private _updatedAt;
    private initialized;
    private _artoolkitProjectionAxisTransformMatrix;
    constructor(parameters: any);
    setParameters(parameters: any): void;
    init(onCompleted: () => void): void;
    update(srcElement: any): boolean;
    addMarker(arMarkerControls: any): void;
    removeMarker(arMarkerControls: any): void;
    _initArtoolkit(onCompleted: any): this;
    getProjectionMatrix(srcElement: any): THREE.Matrix4;
    private _updateArtoolkit;
}
export default ARContext;
