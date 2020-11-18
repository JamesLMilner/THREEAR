import ARToolKit from "./ARToolKit";

/**
 * The ARController is the main object for doing AR marker detection with JSARToolKit.
 *
 * 	To use an ARController, you need to tell it the dimensions to use for the AR processing canvas and
 * 	pass it an ARCameraParam to define the camera parameters to use when processing images.
 * 	The ARCameraParam defines the lens distortion and aspect ratio of the camera used.
 * 	See https://www.artoolworks.com/support/library/Calibrating_your_camera for
 *  more information about AR camera parameteters and how to make and use them.
 *
 * 	If you pass an image as the first argument, the ARController uses that as the image to process,
 * 	using the dimensions of the image as AR processing canvas width and height. If the first argument
 * 	to ARController is an image, the second argument is used as the camera param.
 *
 * The camera parameters argument can be either an ARCameraParam or an URL to a camera definition file.
 * If the camera argument is an URL, it is loaded into a new ARCameraParam, and the ARController dispatches
 * a "load" event and calls the onload method if it is defined.
 *
 * @exports ARController
 * @constructor
 * @param {number} width The width of the images to process.
 * @param {number} height The height of the images to process.
 * @param {ARCameraParam | string} camera The ARCameraParam to use for image processing.
 * If this is a string, the ARController treats it as an URL and tries to load it as a
 * ARCameraParam definition file, calling ARController#onload on success.
 */
export class ARToolKitController {
	public ctx: CanvasRenderingContext2D | null;
	public canvas: HTMLCanvasElement;
	public videoWidth: any;
	public videoHeight: any;
	public orientation: string;

	private framepointer: any;
	private id: number;
	private listeners: any;
	private image: any;
	private patternMarkers: any;
	private barcodeMarkers: any;
	private transformMat: any;
	private defaultMarkerWidth: number;
	private cameraParam: any;
	private markerTransformMat: any;
	private _bwpointer: any;
	private framesize: any;
	private dataHeap: any;
	private cameraMat: any;
	private onload: any;
	private contextError = "Canvas 2D Context was not available";

	constructor(width: any, height: any, camera: any) {
		let w = width;
		let h = height;

		this.orientation = "landscape";

		this.listeners = {};

		// TODO: What is going on will all these types?
		if (typeof width !== "number") {
			const image = width;
			camera = height;
			w = image.videoWidth || image.width;
			h = image.videoHeight || image.height;
			this.image = image;
		}

		this.defaultMarkerWidth = 1;
		this.patternMarkers = {};
		this.barcodeMarkers = {};
		this.transformMat = new Float32Array(16);

		this.canvas = document.createElement("canvas");
		this.canvas.width = w;
		this.canvas.height = h;
		this.ctx = this.canvas.getContext("2d");

		if (this.ctx === null) {
			throw Error("Could not get 2D Context for canvas element");
		}

		this.videoWidth = w;
		this.videoHeight = h;
		this.id = -1; // TODO: Quick solution to keep TSC happy

		this.cameraParam = camera;
		this._initialize();
	}

	/**
	 * Destroys the ARController instance and frees all associated resources.
	 * After calling dispose, the ARController can't be used any longer. Make a new one if you need one.
	 * Calling this avoids leaking Emscripten memory, which may be important if you"re
	 * using multiple ARControllers.
	 */
	public dispose() {
		ARToolKit.teardown(this.id);

		for (const key in this) {
			if (key) {
				delete this[key];
			}
		}
	}

