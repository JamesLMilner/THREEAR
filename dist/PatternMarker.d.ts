import { Object3D } from "three";
import { BaseMarker } from "./BaseMarker";
/**
 * PatternMarker takes a given image (as a URL) and use this as the pattern to detect to place
 * a given marker from three.js, in this case an given Object3D
 * @param parameters parameters for determining things the pattern URL and minimum confidence
 */
interface PatternMarkerParameters {
	patternUrl: string;
	markerObject: Object3D;
	size?: number;
	minConfidence?: number;
}
export declare class PatternMarker extends BaseMarker {
	static count: number;
	patternUrl: string;
	markerObject: Object3D;
	constructor(parameters: PatternMarkerParameters);
}
export default PatternMarker;
