import * as THREE from "three";
export declare class ARUtils {
    /**
     * Create a default rendering camera
     * They may be modified later. to fit physical camera parameters
     *
     * @return {THREE.Camera} the created camera
     */
    static createDefaultCamera(): THREE.Camera;
    /**
     * parse tracking method
     *
     * @param {String} trackingMethod - the tracking method to parse
     * @return {Object} - various field of the tracking method
     */
    static parseTrackingMethod(trackingMethod: string): {
        trackingBackend: string;
        markersAreaEnabled: boolean;
    };
}
export default ARUtils;