	/**
	 * Detects markers in the given image. The process method dispatches marker detection events during its run.
	 *
	 * The marker detection process proceeds by first dispatching a markerNum event that tells you how many
	 * markers were found in the image. Next, a getMarker event is dispatched for each found marker square.
	 * finally, getMultiMarker is dispatched for every found multimarker
	 * followed by getMultiMarkerSub events
	 * dispatched for each of the markers in the multimarker.
	 * arController.addEventListener("markerNum", function(ev) {
	 * console.log("Detected " + ev.data + " markers.")
	 * });
	 * arController.addEventListener("getMarker", function(ev) {
	 * console.log("Detected marker with ids:", ev.data.marker.id, ev.data.marker.idPatt, ev.data.marker.idMatrix);
	 * console.log("Marker data", ev.data.marker);
	 * console.log("Marker transform matrix:", [].join.call(ev.data.matrix, ", "));
	 * });
	 * arController.addEventListener("getMultiMarker", function(ev) {
	 * console.log("Detected multimarker with id:", ev.data.multiMarkerId);
	 * });
	 * arController.addEventListener("getMultiMarkerSub", function(ev) {
	 * console.log("Submarker for " + ev.data.multiMarkerId, ev.data.markerIndex, ev.data.marker);
	 * });
	 * arController.process(image);
	 * If no image is given, defaults to this.image.
	 * If the debugSetup has been called, draws debug markers on the debug canvas.
	 * @param {HTMLImageElement|HTMLVideoElement} [image] The image to process [optional].
	 */
	public process(image: HTMLImageElement | HTMLVideoElement) {
		this.detectMarker(image);

		const markerNum = this.getMarkerNum();

		for (const k in this.patternMarkers) {
			if (k !== undefined) {
				const o = this.patternMarkers[k];
				o.inPrevious = o.inCurrent;
				o.inCurrent = false;
			}
		}
		for (const k in this.barcodeMarkers) {
			if (k !== undefined) {
				const o = this.barcodeMarkers[k];
				o.inPrevious = o.inCurrent;
				o.inCurrent = false;
			}
		}

		let visible;
		let multiEachMarkerInfo;

		for (let i = 0; i < markerNum; i++) {
			const markerInfo = this.getMarker(i);

			let markerType = ARToolKit.UNKNOWN_MARKER;
			visible = this.trackPatternMarkerId(-1);

			if (
				markerInfo.idPatt > -1 &&
				(markerInfo.id === markerInfo.idPatt || markerInfo.idMatrix === -1)
			) {
				visible = this.trackPatternMarkerId(markerInfo.idPatt);
				markerType = ARToolKit.PATTERN_MARKER;

				if (markerInfo.dir !== markerInfo.dirPatt) {
					this.setMarkerInfoDir(i, markerInfo.dirPatt);
				}
			} else if (markerInfo.idMatrix > -1) {
				visible = this.trackBarcodeMarkerId(markerInfo.idMatrix);
				markerType = ARToolKit.BARCODE_MARKER;

				if (markerInfo.dir !== markerInfo.dirMatrix) {
					this.setMarkerInfoDir(i, markerInfo.dirMatrix);
				}
			}

			if (markerType !== ARToolKit.UNKNOWN_MARKER && visible.inPrevious) {
				this.getTransMatSquareCont(
					i,
					visible.markerWidth,
					visible.matrix,
					visible.matrix
				);
			} else {
				this.getTransMatSquare(i, visible.markerWidth, visible.matrix);
			}

			visible.inCurrent = true;
			this.transMatToGLMat(visible.matrix, this.transformMat);

			this.dispatchEvent({
				name: "getMarker",
				target: this,
				data: {
					index: i,
					type: markerType,
					marker: markerInfo,
					matrix: this.transformMat,
				},
			});
		}

		const multiMarkerCount = this.getMultiMarkerCount();
		for (let i = 0; i < multiMarkerCount; i++) {
			const subMarkerCount = this.getMultiMarkerPatternCount(i);
			visible = false;

			ARToolKit.getTransMatMultiSquareRobust(this.id, i);
			this.transMatToGLMat(this.markerTransformMat, this.transformMat);

			for (let j = 0; j < subMarkerCount; j++) {
				multiEachMarkerInfo = this.getMultiEachMarker(i, j);
				if (multiEachMarkerInfo.visible >= 0) {
					visible = true;
					this.dispatchEvent({
						name: "getMultiMarker",
						target: this,
						data: {
							multiMarkerId: i,
							matrix: this.transformMat,
						},
					});
					break;
				}
			}
			if (visible) {
				for (let j = 0; j < subMarkerCount; j++) {
					multiEachMarkerInfo = this.getMultiEachMarker(i, j);
					this.transMatToGLMat(this.markerTransformMat, this.transformMat);
					this.dispatchEvent({
						name: "getMultiMarkerSub",
						target: this,
						data: {
							multiMarkerId: i,
							markerIndex: j,
							marker: multiEachMarkerInfo,
							matrix: this.transformMat,
						},
					});
				}
			}
		}
		if (this._bwpointer) {
			this.debugDraw();
		}
	}

	/**
	 * Adds the given pattern marker ID to the index of tracked IDs.
	 * Sets the markerWidth for the pattern marker to markerWidth.
	 * Used by process() to implement continuous tracking,
	 * keeping track of the marker's transformation matrix
	 * and customizable marker widths.
	 * @param {number} id ID of the pattern marker to track.
	 * @param {number} [markerWidth] The width of the marker to track.
	 * @return {Object} The marker tracking object.
	 */
	public trackPatternMarkerId(id: number, markerWidth?: number) {
		let obj = this.patternMarkers[id];
		if (!obj) {
			this.patternMarkers[id] = obj = {
				inPrevious: false,
				inCurrent: false,
				matrix: new Float32Array(12),
				markerWidth: markerWidth || this.defaultMarkerWidth,
			};
		}
		if (markerWidth) {
			obj.markerWidth = markerWidth;
		}
		return obj;
	}

	/**
	 * Adds the given barcode marker ID to the index of tracked IDs.
	 * Sets the markerWidth for the pattern marker to markerWidth.
	 * Used by process() to implement continuous tracking,
	 * keeping track of the marker"s transformation matrix
	 * and customizable marker widths.
	 * @param {number} id ID of the barcode marker to track.
	 * @param {number} [markerWidth] The width of the marker to track.
	 * @return {Object} The marker tracking object.
	 */
	public trackBarcodeMarkerId(id: number, markerWidth?: number) {
		let obj = this.barcodeMarkers[id];
		if (!obj) {
			this.barcodeMarkers[id] = obj = {
				inPrevious: false,
				inCurrent: false,
				matrix: new Float32Array(12),
				markerWidth: markerWidth || this.defaultMarkerWidth,
			};
		}
		if (markerWidth) {
			obj.markerWidth = markerWidth;
		}
		return obj;
	}

