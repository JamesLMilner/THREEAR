import { ARBaseControls } from "./ARBaseControls";
export declare class ARMarkerControls extends ARBaseControls {
    private context;
    private parameters;
    private _arucoPosit;
    constructor(context: any, object3d: any, parameters: any);
    setParameters(parameters: any): void;
    dispose(): void;
    /**
     * When you actually got a new modelViewMatrix, you need to perfom a whole bunch
     * of things. it is done here.
     */
    updateWithModelViewMatrix(modelViewMatrix: any): void;
    /**
     * provide a name for a marker
     * - silly heuristic for now
     * - should be improved
     */
    name(): string;
    _initArtoolkit(): void;
}
export default ARMarkerControls;
