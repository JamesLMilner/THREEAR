import ARToolkit from "./ARToolkitAPI";
import * as THREE from "three";
import { ARMarkerControls } from "./ARMarkerControls";
import ARCameraParam from "./ARCameraParam";
import { ARController } from "./ARController";

export class ARContext extends THREE.EventDispatcher {

	private parameters: any;
	private arController: any;
	private _arMarkerControls: any;
	private _updatedAt: any;
	private initialized: boolean;
	private _artoolkitProjectionAxisTransformMatrix: any;

	constructor(parameters: any) {
		super();
		// handle default parameters
		this.parameters = {
			// debug - true if one should display artoolkit debug canvas, false otherwise
			debug: false,
			// the mode of detection - ['color', 'color_and_matrix', 'mono', 'mono_and_matrix']
			detectionMode: "mono",
			// type of matrix code - valid iif detectionMode end with 'matrix' -
			// [3x3, 3x3_HAMMING63, 3x3_PARITY65, 4x4, 4x4_BCH_13_9_3, 4x4_BCH_13_5_5]
			matrixCodeType: "3x3",

			// url of the camera parameters
			cameraParametersUrl: "../data/camera_para.dat",

			// tune the maximum rate of pose detection in the source image
			maxDetectionRate: 60,
			// resolution of at which we detect pose in the source image
			canvasWidth: 640,
			canvasHeight: 480,

			// the patternRatio inside the artoolkit marker - artoolkit only
			patternRatio: 0.5,

			// enable image smoothing or not for canvas copy - default to true
			// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled
			imageSmoothingEnabled : false
		};

		this.initialized = false;
		this.arController = null;
		this._updatedAt = null;
		this._arMarkerControls = [];
		this.setParameters(parameters);
	}

	public setParameters(parameters) {

		if (!parameters) {
			return;
		}

		for (const key in parameters) {
			if (key) {
				const newValue = parameters[ key ];

				if (newValue === undefined) {
					console.warn( "THREEx.ArToolkitContext: '" + key + "' parameter is undefined." );
					continue;
				}

				const currentValue = this.parameters[key];

				if (currentValue === undefined) {
					console.warn( "THREEx.ArToolkitContext: '" + key + "' is not a property of this material." );
					continue;
				}

				this.parameters[ key ] = newValue;
			}
		}
	}

	public init(onCompleted: () => void) {

		const done = () => {
			// dispatch event
			this.dispatchEvent({
				type: "initialized",
			});

			this.initialized = true;

			if (onCompleted) {
				onCompleted();
			}
		};

		this._initArtoolkit(done);

	}

	public update(srcElement) {

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
		this._arMarkerControls.forEach((markerControls) => {
			markerControls.object3d.visible = false;
		});

		// process this frame
		this._updateArtoolkit(srcElement);

		// dispatch event
		this.dispatchEvent({
			type: "sourceProcessed",
		});

		// return true as we processed the frame
		return true;
	}

	public addMarker(arMarkerControls) {
		console.assert(arMarkerControls instanceof ARMarkerControls);
		this._arMarkerControls.push(arMarkerControls);
	}

	public removeMarker(arMarkerControls) {
		console.assert(arMarkerControls instanceof ARMarkerControls);
		const index = this._arMarkerControls.indexOf(arMarkerControls);
		this._arMarkerControls.splice(index, 1);
	}

	public _initArtoolkit(onCompleted) {
		// set this._artoolkitProjectionAxisTransformMatrix to change artoolkit
		// projection matrix axis to match usual` webgl one
		this._artoolkitProjectionAxisTransformMatrix = new THREE.Matrix4();
		this._artoolkitProjectionAxisTransformMatrix.multiply(new THREE.Matrix4().makeRotationY(Math.PI));
		this._artoolkitProjectionAxisTransformMatrix.multiply(new THREE.Matrix4().makeRotationZ(Math.PI));
		// get cameraParameters
		const cameraParameters = new ARCameraParam(
			this.parameters.cameraParametersUrl,
			() => {

				// init controller
				const arController = new ARController(
					this.parameters.canvasWidth,
					this.parameters.canvasHeight,
					cameraParameters
				);
				this.arController = arController;

				// honor this.parameters.imageSmoothingEnabled
				(arController.ctx as any).mozImageSmoothingEnabled = this.parameters.imageSmoothingEnabled;
				(arController.ctx as any).webkitImageSmoothingEnabled = this.parameters.imageSmoothingEnabled;
				(arController.ctx as any).msImageSmoothingEnabled = this.parameters.imageSmoothingEnabled;
				arController.ctx.imageSmoothingEnabled = this.parameters.imageSmoothingEnabled;

				// honor this.parameters.debug
				if (this.parameters.debug === true) {
					arController.debugSetup();
					arController.canvas.style.position = "absolute";
					arController.canvas.style.top = "0px";
					arController.canvas.style.opacity = "0.6";
					arController.canvas.style.pointerEvents = "none";
					arController.canvas.style.zIndex = "-1";
				}

				// setPatternDetectionMode
				const detectionModes = {
					color : ARToolkit.AR_TEMPLATE_MATCHING_COLOR,
					color_and_matrix : ARToolkit.AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX,
					mono : ARToolkit.AR_TEMPLATE_MATCHING_MONO,
					mono_and_matrix	: ARToolkit.AR_TEMPLATE_MATCHING_MONO_AND_MATRIX,
				};
				const detectionMode = detectionModes[this.parameters.detectionMode];
				arController.setPatternDetectionMode(detectionMode);

				// setMatrixCodeType
				const matrixCodeTypes = {
					"3x3" : ARToolkit.AR_MATRIX_CODE_3x3,
					"3x3_HAMMING63" : ARToolkit.AR_MATRIX_CODE_3x3_HAMMING63,
					"3x3_PARITY65" : ARToolkit.AR_MATRIX_CODE_3x3_PARITY65,
					"4x4" : ARToolkit.AR_MATRIX_CODE_4x4,
					"4x4_BCH_13_9_3": ARToolkit.AR_MATRIX_CODE_4x4_BCH_13_9_3,
					"4x4_BCH_13_5_5": ARToolkit.AR_MATRIX_CODE_4x4_BCH_13_5_5,
				};
				const matrixCodeType = matrixCodeTypes[this.parameters.matrixCodeType];
				arController.setMatrixCodeType(matrixCodeType);

				// set the patternRatio for artoolkit
				arController.setPattRatio(this.parameters.patternRatio);

				// set thresholding in artoolkit
				// this seems to be the default
				// arController.setThresholdMode(artoolkit.AR_LABELING_THRESH_MODE_MANUAL)
				// adatative consume a LOT of cpu...
				// arController.setThresholdMode(artoolkit.AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE)
				// arController.setThresholdMode(artoolkit.AR_LABELING_THRESH_MODE_AUTO_OTSU)

				// notify
				onCompleted();
			},
			(err) => {
				throw err;
				// onerror
			}
		);

		return this;

	}

	public getProjectionMatrix(srcElement) {

		console.assert(this.arController, "arController MUST be initialized to call this function");
		// get projectionMatrixArr from artoolkit
		const projectionMatrixArr = this.arController.getCameraMatrix();
		const projectionMatrix = new THREE.Matrix4().fromArray(projectionMatrixArr);

		// apply context._axisTransformMatrix - change artoolkit axis to match usual webgl one
		projectionMatrix.multiply(this._artoolkitProjectionAxisTransformMatrix);

		// return the result
		return projectionMatrix;

	}

	private _updateArtoolkit(srcElement) {
		this.arController.process(srcElement);
	}

}

export default ARContext;