	/**
	 * Returns the number of multimarkers registered on this ARController.
	 * @return {number} Number of multimarkers registered.
	 */
	public getMultiMarkerCount() {
		return ARToolKit.getMultiMarkerCount(this.id);
	}

	/**
	 * Returns the number of markers in the multimarker registered for the given multiMarkerId.
	 * @param {number} multiMarkerId The id number of the multimarker to access. Given by loadMultiMarker.
	 * @return {number} Number of markers in the multimarker. Negative value indicates failure to find the multimarker.
	 */
	public getMultiMarkerPatternCount(multiMarkerId: number) {
		return ARToolKit.getMultiMarkerNum(this.id, multiMarkerId);
	}

	/**
	 * Add an event listener on this ARController for the named event, calling the callback function
	 * whenever that event is dispatched.
	 *
	 * Possible events are:
	 *  - getMarker - dispatched whenever process() finds a square marker
	 *  - getMultiMarker - dispatched whenever process() finds a visible registered multimarker
	 *  - getMultiMarkerSub - dispatched by process() for each marker in a visible multimarker
	 *  - load - dispatched when the ARController is ready to use (useful if passing in a camera URL in the constructor)
	 *  @param {string} name Name of the event to listen to.
	 * @param {function} callback Callback function to call when an event with the given name is dispatched.
	 */
	public addEventListener(name: string, callback: (event: any) => any) {
		if (!this.listeners[name]) {
			this.listeners[name] = [];
		}
		this.listeners[name].push(callback);
	}

	/**
	 * Remove an event listener from the named event.
	 * @param {string} name Name of the event to stop listening to.
	 * @param {function} callback Callback function to remove from the listeners of the named event.
	 */
	public removeEventListener(name: string, callback: () => any) {
		if (this.listeners[name]) {
			const index = this.listeners[name].indexOf(callback);
			if (index > -1) {
				this.listeners[name].splice(index, 1);
			}
		}
	}

	/**
	 * Dispatches the given event to all registered listeners on event.name.
	 * @param {Object} event Event to dispatch.
	 */
	public dispatchEvent(event: any) {
		const listeners = this.listeners[event.name];
		if (listeners) {
			for (let i = 0; i < listeners.length; i++) {
				listeners[i].call(this, event);
			}
		}
	}

	/**
	 * Sets up a debug canvas for the AR detection. Draws a red marker on top of each detected square in the image.
	 * The debug canvas is added to document.body.
	 */
	public debugSetup() {
		document.body.appendChild(this.canvas);
		this.setDebugMode(1);
		this._bwpointer = this.getProcessingImage();
	}

	/**
	 * Loads a pattern marker from the given URL and calls the onSuccess callback with the UID of the marker.
	 * arController.loadMarker(markerURL, onSuccess, onError);
	 * @param {string} markerURL - The URL of the marker pattern file to load.
	 * @param {function} onSuccess - The success callback. Called with the id of the loaded marker on a successful load.
	 * @param {function} onError - The error callback. Called with the encountered error if the load fails.
	 */
	public loadMarker(
		markerURL: string,
		onSuccess: (id: number) => any,
		onError: (err: any) => any
	) {
		return ARToolKit.addMarker(this.id, markerURL, onSuccess, onError);
	}

	/**
	 * Loads a multimarker from the given URL and calls the onSuccess callback with the UID of the marker.
	 * arController.loadMultiMarker(markerURL, onSuccess, onError);
	 * @param {string} markerURL - The URL of the multimarker pattern file to load.
	 * @param {function} onSuccess - The success callback. Called with the id and the
	 * number of sub-markers of the loaded marker on a successful load.
	 * @param {function} onError - The error callback. Called with the encountered error if the load fails.
	 */
	public loadMultiMarker(
		markerURL: string,
		onSuccess: () => any,
		onError: () => any
	) {
		return ARToolKit.addMultiMarker(this.id, markerURL, onSuccess, onError);
	}

	/**
	 * Populates the provided float array with the current transformation for the specified marker. After
	 * a call to detectMarker, all marker information will be current. Marker transformations can then be
	 * checked.
	 * @param {number} markerUID	The unique identifier (UID) of the marker to query
	 * @param {number} markerWidth	The width of the marker
	 * @param {Float64Array} dst	The float array to populate with the 3x4 marker transformation matrix
	 * @return	{Float64Array} The dst array.
	 */
	public getTransMatSquare(
		markerUID: number,
		markerWidth: number,
		dst: Float64Array
	) {
		ARToolKit.getTransMatSquare(this.id, markerUID, markerWidth);
		dst.set(this.markerTransformMat);
		return dst;
	}

	/**
	 * Populates the provided float array with the current transformation for the specified marker, using
	 * previousMarkerTransform as the previously detected transformation. After
	 * a call to detectMarker, all marker information will be current. Marker transformations can then be
	 * checked.
	 * @param {number} markerUID	The unique identifier (UID) of the marker to query
	 * @param {number} markerWidth	The width of the marker
	 * @param {Float64Array} previousMarkerTransform	The float array to use as the previous
	 * 3x4 marker transformation matrix
	 * @param {Float64Array} dst	The float array to populate with the 3x4 marker transformation matrix
	 * @return	{Float64Array} The dst array.
	 */
	public getTransMatSquareCont(
		markerUID: number,
		markerWidth: number,
		previousMarkerTransform: Float64Array,
		dst: Float64Array
	) {
		this.markerTransformMat.set(previousMarkerTransform);
		ARToolKit.getTransMatSquareCont(this.id, markerUID, markerWidth);
		dst.set(this.markerTransformMat);
		return dst;
	}

