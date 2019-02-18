import { ARBaseControls } from "./ARBaseControls";
import * as THREE from "three";
import ARToolkit from "./ARToolkitAPI";
import ARController from "./ARController";

export class ARMarkerControls extends ARBaseControls {

	private context: any;
	private parameters: {
		size: number;
		type: "pattern" | "barcode" | "unknown"
		patternUrl: null | string;
		barcodeValue: null | string;
		changeMatrixMode: "modelViewMatrix" | "cameraTransformMatrix"
		minConfidence: number;
	};
	private _arucoPosit: any;

	constructor(context, object3d, parameters) {
		super(object3d);
		this.context = context;
		// handle default parameters
		this.parameters = {
			// size of the marker in meter
			size : 1,
			// type of marker - ['pattern', 'barcode', 'unknown' ]
			type : "unknown",
			// url of the pattern - IIF type='pattern'
			patternUrl: null,
			// value of the barcode - IIF type='barcode'
			barcodeValue : null,
			// change matrix mode - [modelViewMatrix, cameraTransformMatrix]
			changeMatrixMode : "modelViewMatrix",
			// minimal confidence in the marke recognition - between [0, 1] - default to 1
			minConfidence: 0.6,
		};

		this.setParameters(parameters);

		// create the marker Root
		this.object3d = object3d;
		this.object3d.matrixAutoUpdate = false;
		this.object3d.visible = false;

		context.addMarker(this);

		if (this.context.parameters.trackingBackend === "artoolkit" ) {
			this._initArtoolkit();
		} else if (this.context.parameters.trackingBackend === "aruco" ) {
			// TODO create a ._initAruco
			// put aruco second
			// this._arucoPosit = new POS.Posit(this.parameters.size, this.context.arucoContext.canvas.width)
		} else if (this.context.parameters.trackingBackend === "tango") {
			this._initTango();
		} else {
			console.assert(false);
		}
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

	public dispose() {
		this.context.removeMarker(this);
		// TODO remove the event listener if needed
		// unloadMaker ???
	}

	/**
	 * When you actually got a new modelViewMatrix, you need to perfom a whole bunch
	 * of things. it is done here.
	 */
	public updateWithModelViewMatrix(modelViewMatrix) {
		const markerObject3D = this.object3d;

		// mark object as visible
		markerObject3D.visible = true;

		if ( this.context.parameters.trackingBackend === "artoolkit" ) {
			// apply context._axisTransformMatrix - change artoolkit axis to match usual webgl one
			const tmpMatrix = new THREE.Matrix4().copy(this.context._artoolkitProjectionAxisTransformMatrix);
			tmpMatrix.multiply(modelViewMatrix);

			modelViewMatrix.copy(tmpMatrix);
		} else if ( this.context.parameters.trackingBackend === "aruco" ) {
			// ...
		} else if ( this.context.parameters.trackingBackend === "tango" ) {
			// ...
		} else {
			console.assert(false);
		}

		if (this.context.parameters.trackingBackend !== "tango") {

			// change axis orientation on marker - artoolkit say Z is normal to the marker - ar.js say Y is normal to the marker
			const markerAxisTransformMatrix = new THREE.Matrix4().makeRotationX(Math.PI / 2);
			modelViewMatrix.multiply(markerAxisTransformMatrix);
		}

		// change markerObject3D.matrix based on parameters.changeMatrixMode
		if (this.parameters.changeMatrixMode === "modelViewMatrix") {
			markerObject3D.matrix.copy(modelViewMatrix);
		} else if (this.parameters.changeMatrixMode === "cameraTransformMatrix") {
			markerObject3D.matrix.getInverse(modelViewMatrix);
		} else {
			throw Error();
		}

		// decompose - the matrix into .position, .quaternion, .scale
		markerObject3D.matrix.decompose(markerObject3D.position, markerObject3D.quaternion, markerObject3D.scale);

		// dispatchEvent
		this.dispatchEvent( { type: "markerFound" } );
	}

	/**
	 * provide a name for a marker
	 * - silly heuristic for now
	 * - should be improved
	 */
	public name() {
		let name = "";
		name += this.parameters.type;
		if ( this.parameters.type === "pattern" ) {
			const url = this.parameters.patternUrl;
			const basename = url.replace(/^.*\//g, "");
			name += " - " + basename;
		} else if (this.parameters.type === "barcode") {
			name += " - " + this.parameters.barcodeValue;
		} else {
			console.assert(false, "no .name() implemented for this marker controls");
		}
		return name;
	}

	public _initArtoolkit() {

		let artoolkitMarkerId = null;
		let delayedInitTimerId = setInterval(() => {

			// check if arController is init
			if (this.context.arController === null)	{
				return;
			}
			// stop looping if it is init
			clearInterval(delayedInitTimerId);
			delayedInitTimerId = null;
			// launch the _postInitArtoolkit
			postInit();
		}, 1000 / 50);

		const postInit = () => {

			// check if arController is init
			const arController: ARController = this.context.arController;
			arController.setLogLevel(1);

			// start tracking this pattern
			if (this.parameters.type === "pattern" ) {
				const onSuccess = (markerId) => {
					artoolkitMarkerId = markerId;
					arController.trackPatternMarkerId(
						artoolkitMarkerId,
						this.parameters.size
					);
				};
				const onError = (err) => {
					throw Error(err);
				};
				arController.loadMarker(this.parameters.patternUrl, onSuccess, onError);
			} else if ( this.parameters.type === "barcode" ) {
				artoolkitMarkerId = this.parameters.barcodeValue;
				arController.trackBarcodeMarkerId(artoolkitMarkerId, this.parameters.size);
			} else if ( this.parameters.type === "unknown" ) {
				artoolkitMarkerId = null;
			} else {
				throw Error("invalid marker type" + this.parameters.type);
			}

			// listen to the event
			arController.addEventListener("getMarker", (event) => {

				if (
					event.data.type === ARToolkit.PATTERN_MARKER &&
					this.parameters.type === "pattern"
				) {
					if (artoolkitMarkerId === null) {
						return;
					}
					if (event.data.marker.idPatt === artoolkitMarkerId) {
						onMarkerFound(event);
					}
				} else if (
					event.data.type === ARToolkit.BARCODE_MARKER &&
					this.parameters.type === "barcode"
				) {
					// console.log('BARCODE_MARKER idMatrix', event.data.marker.idMatrix, artoolkitMarkerId )
					if (artoolkitMarkerId === null ) {
						return;
					}
					if (event.data.marker.idMatrix === artoolkitMarkerId) {
						onMarkerFound(event);
					}
				} else if (
					event.data.type === ARToolkit.UNKNOWN_MARKER &&
					this.parameters.type === "unknown"
				) {
					onMarkerFound(event);
				}

			});

		};

		const onMarkerFound = (event) => {

			// honor his.parameters.minConfidence
			if (event.data.type === ARToolkit.PATTERN_MARKER && event.data.marker.cfPatt < this.parameters.minConfidence )	{
				return;
			}
			if (event.data.type === ARToolkit.BARCODE_MARKER && event.data.marker.cfMatt < this.parameters.minConfidence )	{
				return;
			}

			const modelViewMatrix = new THREE.Matrix4().fromArray(event.data.matrix);
			this.updateWithModelViewMatrix(modelViewMatrix);
		};

		return;
	}

}

export default ARMarkerControls;
