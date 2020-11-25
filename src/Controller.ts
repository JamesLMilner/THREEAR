import ARToolKit from "./artoolkit/ARToolKit";
import ARToolKitCameraParam from "./artoolkit/ARToolKitCameraParam";
import { ARToolKitController } from "./artoolkit/ARToolKitController";
import * as THREE from "three";
import { Source } from "./THREEAR";
import { PatternMarker } from "./PatternMarker";
import { BarcodeMarker } from "./BarcodeMarker";
import cameraParametersData from "./artoolkit/CameraParameters";

export interface MarkerPositioningParameters {
	smooth: boolean;
	smoothCount: number;
	smoothTolerance: number;
	smoothThreshold: number;
}

export interface ControllerParameters {
	source: Source;
	positioning: MarkerPositioningParameters;
	lostTimeout: number;
	debug: boolean;
	changeMatrixMode: "modelViewMatrix" | "cameraTransformMatrix";
	detectionMode: "color" | "color_and_matrix" | "mono" | "mono_and_matrix";
	matrixCodeType: string;
	cameraParametersUrl: string | Uint8Array;
	maxDetectionRate: number;
	canvasWidth: number;
	canvasHeight: number;
	patternRatio: number;
	imageSmoothingEnabled: boolean;
}

interface Markers {
	pattern: PatternMarker[];
	barcode: BarcodeMarker[];
}

/**
 * The controller is returned from THREE ARs initialize method, in the returned promise.
 * It provides methods for controlling AR state such as add markers to track and updating
 * to check for markers in the current provided source (i.e. webcam, video, image).
 * @param parameters parameters for determining things like detection mode and smoothing
 */
export class Controller extends THREE.EventDispatcher {
	public postInit: Promise<any>;
	public disposed: boolean;
	public markers: Markers;

	private parameters: ControllerParameters;
	private arController: ARToolKitController | null;
	private smoothMatrices: any[];
	private _updatedAt: any;
	private _artoolkitProjectionAxisTransformMatrix: any;

	constructor(parameters: Partial<ControllerParameters>) {
		if (!parameters.source) {
			throw Error("Source must be provided");
		}

		super();

		// handle default parameters
		this.parameters = {
			source: parameters.source,

			changeMatrixMode: "modelViewMatrix",

			lostTimeout: 1000,

			// handle default parameters
			positioning: {
				// turn on/off camera smoothing
				smooth: true,
				// number of matrices to smooth tracking over, more = smoother but slower follow
				smoothCount: 5,
				// distance tolerance for smoothing, if smoothThreshold # of matrices are under tolerance, tracking will stay still
				smoothTolerance: 0.01,
				// threshold for smoothing, will keep still unless enough matrices are over tolerance
				smoothThreshold: 2,
			},

			// debug - true if one should display artoolkit debug canvas, false otherwise
			debug: false,
			// the mode of detection - ['color', 'color_and_matrix', 'mono', 'mono_and_matrix']
			detectionMode: "mono",
			// type of matrix code - valid iif detectionMode end with 'matrix' -
			// [3x3, 3x3_HAMMING63, 3x3_PARITY65, 4x4, 4x4_BCH_13_9_3, 4x4_BCH_13_5_5]
			matrixCodeType: "3x3",

			// url of the camera parameters
			cameraParametersUrl: cameraParametersData,

			// tune the maximum rate of pose detection in the source image
			maxDetectionRate: 60,

			// resolution of at which we detect pose in the source image
			canvasWidth: 640,
			canvasHeight: 480,

			// the patternRatio inside the artoolkit marker - artoolkit only
			patternRatio: 0.5,

			// enable image smoothing or not for canvas copy - default to true
			// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled
			imageSmoothingEnabled: false,
		};

		// create the marker Root
		// this.parameters.group.matrixAutoUpdate = false;
		// this.parameters.group.visible = false;
		this.markers = {
			pattern: [],
			barcode: [],
		};

		this.smoothMatrices = []; // last DEBOUNCE_COUNT modelViewMatrix
		this.arController = null;
		this._updatedAt = null;
		this.setParameters(parameters);

		this.disposed = false;
		this.postInit = this.initialize();
	}

	public setParameters(parameters: any) {
		if (!parameters) {
			return;
		}

		for (const key in parameters) {
			if (key) {
				const newValue = parameters[key];

				if (newValue === undefined) {
					console.warn(key + "' parameter is undefined.");
					continue;
				}

				const currentValue = (this.parameters as any)[key];

				if (currentValue === undefined) {
					console.warn(key + "' is not a property of this material.");
					continue;
				}

				(this.parameters as any)[key] = newValue;
			}
		}
	}

