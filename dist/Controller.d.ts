import * as THREE from "three";
import { WebGLRenderer } from "three";
import { Source } from "./THREEAR";
import { PatternMarker } from "./PatternMarker";
import { BarcodeMarker } from "./BarcodeMarker";
export interface MarkerPositioningParameters {
	smooth: boolean;
	smoothCount: 5;
	smoothTolerance: 0.01;
	smoothThreshold: 2;
}
export interface ControllerParameters {
	source: Source;
	positioning: MarkerPositioningParameters;
	debug: boolean;
	changeMatrixMode: "modelViewMatrix" | "cameraTransformMatrix";
	detectionMode: "color" | "color_and_matrix" | "mono" | "mono_and_matrix";
	matrixCodeType: string;
	cameraParametersUrl: string | Uint8Array;
	maxDetectionRate: number;
	canvasWidth: number;
	canvasHeight: number;
	patternRatio: number;
	imageSmoothingEnabled: boolean;
}
/**
 * The controller is returned from THREE ARs initialize method, in the returned promise.
 * It provides methods for controlling AR state such as add markers to track and updating
 * to check for markers in the current provided source (i.e. webcam, video, image).
 * @param parameters parameters for determining things like detection mode and smoothing
 */
export declare class Controller extends THREE.EventDispatcher {
	postInit: Promise<any>;
	private parameters;
	private arController;
	private smoothMatrices;
	private _updatedAt;
	private _artoolkitProjectionAxisTransformMatrix;
	private _markers;
	constructor(parameters: ControllerParameters);
	setParameters(parameters: any): void;
	onResize(renderer: WebGLRenderer): void;
	update(srcElement: any): boolean;
	trackMarker(marker: PatternMarker | BarcodeMarker): void;
	private initialize;
	private _initArtoolkit;
	private getProjectionMatrix;
	private trackPatternMarker;
	private trackBarcode;
	private onMarkerFound;
	/**
	 * When you actually got a new modelViewMatrix, you need to perfom a whole bunch
	 * of things. it is done here.
	 */
	private updateWithModelViewMatrix;
}
export default Controller;
