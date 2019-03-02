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
    cameraParametersUrl: "../data/camera_para.dat";
    maxDetectionRate: number;
    canvasWidth: number;
    canvasHeight: number;
    patternRatio: number;
    imageSmoothingEnabled: boolean;
}
declare const enum Statuses {
    UNINITIALIZED = "UNINITIALIZED",
    INITIALIZING = "INITIALIZING",
    INITIALIZED = "INITIALIZED"
}
export declare class Controller extends THREE.EventDispatcher {
    status: Statuses;
    ready: Promise<any>;
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