	public onResize(renderer: THREE.WebGLRenderer) {
		this.parameters.source.onResizeElement();
		this.parameters.source.copyElementSizeTo(renderer.domElement);
		if (this.arController !== null) {
			this.parameters.source.copyElementSizeTo(this.arController.canvas);
		}
	}

	public update(srcElement: any) {
		// be sure arController is fully initialized
		if (this.arController === null) {
			return false;
		}

		// honor this.parameters.maxDetectionRate
		const present = performance.now();
		if (
			this._updatedAt !== null &&
			present - this._updatedAt < 1000 / this.parameters.maxDetectionRate
		) {
			return false;
		}
		this._updatedAt = present;

		// mark all markers to invisible before processing this frame
		this.markers.pattern.forEach((m) => (m.markerObject.visible = false));
		this.markers.barcode.forEach((m) => (m.markerObject.visible = false));

		// process this frame
		this.arController.process(srcElement);

		// Check if any markers have been lost after processing
		this.checkForLostMarkers();

		// return true as we processed the frame
		return true;
	}

	public trackMarker(marker: PatternMarker | BarcodeMarker) {
		if (marker instanceof PatternMarker) {
			this.trackPatternMarker(marker);
		} else if (marker instanceof BarcodeMarker) {
			this.trackBarcode(marker);
		}
	}

	public dispose() {
		if (this.arController) {
			this.arController.dispose();
			this.arController = null;
			this.disposed = true;
			this.markers = {
				pattern: [],
				barcode: [],
			};
		}
	}

	private initialize() {
		return new Promise((resolve, reject) => {
			this.parameters.source
				.initialize()
				.then(() => {
					this._initArtoolkit(() => {
						const { camera, renderer } = this.parameters.source;

						if (renderer !== null) {
							// handle resize
							window.addEventListener("resize", () => {
								this.onResize(renderer);
							});
							this.onResize(renderer);
						} else {
							throw Error("Renderer is not defined");
						}

						if (camera !== null) {
							camera.projectionMatrix.copy(this.getProjectionMatrix());
						} else {
							throw Error("Camera is not defined");
						}

						// dispatch event
						this.dispatchEvent({
							type: "initialized",
						});

						resolve(this);
					});
				})
				.catch((error) => {
					reject(error);
				});
		});
	}

	private _initArtoolkit(onCompleted: () => any) {
		// set this._artoolkitProjectionAxisTransformMatrix to change artoolkit
		// projection matrix axis to match usual` webgl one
		this._artoolkitProjectionAxisTransformMatrix = new THREE.Matrix4();
		this._artoolkitProjectionAxisTransformMatrix.multiply(
			new THREE.Matrix4().makeRotationY(Math.PI)
		);
		this._artoolkitProjectionAxisTransformMatrix.multiply(
			new THREE.Matrix4().makeRotationZ(Math.PI)
		);
		// get cameraParameters
		const cameraParameters = new ARToolKitCameraParam(
			this.parameters.cameraParametersUrl,
			() => {
				// init controller
				this.arController = new ARToolKitController(
					this.parameters.canvasWidth,
					this.parameters.canvasHeight,
					cameraParameters
				);

				// honor this.parameters.imageSmoothingEnabled
				(this.arController
					.ctx as any).mozImageSmoothingEnabled = this.parameters.imageSmoothingEnabled;
				(this.arController
					.ctx as any).webkitImageSmoothingEnabled = this.parameters.imageSmoothingEnabled;
				(this.arController
					.ctx as any).msImageSmoothingEnabled = this.parameters.imageSmoothingEnabled;
				(this.arController
					.ctx as any).imageSmoothingEnabled = this.parameters.imageSmoothingEnabled;

				// honor this.parameters.debug
				if (this.parameters.debug === true) {
					this.arController.debugSetup();
					this.arController.canvas.style.position = "absolute";
					this.arController.canvas.style.top = "0px";
					this.arController.canvas.style.opacity = "0.6";
					this.arController.canvas.style.pointerEvents = "none";
					this.arController.canvas.style.zIndex = "-1";
				}

				// setPatternDetectionMode
				const detectionModes = {
					color: ARToolKit.AR_TEMPLATE_MATCHING_COLOR,
					color_and_matrix: ARToolKit.AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX,
					mono: ARToolKit.AR_TEMPLATE_MATCHING_MONO,
					mono_and_matrix: ARToolKit.AR_TEMPLATE_MATCHING_MONO_AND_MATRIX,
				};
				const detectionMode = detectionModes[this.parameters.detectionMode];
				this.arController.setPatternDetectionMode(detectionMode);

				// setMatrixCodeType
				const matrixCodeTypes: any = {
					"3x3": ARToolKit.AR_MATRIX_CODE_3x3,
					"3x3_HAMMING63": ARToolKit.AR_MATRIX_CODE_3x3_HAMMING63,
					"3x3_PARITY65": ARToolKit.AR_MATRIX_CODE_3x3_PARITY65,
					"4x4": ARToolKit.AR_MATRIX_CODE_4x4,
					"4x4_BCH_13_9_3": ARToolKit.AR_MATRIX_CODE_4x4_BCH_13_9_3,
					"4x4_BCH_13_5_5": ARToolKit.AR_MATRIX_CODE_4x4_BCH_13_5_5,
				};
				const matrixCodeType = matrixCodeTypes[this.parameters.matrixCodeType];
				this.arController.setMatrixCodeType(matrixCodeType);

				// set the patternRatio for artoolkit
				this.arController.setPattRatio(this.parameters.patternRatio);

				// set thresholding in artoolkit
				// this seems to be the default
				// arController.setThresholdMode(artoolkit.AR_LABELING_THRESH_MODE_MANUAL)
				// adatative consume a LOT of cpu...
				// arController.setThresholdMode(artoolkit.AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE)
				// arController.setThresholdMode(artoolkit.AR_LABELING_THRESH_MODE_AUTO_OTSU)

				// check if arController is init
				this.arController.setLogLevel(1);

				this.arController.addEventListener("getMarker", (event: any) => {
					this.handleMarkerDetection(event);
				});

				// notify
				onCompleted();
			},
			(err: any) => {
				throw err;
				// onerror
			}
		);

		return this;
	}

