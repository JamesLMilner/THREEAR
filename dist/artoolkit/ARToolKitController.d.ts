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
export declare class ARToolKitController {
    ctx: CanvasRenderingContext2D | null;
    canvas: HTMLCanvasElement;
    videoWidth: any;
    videoHeight: any;
    orientation: string;
    private framepointer;
    private id;
    private listeners;
    private image;
    private patternMarkers;
    private barcodeMarkers;
    private transformMat;
    private defaultMarkerWidth;
    private cameraParam;
    private markerTransformMat;
    private _bwpointer;
    private framesize;
    private dataHeap;
    private cameraMat;
    private onload;
    private contextError;
    constructor(width: any, height: any, camera: any);
    /**
     * Destroys the ARController instance and frees all associated resources.
     * After calling dispose, the ARController can't be used any longer. Make a new one if you need one.
     * Calling this avoids leaking Emscripten memory, which may be important if you"re
     * using multiple ARControllers.
     */
    dispose(): void;
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
    process(image: HTMLImageElement | HTMLVideoElement): void;
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
    trackPatternMarkerId(id: number, markerWidth?: number): any;
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
    trackBarcodeMarkerId(id: number, markerWidth?: number): any;
    /**
     * Returns the number of multimarkers registered on this ARController.
     * @return {number} Number of multimarkers registered.
     */
    getMultiMarkerCount(): any;
    /**
     * Returns the number of markers in the multimarker registered for the given multiMarkerId.
     * @param {number} multiMarkerId The id number of the multimarker to access. Given by loadMultiMarker.
     * @return {number} Number of markers in the multimarker. Negative value indicates failure to find the multimarker.
     */
    getMultiMarkerPatternCount(multiMarkerId: number): any;
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
    addEventListener(name: string, callback: (event: any) => any): void;
    /**
     * Remove an event listener from the named event.
     * @param {string} name Name of the event to stop listening to.
     * @param {function} callback Callback function to remove from the listeners of the named event.
     */
    removeEventListener(name: string, callback: () => any): void;
    /**
     * Dispatches the given event to all registered listeners on event.name.
     * @param {Object} event Event to dispatch.
     */
    dispatchEvent(event: any): void;
    /**
     * Sets up a debug canvas for the AR detection. Draws a red marker on top of each detected square in the image.
     * The debug canvas is added to document.body.
     */
    debugSetup(): void;
    /**
     * Loads a pattern marker from the given URL and calls the onSuccess callback with the UID of the marker.
     * arController.loadMarker(markerURL, onSuccess, onError);
     * @param {string} markerURL - The URL of the marker pattern file to load.
     * @param {function} onSuccess - The success callback. Called with the id of the loaded marker on a successful load.
     * @param {function} onError - The error callback. Called with the encountered error if the load fails.
     */
    loadMarker(markerURL: string, onSuccess: (id: number) => any, onError: (err: any) => any): void;
    /**
     * Loads a multimarker from the given URL and calls the onSuccess callback with the UID of the marker.
     * arController.loadMultiMarker(markerURL, onSuccess, onError);
     * @param {string} markerURL - The URL of the multimarker pattern file to load.
     * @param {function} onSuccess - The success callback. Called with the id and the
     * number of sub-markers of the loaded marker on a successful load.
     * @param {function} onError - The error callback. Called with the encountered error if the load fails.
     */
    loadMultiMarker(markerURL: string, onSuccess: () => any, onError: () => any): void;
    /**
     * Populates the provided float array with the current transformation for the specified marker. After
     * a call to detectMarker, all marker information will be current. Marker transformations can then be
     * checked.
     * @param {number} markerUID	The unique identifier (UID) of the marker to query
     * @param {number} markerWidth	The width of the marker
     * @param {Float64Array} dst	The float array to populate with the 3x4 marker transformation matrix
     * @return	{Float64Array} The dst array.
     */
    getTransMatSquare(markerUID: number, markerWidth: number, dst: Float64Array): Float64Array;
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
    getTransMatSquareCont(markerUID: number, markerWidth: number, previousMarkerTransform: Float64Array, dst: Float64Array): Float64Array;
    /**
     * Populates the provided float array with the current transformation for the specified multimarker. After
     * a call to detectMarker, all marker information will be current. Marker transformations can then be
     * checked.
     *
     * @param {number} markerUID	The unique identifier (UID) of the marker to query
     * @param {Float64Array} dst	The float array to populate with the 3x4 marker transformation matrix
     * @return	{Float64Array} The dst array.
     */
    getTransMatMultiSquare(markerUID: number, dst: Float64Array): Float64Array;
    /**
     * Populates the provided float array with the current robust transformation for the specified multimarker. After
     * a call to detectMarker, all marker information will be current. Marker transformations can then be
     * checked.
     * @param {number} markerUID	The unique identifier (UID) of the marker to query
     * @param {Float64Array} dst	The float array to populate with the 3x4 marker transformation matrix
     * @return	{Float64Array} The dst array.
     */
    getTransMatMultiSquareRobust(markerUID: number, dst: Float64Array): Float64Array;
    /**
     * Converts the given 3x4 marker transformation matrix in the 12-element transMat array
     * into a 4x4 WebGL matrix and writes the result into the 16-element glMat array.
     * If scale parameter is given, scales the transform of the glMat by the scale parameter.
     * @param {Float64Array} transMat The 3x4 marker transformation matrix.
     * @param {Float64Array} glMat The 4x4 GL transformation matrix.
     * @param {number} [scale] The scale for the transform.
     */
    transMatToGLMat(transMat: Float64Array, glMat: Float64Array, scale?: number): Float64Array;
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
    detectMarker(imageElement: HTMLImageElement | HTMLVideoElement): any;
    /**
     * Get the number of markers detected in a video frame.
     * @return {number}     The number of detected markers in the most recent image passed to arDetectMarker.
     * 	Note that this is actually a count, not an index. A better name for this function would be
     * 	arGetDetectedMarkerCount, but the current name lives on for historical reasons.
     */
    getMarkerNum(): any;
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
    getMarker(markerIndex: number): any;
    /**
     * Set marker vertices to the given vertexData[4][2] array.
     * Sets the marker pos to the center of the vertices.
     * Useful for building custom markers for getTransMatSquare.
     * A markerIndex of -1 is used to access the global custom marker.
     * @param {number} markerIndex The index of the marker to edit.
     * @param {*} vertexData
     */
    setMarkerInfoVertex(markerIndex: number, vertexData: any): any;
    /**
     * Makes a deep copy of the given marker info.
     * @param {Object} markerInfo The marker info object to copy.
     * @return {Object} The new copy of the marker info.
     */
    cloneMarkerInfo(markerInfo: any): any;
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
    getMultiEachMarker(multiMarkerId: number, markerIndex: number): any;
    /**
     * Returns the 16-element WebGL transformation matrix used by ARController.process to
     * pass marker WebGL matrices to event listeners.
     * Unique to each ARController.
     * @return {Float64Array} The 16-element WebGL transformation matrix used by the ARController.
     */
    getTransformationMatrix(): any;
    /**
     * Returns the projection matrix computed from camera parameters for the ARController.
     *
     * @return {Float64Array} The 16-element WebGL camera matrix for the ARController camera parameters.
     */
    getCameraMatrix(): Float64Array;
    /**
     * Returns the shared ARToolKit 3x4 marker transformation matrix, used for passing and receiving
     * marker transforms to/from the Emscripten side.
     * @return {Float64Array} The 12-element 3x4 row-major marker transformation matrix used by ARToolKit.
     */
    getMarkerTransformationMatrix(): Float64Array;
    /**
     * Enables or disables debug mode in the tracker. When enabled, a black and white debug
     * image is generated during marker detection. The debug image is useful for visualising
     * the binarization process and choosing a threshold value.
     * @param {boolean} mode		true to enable debug mode, false to disable debug mode
     * @see				getDebugMode()
     */
    setDebugMode(mode: number): any;
    /**
     * Returns whether debug mode is currently enabled.
     * @return {boolean}	true when debug mode is enabled, false when debug mode is disabled
     * @see					setDebugMode()
     */
    getDebugMode(): boolean;
    /**
     * Returns the Emscripten HEAP offset to the debug processing image used by ARToolKit.
     *
     * @return {number} HEAP offset to the debug processing image.
     */
    getProcessingImage(): any;
    /**
     * Sets the logging level to use by ARToolKit.
     *
     * //TODOC
     * @param mode
     */
    setLogLevel(mode: any): any;
    /**
     * //TODOC
     * @returns {*}
     */
    getLogLevel(): any;
    /**
     * //TODOC
     * @param markerIndex
     * @param dir
     * @returns {*}
     */
    setMarkerInfoDir(markerIndex: number, dir: any): any;
    /**
     * //TODOC
     * @param value
     * @returns {*}
     */
    setProjectionNearPlane(value: any): any;
    /**
     * //TODOC
     * @returns {*}
     */
    getProjectionNearPlane(): any;
    /**
     * //TODOC
     * @param value
     * @returns {*}
     */
    setProjectionFarPlane(value: any): any;
    /**
     * //TODOC
     * @returns {*}
     */
    getProjectionFarPlane(): any;
    /**
     * Set the labeling threshold mode (auto/manual).
     * @param {number}		mode An integer specifying the mode. One of:
     * AR_LABELING_THRESH_MODE_MANUAL,
     * AR_LABELING_THRESH_MODE_AUTO_MEDIAN,
     * AR_LABELING_THRESH_MODE_AUTO_OTSU,
     * AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE,
     * AR_LABELING_THRESH_MODE_AUTO_BRACKETING
     */
    setThresholdMode(mode: any): any;
    /**
     * Gets the current threshold mode used for image binarization.
     * @return	{number}		The current threshold mode
     * @see				getVideoThresholdMode()
     */
    getThresholdMode(): any;
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
    setThreshold(threshold: number): any;
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
    getThreshold(): any;
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
    setPatternDetectionMode(mode: number): any;
    /**
     * Returns the current pattern detection mode.
     * @return {number} The current pattern detection mode.
     */
    getPatternDetectionMode(): any;
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
    setMatrixCodeType(type: any): any;
    /**
     * Returns the current matrix code (2D barcode) marker detection type.
     * @return {number} The current matrix code type.
     */
    getMatrixCodeType(): any;
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
    setLabelingMode(mode: any): any;
    /**
     * Enquire whether detection is looking for black markers or white markers.
     * See discussion for setLabelingMode.
     * @result {number} The current labeling mode.
     */
    getLabelingMode(): any;
    /**
     * Set the width/height of the marker pattern space, as a proportion of marker width/height.
     * @param {number}		pattRatio The the width/height of the marker pattern space, as a proportion of marker
     * width/height. To set the default, pass AR_PATT_RATIO.
     * If compatibility with ARToolKit verions 1.0 through 4.4 is required, this value
     * must be 0.5.
     */
    setPattRatio(pattRatio: number): any;
    /**
     * Returns the current ratio of the marker pattern to the total marker size.
     * @return {number} The current pattern ratio.
     */
    getPattRatio(): number;
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
    setImageProcMode(mode: any): any;
    /**
     * Get the image processing mode.
     * See arSetImageProcMode() for a complete description.
     * @return {number} The current image processing mode.
     */
    getImageProcMode(): any;
    /**
     * Draw the black and white image and debug markers to the ARController canvas.
     * See setDebugMode.
     */
    debugDraw(): void;
    private _initialize;
    /**
     * //TODOC
     *
     * @param {HTMLImageElement|HTMLVideoElement} [image]
     * @returns {boolean}
     * @private
     */
    private _copyImageToHeap;
    /**
     * //TODOC
     *
     * @param marker
     * @private
     */
    private _debugMarker;
}
export default ARToolKitController;