	/**
	 * Populates the provided float array with the current transformation for the specified multimarker. After
	 * a call to detectMarker, all marker information will be current. Marker transformations can then be
	 * checked.
	 *
	 * @param {number} markerUID	The unique identifier (UID) of the marker to query
	 * @param {Float64Array} dst	The float array to populate with the 3x4 marker transformation matrix
	 * @return	{Float64Array} The dst array.
	 */
	public getTransMatMultiSquare(markerUID: number, dst: Float64Array) {
		ARToolKit.getTransMatMultiSquare(this.id, markerUID);
		dst.set(this.markerTransformMat);
		return dst;
	}

	/**
	 * Populates the provided float array with the current robust transformation for the specified multimarker. After
	 * a call to detectMarker, all marker information will be current. Marker transformations can then be
	 * checked.
	 * @param {number} markerUID	The unique identifier (UID) of the marker to query
	 * @param {Float64Array} dst	The float array to populate with the 3x4 marker transformation matrix
	 * @return	{Float64Array} The dst array.
	 */
	public getTransMatMultiSquareRobust(markerUID: number, dst: Float64Array) {
		ARToolKit.getTransMatMultiSquare(this.id, markerUID);
		dst.set(this.markerTransformMat);
		return dst;
	}

	/**
	 * Converts the given 3x4 marker transformation matrix in the 12-element transMat array
	 * into a 4x4 WebGL matrix and writes the result into the 16-element glMat array.
	 * If scale parameter is given, scales the transform of the glMat by the scale parameter.
	 * @param {Float64Array} transMat The 3x4 marker transformation matrix.
	 * @param {Float64Array} glMat The 4x4 GL transformation matrix.
	 * @param {number} [scale] The scale for the transform.
	 */
	public transMatToGLMat(
		transMat: Float64Array,
		glMat: Float64Array,
		scale?: number
	) {
		glMat[0 + 0 * 4] = transMat[0]; // R1C1
		glMat[0 + 1 * 4] = transMat[1]; // R1C2
		glMat[0 + 2 * 4] = transMat[2];
		glMat[0 + 3 * 4] = transMat[3];
		glMat[1 + 0 * 4] = transMat[4]; // R2
		glMat[1 + 1 * 4] = transMat[5];
		glMat[1 + 2 * 4] = transMat[6];
		glMat[1 + 3 * 4] = transMat[7];
		glMat[2 + 0 * 4] = transMat[8]; // R3
		glMat[2 + 1 * 4] = transMat[9];
		glMat[2 + 2 * 4] = transMat[10];
		glMat[2 + 3 * 4] = transMat[11];
		glMat[3 + 0 * 4] = 0.0;
		glMat[3 + 1 * 4] = 0.0;
		glMat[3 + 2 * 4] = 0.0;
		glMat[3 + 3 * 4] = 1.0;
		if (scale !== undefined && scale !== 0.0) {
			glMat[12] *= scale;
			glMat[13] *= scale;
			glMat[14] *= scale;
		}
		return glMat;
	}

	/**
	 * This is the core ARToolKit marker detection function. It calls through to a set of
	 * internal functions to perform the key marker detection steps of binarization and
	 * labelling, contour extraction, and template matching and/or matrix code extraction.
	 * Typically, the resulting set of detected markers is retrieved by calling arGetMarkerNum
	 * to get the number of markers detected and arGetMarker to get an array of ARMarkerInfo
	 * structures with information on each detected marker, followed by a step in which
	 * detected markers are possibly examined for some measure of goodness of match (e.g. by
	 * examining the match confidence value) and pose extraction.
	 * @param {HTMLImageElement|HTMLVideoElement} [image] to be processed to detect markers.
	 * @return {number}     0 if the function proceeded without error, or a value less than 0 in case of error.
	 * A result of 0 does not however, imply any markers were detected.
	 */
	public detectMarker(imageElement: HTMLImageElement | HTMLVideoElement) {
		if (this._copyImageToHeap(imageElement)) {
			return ARToolKit.detectMarker(this.id);
		}
		return -99;
	}

	/**
	 * Get the number of markers detected in a video frame.
	 * @return {number}     The number of detected markers in the most recent image passed to arDetectMarker.
	 * 	Note that this is actually a count, not an index. A better name for this function would be
	 * 	arGetDetectedMarkerCount, but the current name lives on for historical reasons.
	 */
	public getMarkerNum() {
		return ARToolKit.getMarkerNum(this.id);
	}

