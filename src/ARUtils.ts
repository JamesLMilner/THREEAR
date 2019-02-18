import * as THREE from "three";

export class ARUtils {

	/**
	 * Create a default rendering camera for this trackingBackend.
	 * They may be modified later. to fit physical camera parameters
	 *
	 * @param {string} trackingBackend - the tracking to user
	 * @return {THREE.Camera} the created camera
	 */
	public static createDefaultCamera(trackingMethod) {
		const trackingBackend = this.parseTrackingMethod(trackingMethod).trackingBackend;

		let camera;

		// Create a camera
		if (trackingBackend === "artoolkit" ) {
			camera = new THREE.Camera();
		} else if (trackingBackend === "aruco") {
			camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.01, 100);
		} else if (trackingBackend === "tango") {
			camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.01, 100);
		} else  {
			throw Error("unknown trackingBackend: " + trackingBackend);
		}

		return camera;
	}

	/**
	 * test if the code is running on tango
	 *
	 * @return {boolean} - true if running on tango, false otherwise
	 */
	public static isTango() {
		// FIXME: this test is super bad
		const isTango = navigator.userAgent.match("Chrome/57.0.2987.5") !== null ? true : false;
		return isTango;
	}

	/**
	 * parse tracking method
	 *
	 * @param {String} trackingMethod - the tracking method to parse
	 * @return {Object} - various field of the tracking method
	 */
	public static parseTrackingMethod(trackingMethod) {

		if (trackingMethod === "best") {
			trackingMethod = ARUtils.isTango() ? "tango" : "area-artoolkit";
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
