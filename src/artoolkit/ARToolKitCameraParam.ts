import ARToolKit from "./ARToolKit";

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
export class ARToolKitCameraParam {
	public complete: boolean;
	private id: number;
	private _src: string | Uint8Array;
	private onload: () => any;
	private onerror: (error: Error) => any;

	constructor(
		src: string | Uint8Array,
		onload: () => any,
		onerror: (error: any) => any
	) {
		this.id = -1;
		this._src = "";
		this.complete = false;
		this.onload = onload;
		this.onerror = onerror;
		if (src) {
			this.load(src);
		}
	}

	/**
	 * Loads the given URL as camera parameters definition file into this ARCameraParam.
	 * Can only be called on an unloaded ARCameraParam instance.
	 * @param {string} src URL to load.
	 */
	public load(src: string | Uint8Array) {
		if (this._src !== "") {
			throw new Error("ARCameraParam: Trying to load camera parameters twice.");
		}
		this._src = src;
		if (src) {
			ARToolKit.loadCamera(
				src,
				(id) => {
					this.id = id;
					this.complete = true;

					// TODO: This is so that the class instance can return rather than
					// going straight into the onload callback.
					setTimeout(() => {
						this.onload();
					});
				},
				(err) => {
					this.onerror(err);
				}
			);
		}
	}

	get src() {
		return this._src;
	}

	set src(src: string | Uint8Array) {
		this.load(src);
	}

	/**
	 * Destroys the camera parameter and frees associated Emscripten resources.
	 */
	public dispose() {
		if (this.id !== -1) {
			ARToolKit.deleteCamera(this.id);
		}
		this.id = -1;
		this._src = "";
		this.complete = false;
	}
}

export default ARToolKitCameraParam;