	/**
	 * Get the marker info struct for the given marker index in detected markers.
	 * Call this.detectMarker first, then use this.getMarkerNum to get the detected marker count.
	 * The returned object is the global artoolkit.markerInfo object and will be overwritten
	 * by subsequent calls. If you need to hang on to it, create a copy using this.cloneMarkerInfo();
	 * Returns undefined if no marker was found.
	 * A markerIndex of -1 is used to access the global custom marker.
	 * The fields of the markerInfo struct are:
	 *  @field area Area in pixels of the largest connected region, comprising
	 *  the marker border and regions connected to it. Note that this is
	 *  not the same as the actual onscreen area inside the marker border.
	 * @field      id If pattern detection mode is either pattern mode OR
	 *  matrix but not both, will be marker ID (>= 0) if marker is valid, or -1 if invalid.
	 * @field      idPatt If pattern detection mode includes a pattern mode,
	 * will be marker ID (>= 0) if marker is valid, or -1 if invalid.
	 * @field      idMatrix If pattern detection mode includes a matrix mode,
	 * will be marker ID (>= 0) if marker is valid, or -1 if invalid.
	 * @field      dir If pattern detection mode is either pattern mode OR matrix
	 * but not both, and id != -1, will be marker direction (range 0 to 3, inclusive).
	 * @field      dirPatt If pattern detection mode includes a pattern mode, and
	 * id != -1, will be marker direction (range 0 to 3, inclusive).
	 * @field      dirMatrix If pattern detection mode includes a matrix mode,
	 * and id != -1, will be marker direction (range 0 to 3, inclusive).
	 * @field      cf If pattern detection mode is either pattern mode OR
	 * matrix but not both, will be marker matching confidence (range 0.0 to 1.0 inclusive)
	 * if marker is valid, or -1.0 if marker is invalid.
	 * @field      cfPatt If pattern detection mode includes a pattern mode,
	 * will be marker matching confidence (range 0.0 to 1.0 inclusive) if marker is valid, or -1.0 if marker is invalid.
	 * @field      cfMatrix If pattern detection mode includes a matrix mode,
	 * will be marker matching confidence (range 0.0 to 1.0 inclusive) if marker is valid, or -1.0 if marker is invalid.
	 * @field      pos 2D position (in camera image coordinates, origin at top-left)
	 * of the centre of the marker.
	 * @field      line Line equations for the 4 sides of the marker.
	 * @field      vertex 2D positions (in camera image coordinates, origin at top-left)
	 * of the corners of the marker. vertex[(4 - dir)%4][] is the top-left corner of the marker.
	 * Other vertices proceed clockwise from this. These are idealised coordinates
	 * (i.e. the onscreen position aligns correctly with the undistorted camera image.)
	 * @param {number} markerIndex The index of the marker to query.
	 * @returns {Object} The markerInfo struct.
	 */
	public getMarker(markerIndex: number) {
		if (0 === ARToolKit.getMarker(this.id, markerIndex)) {
			return ARToolKit.getMarkerInfo();
		}
	}

	/**
	 * Set marker vertices to the given vertexData[4][2] array.
	 * Sets the marker pos to the center of the vertices.
	 * Useful for building custom markers for getTransMatSquare.
	 * A markerIndex of -1 is used to access the global custom marker.
	 * @param {number} markerIndex The index of the marker to edit.
	 * @param {*} vertexData
	 */
	public setMarkerInfoVertex(markerIndex: number, vertexData: any) {
		for (let i = 0; i < vertexData.length; i++) {
			this.markerTransformMat[i * 2 + 0] = vertexData[i][0];
			this.markerTransformMat[i * 2 + 1] = vertexData[i][1];
		}
		return ARToolKit.setMarkerInfoVertex(this.id, markerIndex);
	}

	/**
	 * Makes a deep copy of the given marker info.
	 * @param {Object} markerInfo The marker info object to copy.
	 * @return {Object} The new copy of the marker info.
	 */
	public cloneMarkerInfo(markerInfo: any) {
		return JSON.parse(JSON.stringify(markerInfo));
	}

	/**
	 * Get the marker info struct for the given marker index in detected markers.
	 * Call this.detectMarker first, then use this.getMarkerNum to get the detected marker count.
	 * The returned object is the global artoolkit.markerInfo object and will be overwritten
	 * by subsequent calls. If you need to hang on to it, create a copy using this.cloneMarkerInfo();
	 * Returns undefined if no marker was found.
	 * @field {number} pattId The index of the marker.
	 * @field {number} pattType The type of the marker.
	 * Either AR_MULTI_PATTERN_TYPE_TEMPLATE or AR_MULTI_PATTERN_TYPE_MATRIX.
	 * @field {number} visible 0 or larger if the marker is visible
	 * @field {number} width The width of the marker.
	 * @param {number} multiMarkerId The multimarker to query.
	 * @param {number} markerIndex The index of the marker to query.
	 * @returns {Object} The markerInfo struct.
	 */
	public getMultiEachMarker(multiMarkerId: number, markerIndex: number) {
		if (
			0 === ARToolKit.getMultiEachMarker(this.id, multiMarkerId, markerIndex)
		) {
			return ARToolKit.multiEachMarkerInfo;
		}
	}

	/**
	 * Returns the 16-element WebGL transformation matrix used by ARController.process to
	 * pass marker WebGL matrices to event listeners.
	 * Unique to each ARController.
	 * @return {Float64Array} The 16-element WebGL transformation matrix used by the ARController.
	 */
	public getTransformationMatrix() {
		return this.transformMat;
	}