	private handleMarkerDetection(event: any) {
		if (event.data.type === ARToolKit.BARCODE_MARKER) {
			this.markers.barcode.forEach((barcodeMarker) => {
				if (event.data.marker.idMatrix === barcodeMarker.barcodeValue) {
					this.onMarkerFound(event, barcodeMarker);
				}
			});
		} else if (event.data.type === ARToolKit.PATTERN_MARKER) {
			this.markers.pattern.forEach((patternMarker) => {
				if (event.data.marker.idPatt === patternMarker.id) {
					this.onMarkerFound(event, patternMarker);
				}
			});
		}
	}

	private checkForLostMarkers() {
		[...this.markers.pattern, ...this.markers.barcode].forEach((marker) => {
			if (
				marker.lastDetected &&
				marker.found &&
				new Date().getTime() - marker.lastDetected.getTime() >
					this.parameters.lostTimeout
			) {
				this.onMarkerLost(marker);
			}
		});
	}

	private getProjectionMatrix() {
		// get projectionMatrixArr from artoolkit
		const controller = this.arController as ARToolKitController;
		const projectionMatrixArr = Array.from(controller.getCameraMatrix());
		const projectionMatrix = new THREE.Matrix4().fromArray(projectionMatrixArr);

		// apply context._axisTransformMatrix - change artoolkit axis to match usual webgl one
		projectionMatrix.multiply(this._artoolkitProjectionAxisTransformMatrix);

		// Hotfix for z-fighting bug
		// somehow ARToolKitController.ts L1031 & L1032 don't work
		const near = 0.1;
		const far = 1000;
		projectionMatrix.elements[10] = -(far + near) / (far - near);
		projectionMatrix.elements[14] = -(2 * far * near) / (far - near);

		// return the result
		return projectionMatrix;
	}

	private trackPatternMarker(marker: PatternMarker) {
		if (this.arController === null) {
			return;
		}

		this.markers.pattern.push(marker);

		// start tracking this pattern
		const onSuccess = (markerId: number) => {
			marker.id = markerId;
			(this.arController as any).trackPatternMarkerId(markerId, marker.size);
		};
		const onError = (err: any) => {
			throw Error(err);
		};
		if (marker.patternUrl) {
			this.arController.loadMarker(marker.patternUrl, onSuccess, onError);
		} else {
			throw Error("No patternUrl defined in parameters");
		}
	}

	private trackBarcode(marker: BarcodeMarker) {
		if (this.arController === null) {
			return;
		}

		this.markers.barcode.push(marker);

		let barcodeMarkerId: number | null = null;

		if (marker.barcodeValue !== undefined) {
			barcodeMarkerId = marker.barcodeValue;
			marker.id = barcodeMarkerId;
			this.arController.trackBarcodeMarkerId(barcodeMarkerId, marker.size);
		} else {
			throw Error("No barcodeValue defined in parameters");
		}
	}

