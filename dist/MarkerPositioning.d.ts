import { BasePositioning } from "./BasePositioning";
import * as THREE from "three";
import { Context } from "./THREEAR";
import { Object3D } from "three";
interface MarkerPositioningParameters {
    size: number;
    type: "pattern" | "barcode" | "unknown";
    patternUrl: null | string;
    barcodeValue: null | number;
    changeMatrixMode: "modelViewMatrix" | "cameraTransformMatrix";
    minConfidence: number;
    [key: string]: any;
}
export declare class MarkerPositioning extends BasePositioning {
    private context;
    private smoothMatrices;
    private parameters;
    constructor(context: Context, object3d: Object3D, parameters: MarkerPositioningParameters);
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
