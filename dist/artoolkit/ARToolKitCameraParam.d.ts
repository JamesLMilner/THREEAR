/**
 * ARCameraParam is used for loading AR camera parameters for use with ARController.
 * Use by passing in an URL and a callback function.
 * var camera = new ARCameraParam('Data/camera_para.dat', function() {
 * 	 console.log('loaded camera', this.id);
 * },
 * function(err) {
 *   console.log('failed to load camera', err);
 * });
 * @exports ARCameraParam
 * @constructor
 * @param {string} src URL to load camera parameters from.
 * @param {string} onload Onload callback to be called on successful parameter loading.
 * @param {string} onerror Error callback to called when things don't work out.
 */
export declare class ARToolKitCameraParam {
    complete: boolean;
    private id;
    private _src;
    private onload;
    private onerror;
    constructor(src: string | Uint8Array, onload: () => any, onerror: (error: any) => any);
    /**
     * Loads the given URL as camera parameters definition file into this ARCameraParam.
     * Can only be called on an unloaded ARCameraParam instance.
     * @param {string} src URL to load.
     */
    load(src: string | Uint8Array): void;
    get src(): string | Uint8Array;
    set src(src: string | Uint8Array);
    /**
     * Destroys the camera parameter and frees associated Emscripten resources.
     */
    dispose(): void;
}
export default ARToolKitCameraParam;
