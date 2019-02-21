import * as THREE from "three";

export class ARUtils {

	/**
	 * Create a default rendering camera
	 * They may be modified later. to fit physical camera parameters
	 *
	 * @return {THREE.Camera} the created camera
	 */
	public static createDefaultCamera() {
		// Create a camera
		return new THREE.Camera();
	}

	/**
	 * parse tracking method
	 *
	 * @param {String} trackingMethod - the tracking method to parse
	 * @return {Object} - various field of the tracking method
	 */
	public static parseTrackingMethod(trackingMethod) {

		if (trackingMethod === "best") {
			trackingMethod = "area-artoolkit";
		}

		if (trackingMethod.startsWith("area-")) {
			return {
				trackingBackend : trackingMethod.replace("area-", ""),
				markersAreaEnabled : true,
			};
		} else {
			return {
				trackingBackend : trackingMethod,
				markersAreaEnabled : false,
			};
		}

	}

}

export default ARUtils;
