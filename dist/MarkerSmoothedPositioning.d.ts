import BasePositioning from "./BasePositioning";
import { Object3D } from "three";
interface MarkerSmoothedPositioningParameters {
	lerpPosition?: number;
	lerpQuaternion?: number;
	lerpScale?: number;
	lerpStepDelay?: number;
	minVisibleDelay?: number;
	minUnvisibleDelay?: number;
	[key: string]: number | undefined;
}
export declare class MarkerSmoothedPositioning extends BasePositioning {
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
	constructor(
		object3d: Object3D,
		parameters?: MarkerSmoothedPositioningParameters
	);
	setParameters(parameters: MarkerSmoothedPositioningParameters): void;
	update(targetObject3d: Object3D): void;
}
export default MarkerSmoothedPositioning;
