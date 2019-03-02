import * as THREE from "three";
import { EventDispatcher } from "three";
export interface MarkerPositioningParameters {
	size: number;
	type: "pattern" | "barcode" | "unknown";
	patternUrl: null | string;
	barcodeValue: null | number;
	changeMatrixMode: "modelViewMatrix" | "cameraTransformMatrix";
	minConfidence: number;
	[key: string]: any;
}
export declare class MarkerPositioning extends EventDispatcher {
	private smoothMatrices;
	private parameters;
	constructor(parameters: MarkerPositioningParameters);
	setParameters(parameters: MarkerPositioningParameters): void;
	dispose(): void;
	/**
	 * When you actually got a new modelViewMatrix, you need to perfom a whole bunch
	 * of things. it is done here.
	 */
	updateWithModelViewMatrix(modelViewMatrix: THREE.Matrix4): boolean;
	/**
	 * provide a name for a marker
	 * - silly heuristic for now
	 * - should be improved
	 */
	name(): string;
	_initArtoolkit(): void;
}
export default MarkerPositioning;
