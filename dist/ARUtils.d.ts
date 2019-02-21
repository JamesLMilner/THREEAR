export declare class ARUtils {
    /**
     * Create a default rendering camera for this trackingBackend.
     * They may be modified later. to fit physical camera parameters
     *
     * @return {THREE.Camera} the created camera
     */
    static createDefaultCamera(trackingMethod: any): any;
    /**
     * parse tracking method
     *
     * @param {String} trackingMethod - the tracking method to parse
     * @return {Object} - various field of the tracking method
     */
    static parseTrackingMethod(trackingMethod: any): {
        trackingBackend: any;
        markersAreaEnabled: boolean;
    };
}
export default ARUtils;