	/**
	 * Returns the projection matrix computed from camera parameters for the ARController.
	 *
	 * @return {Float64Array} The 16-element WebGL camera matrix for the ARController camera parameters.
	 */
	public getCameraMatrix(): Float64Array {
		return this.cameraMat;
	}

	/**
	 * Returns the shared ARToolKit 3x4 marker transformation matrix, used for passing and receiving
	 * marker transforms to/from the Emscripten side.
	 * @return {Float64Array} The 12-element 3x4 row-major marker transformation matrix used by ARToolKit.
	 */
	public getMarkerTransformationMatrix(): Float64Array {
		return this.markerTransformMat;
	}

	/* Setter / Getter Proxies */

	/**
	 * Enables or disables debug mode in the tracker. When enabled, a black and white debug
	 * image is generated during marker detection. The debug image is useful for visualising
	 * the binarization process and choosing a threshold value.
	 * @param {boolean} mode		true to enable debug mode, false to disable debug mode
	 * @see				getDebugMode()
	 */
	public setDebugMode(mode: number) {
		return ARToolKit.setDebugMode(this.id, mode);
	}

	/**
	 * Returns whether debug mode is currently enabled.
	 * @return {boolean}	true when debug mode is enabled, false when debug mode is disabled
	 * @see					setDebugMode()
	 */
	public getDebugMode(): boolean {
		return ARToolKit.getDebugMode(this.id);
	}

	/**
	 * Returns the Emscripten HEAP offset to the debug processing image used by ARToolKit.
	 *
	 * @return {number} HEAP offset to the debug processing image.
	 */
	public getProcessingImage() {
		return ARToolKit.getProcessingImage(this.id);
	}

	/**
	 * Sets the logging level to use by ARToolKit.
	 *
	 * //TODOC
	 * @param mode
	 */
	public setLogLevel(mode: any) {
		return ARToolKit.setLogLevel(mode);
	}

	/**
	 * //TODOC
	 * @returns {*}
	 */
	public getLogLevel() {
		return ARToolKit.getLogLevel();
	}

	/**
	 * //TODOC
	 * @param markerIndex
	 * @param dir
	 * @returns {*}
	 */
	public setMarkerInfoDir(markerIndex: number, dir: any) {
		return ARToolKit.setMarkerInfoDir(this.id, markerIndex, dir);
	}

	/**
	 * //TODOC
	 * @param value
	 * @returns {*}
	 */
	public setProjectionNearPlane(value: any) {
		return ARToolKit.setProjectionNearPlane(this.id, value);
	}

	/**
	 * //TODOC
	 * @returns {*}
	 */
	public getProjectionNearPlane() {
		return ARToolKit.getProjectionNearPlane(this.id);
	}

	/**
	 * //TODOC
	 * @param value
	 * @returns {*}
	 */
	public setProjectionFarPlane(value: any) {
		return ARToolKit.setProjectionFarPlane(this.id, value);
	}

	/**
	 * //TODOC
	 * @returns {*}
	 */
	public getProjectionFarPlane() {
		return ARToolKit.getProjectionFarPlane(this.id);
	}

	/**
	 * Set the labeling threshold mode (auto/manual).
	 * @param {number}		mode An integer specifying the mode. One of:
	 * AR_LABELING_THRESH_MODE_MANUAL,
	 * AR_LABELING_THRESH_MODE_AUTO_MEDIAN,
	 * AR_LABELING_THRESH_MODE_AUTO_OTSU,
	 * AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE,
	 * AR_LABELING_THRESH_MODE_AUTO_BRACKETING
	 */
	public setThresholdMode(mode: any) {
		return ARToolKit.setThresholdMode(this.id, mode);
	}

	/**
	 * Gets the current threshold mode used for image binarization.
	 * @return	{number}		The current threshold mode
	 * @see				getVideoThresholdMode()
	 */
	public getThresholdMode() {
		return ARToolKit.getThresholdMode(this.id);
	}

	/**
	 * Set the labeling threshhold.
	 * This function forces sets the threshold value.
	 * The default value is AR_DEFAULT_LABELING_THRESH which is 100.
	 * The current threshold mode is not affected by this call.
	 * Typically, this function is used when labeling threshold mode
	 * is AR_LABELING_THRESH_MODE_MANUAL.
	 * The threshold value is not relevant if threshold mode is
	 * AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE.
	 *
	 * Background: The labeling threshold is the value which
	 * the AR library uses to differentiate between black and white
	 * portions of an ARToolKit marker. Since the actual brightness,
	 * contrast, and gamma of incoming images can vary signficantly
	 * between different cameras and lighting conditions, this
	 * value typically needs to be adjusted dynamically to a
	 * suitable midpoint between the observed values for black
	 * and white portions of the markers in the image.
	 *
	 * @param {number}     threshold An integer in the range [0,255] (inclusive).
	 */
	public setThreshold(threshold: number) {
		return ARToolKit.setThreshold(this.id, threshold);
	}

	/**
	 * Get the current labeling threshold.
	 *
	 * This function queries the current labeling threshold. For,
	 * AR_LABELING_THRESH_MODE_AUTO_MEDIAN, AR_LABELING_THRESH_MODE_AUTO_OTSU,
	 * and AR_LABELING_THRESH_MODE_AUTO_BRACKETING
	 * the threshold value is only valid until the next auto-update.
	 *
	 * The current threshold mode is not affected by this call.
	 *
	 * The threshold value is not relevant if threshold mode is
	 * AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE.
	 *
	 * @return {number} The current threshold value.
	 */
	public getThreshold() {
		return ARToolKit.getThreshold(this.id);
	}

