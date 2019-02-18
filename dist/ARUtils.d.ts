export declare class ARUtils {
    /**
     * Create a default rendering camera for this trackingBackend.
     * They may be modified later. to fit physical camera parameters
     *
     * @param {string} trackingBackend - the tracking to user
     * @return {THREE.Camera} the created camera
     */
    static createDefaultCamera(trackingMethod: any): any;
    /**
     * test if the code is running on tango
     *
     * @return {boolean} - true if running on tango, false otherwise
     */
    static isTango(): boolean;
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
