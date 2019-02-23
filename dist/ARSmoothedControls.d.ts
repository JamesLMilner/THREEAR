import ARBaseControls from "./ARBaseControls";
import { Object3D } from "three";
interface ARSmoothedControlsParameters {
    lerpPosition?: number;
    lerpQuaternion?: number;
    lerpScale?: number;
    lerpStepDelay?: number;
    minVisibleDelay?: number;
    minUnvisibleDelay?: number;
    [key: string]: number | undefined;
}
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
    constructor(object3d: Object3D, parameters?: ARSmoothedControlsParameters);
    setParameters(parameters: ARSmoothedControlsParameters): void;
    update(targetObject3d: Object3D): void;
}
export default ARSmoothedControls;