	private onMarkerFound(event: any, marker: BarcodeMarker | PatternMarker) {
		// Check to make sure that the minimum confidence is met
		if (
			event.data.type === ARToolKit.PATTERN_MARKER &&
			event.data.marker.cfPatt < marker.minConfidence
		) {
			return;
		}

		if (
			event.data.type === ARToolKit.BARCODE_MARKER &&
			event.data.marker.cfMatt < marker.minConfidence
		) {
			return;
		}

		marker.found = true;
		marker.lastDetected = new Date();

		const modelViewMatrix = new THREE.Matrix4().fromArray(event.data.matrix);
		this.updateWithModelViewMatrix(modelViewMatrix, marker.markerObject);

		this.dispatchEvent({
			type: "markerFound",
			marker,
		});
	}

	private onMarkerLost(marker: BarcodeMarker | PatternMarker) {
		marker.found = false;
		this.dispatchEvent({
			type: "markerLost",
			marker,
		});
	}

	/**
	 * When you actually got a new modelViewMatrix, you need to perfom a whole bunch
	 * of things. it is done here.
	 */
	private updateWithModelViewMatrix(
		modelViewMatrix: THREE.Matrix4,
		markerObject: THREE.Object3D
	): boolean {
		// mark object as visible
		// this.parameters.group.visible = true;

		markerObject.visible = true;

		// apply context._axisTransformMatrix - change artoolkit axis to match usual webgl one
		const transformMatrix = this._artoolkitProjectionAxisTransformMatrix;
		const tmpMatrix = new THREE.Matrix4().copy(transformMatrix);
		tmpMatrix.multiply(modelViewMatrix);

		modelViewMatrix.copy(tmpMatrix);

		let renderRequired = false;

		// change axis orientation on marker - artoolkit say Z is normal to the marker - ar.js say Y is normal to the marker
		const markerAxisTransformMatrix = new THREE.Matrix4().makeRotationX(
			Math.PI / 2
		);
		modelViewMatrix.multiply(markerAxisTransformMatrix);

		// change this.parameters.group.matrix based on parameters.changeMatrixMode
		if (this.parameters.changeMatrixMode === "modelViewMatrix") {
			if (this.parameters.positioning.smooth) {
				let averages: number[] = []; // average values for matrix over last smoothCount
				let exceedsAverageTolerance = 0;

				this.smoothMatrices.push(modelViewMatrix.elements.slice()); // add latest

				if (
					this.smoothMatrices.length <
					this.parameters.positioning.smoothCount + 1
				) {
					markerObject.matrix.copy(modelViewMatrix); // not enough for average
				} else {
					this.smoothMatrices.shift(); // remove oldest entry
					averages = [];

					// loop over entries in matrix
					for (let i = 0; i < modelViewMatrix.elements.length; i++) {
						let sum = 0;

						// calculate average for this entry
						for (let j = 0; j < this.smoothMatrices.length; j++) {
							sum += this.smoothMatrices[j][i];
						}
						averages[i] = sum / this.parameters.positioning.smoothCount;
						// check how many elements vary from the average by at least AVERAGE_MATRIX_TOLERANCE
						const vary = Math.abs(averages[i] - modelViewMatrix.elements[i]);
						if (vary >= this.parameters.positioning.smoothTolerance) {
							exceedsAverageTolerance++;
						}
					}

					// if moving (i.e. at least AVERAGE_MATRIX_THRESHOLD
					// entries are over AVERAGE_MATRIX_TOLERANCE
					if (
						exceedsAverageTolerance >=
						this.parameters.positioning.smoothThreshold
					) {
						// then update matrix values to average, otherwise, don't render to minimize jitter
						for (let i = 0; i < modelViewMatrix.elements.length; i++) {
							modelViewMatrix.elements[i] = averages[i];
						}
						markerObject.matrix.copy(modelViewMatrix);
						renderRequired = true; // render required in animation loop
					}
				}
			} else {
				markerObject.matrix.copy(modelViewMatrix);
			}
			// this.parameters.group.matrix.copy(modelViewMatrix);
		} else if (this.parameters.changeMatrixMode === "cameraTransformMatrix") {
			markerObject.matrix.getInverse(modelViewMatrix);
		} else {
			throw Error();
		}

		// decompose - the matrix into .position, .quaternion, .scale
		markerObject.matrix.decompose(
			markerObject.position,
			markerObject.quaternion,
			markerObject.scale
		);

		return renderRequired;
	}
}

export default Controller;