	/**
	 * Set the pattern detection mode
	 *
	 * The pattern detection determines the method by which ARToolKit
	 * matches detected squares in the video image to marker templates
	 * and/or IDs. ARToolKit v4.x can match against pictorial "template" markers,
	 * whose pattern files are created with the mk_patt utility, in either colour
	 * or mono, and additionally can match against 2D-barcode-type "matrix"
	 * markers, which have an embedded marker ID. Two different two-pass modes
	 * are also available, in which a matrix-detection pass is made first,
	 * followed by a template-matching pass.
	 *
	 * @param {number} mode
	 * 	Options for this field are:
	 * 	AR_TEMPLATE_MATCHING_COLOR
	 * 	AR_TEMPLATE_MATCHING_MONO
	 * 	AR_MATRIX_CODE_DETECTION
	 * 	AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX
	 * 	AR_TEMPLATE_MATCHING_MONO_AND_MATRIX
	 * 	The default mode is AR_TEMPLATE_MATCHING_COLOR.
	 */
	public setPatternDetectionMode(mode: number) {
		return ARToolKit.setPatternDetectionMode(this.id, mode);
	}

	/**
	 * Returns the current pattern detection mode.
	 * @return {number} The current pattern detection mode.
	 */
	public getPatternDetectionMode() {
		return ARToolKit.getPatternDetectionMode(this.id);
	}

	/**
	 * Set the size and ECC algorithm to be used for matrix code (2D barcode) marker detection.
	 *
	 * When matrix-code (2D barcode) marker detection is enabled (see arSetPatternDetectionMode)
	 * then the size of the barcode pattern and the type of error checking and correction (ECC)
	 * with which the markers were produced can be set via this function.
	 *
	 * This setting is global to a given ARHandle; It is not possible to have two different matrix
	 * code types in use at once.
	 *
	 * @param      type The type of matrix code (2D barcode) in use. Options include:
	 * 	AR_MATRIX_CODE_3x3
	 * 	AR_MATRIX_CODE_3x3_HAMMING63
	 * 	AR_MATRIX_CODE_3x3_PARITY65
	 * 	AR_MATRIX_CODE_4x4
	 * 	AR_MATRIX_CODE_4x4_BCH_13_9_3
	 * 	AR_MATRIX_CODE_4x4_BCH_13_5_5
	 * 	The default mode is AR_MATRIX_CODE_3x3.
	 */
	public setMatrixCodeType(type: any) {
		return ARToolKit.setMatrixCodeType(this.id, type);
	}

	/**
	 * Returns the current matrix code (2D barcode) marker detection type.
	 * @return {number} The current matrix code type.
	 */
	public getMatrixCodeType() {
		return ARToolKit.getMatrixCodeType(this.id);
	}

	/**
	 * Select between detection of black markers and white markers.
	 *
	 * ARToolKit's labelling algorithm can work with both black-bordered
	 * markers on a white background (AR_LABELING_BLACK_REGION) or
	 * white-bordered markers on a black background (AR_LABELING_WHITE_REGION).
	 * This function allows you to specify the type of markers to look for.
	 * Note that this does not affect the pattern-detection algorith
	 * which works on the interior of the marker.
	 *
	 * @param {number}      mode
	 * Options for this field are:
	 * AR_LABELING_WHITE_REGION
	 * AR_LABELING_BLACK_REGION
	 * The default mode is AR_LABELING_BLACK_REGION.
	 */
	public setLabelingMode(mode: any) {
		return ARToolKit.setLabelingMode(this.id, mode);
	}

	/**
	 * Enquire whether detection is looking for black markers or white markers.
	 * See discussion for setLabelingMode.
	 * @result {number} The current labeling mode.
	 */
	public getLabelingMode() {
		return ARToolKit.getLabelingMode(this.id);
	}

	/**
	 * Set the width/height of the marker pattern space, as a proportion of marker width/height.
	 * @param {number}		pattRatio The the width/height of the marker pattern space, as a proportion of marker
	 * width/height. To set the default, pass AR_PATT_RATIO.
	 * If compatibility with ARToolKit verions 1.0 through 4.4 is required, this value
	 * must be 0.5.
	 */
	public setPattRatio(pattRatio: number) {
		return ARToolKit.setPattRatio(this.id, pattRatio);
	}

	/**
	 * Returns the current ratio of the marker pattern to the total marker size.
	 * @return {number} The current pattern ratio.
	 */
	public getPattRatio(): number {
		return ARToolKit.getPattRatio(this.id);
	}

