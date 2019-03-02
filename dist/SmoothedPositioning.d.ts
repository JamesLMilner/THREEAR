import BasePositioning from "./BasePositioning";
import { Object3D } from "three";
interface SmoothedControlsParameters {
	lerpPosition?: number;
	lerpQuaternion?: number;
	lerpScale?: number;
	lerpStepDelay?: number;
	minVisibleDelay?: number;
	minUnvisibleDelay?: number;
	[key: string]: number | undefined;
}
export declare class SmoothedControls extends BasePositioning {
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
	constructor(object3d: Object3D, parameters?: SmoothedControlsParameters);
	setParameters(parameters: SmoothedControlsParameters): void;
	update(targetObject3d: Object3D): void;
}
export default SmoothedControls;
