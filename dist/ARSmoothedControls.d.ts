import ARBaseControls from "./ARBaseControls";
export declare class ARSmoothedControls extends ARBaseControls {
    private parameters;
    private _lastLerpStepAt;
    private _visibleStartedAt;
    private _unvisibleStartedAt;
    /**
     * - lerp position/quaternino/scale
     * - minDelayDetected
     * - minDelayUndetected
     * @param {[type]} object3d   [description]
     * @param {[type]} parameters [description]
     */
    constructor(object3d: any, parameters: any);
    setParameters(parameters: any): void;
    update(targetObject3d: any): void;
}
export default ARSmoothedControls;