	/**
	 * Set the image processing mode.
	 *
	 * When the image processing mode is AR_IMAGE_PROC_FRAME_IMAGE,
	 * ARToolKit processes all pixels in each incoming image
	 * to locate markers. When the mode is AR_IMAGE_PROC_FIELD_IMAGE,
	 * ARToolKit processes pixels in only every second pixel row and
	 * column. This is useful both for handling images from interlaced
	 * video sources (where alternate lines are assembled from alternate
	 * fields and thus have one field time-difference, resulting in a
	 * "comb" effect) such as Digital Video cameras.
	 * The effective reduction by 75% in the pixels processed also
	 * has utility in accelerating tracking by effectively reducing
	 * the image size to one quarter size, at the cost of pose accuraccy.
	 *
	 * @param {number} mode
	 * 	Options for this field are:
	 * 	AR_IMAGE_PROC_FRAME_IMAGE
	 * 	AR_IMAGE_PROC_FIELD_IMAGE
	 * 	The default mode is AR_IMAGE_PROC_FRAME_IMAGE.
	 */
	public setImageProcMode(mode: any) {
		return ARToolKit.setImageProcMode(this.id, mode);
	}

	/**
	 * Get the image processing mode.
	 * See arSetImageProcMode() for a complete description.
	 * @return {number} The current image processing mode.
	 */
	public getImageProcMode() {
		return ARToolKit.getImageProcMode(this.id);
	}

	/**
	 * Draw the black and white image and debug markers to the ARController canvas.
	 * See setDebugMode.
	 */
	public debugDraw() {
		const debugBuffer = new Uint8ClampedArray(
			ARToolKit.HEAPU8.buffer,
			this._bwpointer,
			this.framesize
		);
		const id = new ImageData(
			debugBuffer,
			this.canvas.width,
			this.canvas.height
		);
		if (this.ctx) {
			this.ctx.putImageData(id, 0, 0);
		} else {
			throw Error(this.contextError);
		}
		const marker_num = this.getMarkerNum();
		for (let i = 0; i < marker_num; i++) {
			this._debugMarker(this.getMarker(i));
		}
	}

	private _initialize() {
		this.id = ARToolKit.setup(
			this.canvas.width,
			this.canvas.height,
			this.cameraParam.id
		);

		const params = ARToolKit.getFrameMalloc();
		if (params) {
			this.framepointer = params.framepointer;
			this.framesize = params.framesize;
			this.dataHeap = new Uint8Array(
				ARToolKit.HEAPU8.buffer,
				this.framepointer,
				this.framesize
			);
			this.cameraMat = new Float64Array(
				ARToolKit.HEAPU8.buffer,
				params.camera,
				16
			);
			this.markerTransformMat = new Float64Array(
				ARToolKit.HEAPU8.buffer,
				params.transform,
				12
			);
		} else {
			throw Error("frameMalloc not set");
		}

		this.setProjectionNearPlane(0.1);
		this.setProjectionFarPlane(1000);

		setTimeout(() => {
			if (this.onload) {
				this.onload();
			}
			this.dispatchEvent({
				name: "load",
				target: this,
			});
		}, 0);
	}

	/**
	 * //TODOC
	 *
	 * @param {HTMLImageElement|HTMLVideoElement} [image]
	 * @returns {boolean}
	 * @private
	 */
	private _copyImageToHeap(image: HTMLImageElement | HTMLVideoElement) {
		if (this.ctx === null) {
			throw Error(this.contextError);
		}
		if (!image) {
			image = this.image;
		}

		if (
			(image instanceof HTMLImageElement && image.width > image.height) ||
			(image instanceof HTMLVideoElement &&
				image.videoWidth > image.videoHeight)
		) {
			// if landscape
			this.ctx.drawImage(image, 0, 0, this.canvas.width, this.canvas.height); // draw video
		} else {
			// if portrait
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			const scale = this.canvas.height / this.canvas.width;
			const scaledHeight = this.canvas.width * scale;
			const scaledWidth = this.canvas.height * scale;
			const marginLeft = (this.canvas.width - scaledWidth) / 2;
			this.ctx.drawImage(image, marginLeft, 0, scaledWidth, scaledHeight); // draw video
		}

		const imageData = this.ctx.getImageData(
			0,
			0,
			this.canvas.width,
			this.canvas.height
		);
		const data = imageData.data;

		if (this.dataHeap) {
			this.dataHeap.set(data);
			return true;
		}

		return false;
	}

	/**
	 * //TODOC
	 *
	 * @param marker
	 * @private
	 */
	private _debugMarker(marker: any) {
		if (this.ctx === null) {
			throw Error(this.contextError);
		}
		let vertex;
		let pos;
		vertex = marker.vertex;
		const ctx = this.ctx;
		ctx.strokeStyle = "red";

		ctx.beginPath();
		ctx.moveTo(vertex[0][0], vertex[0][1]);
		ctx.lineTo(vertex[1][0], vertex[1][1]);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(vertex[2][0], vertex[2][1]);
		ctx.lineTo(vertex[3][0], vertex[3][1]);
		ctx.stroke();

		ctx.strokeStyle = "green";
		ctx.beginPath();
		ctx.lineTo(vertex[1][0], vertex[1][1]);
		ctx.lineTo(vertex[2][0], vertex[2][1]);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(vertex[3][0], vertex[3][1]);
		ctx.lineTo(vertex[0][0], vertex[0][1]);
		ctx.stroke();

		pos = marker.pos;
		ctx.beginPath();
		ctx.arc(pos[0], pos[1], 8, 0, Math.PI * 2);
		ctx.fillStyle = "red";
		ctx.fill();
	}
}

export default ARToolKitController;
