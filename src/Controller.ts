import ARToolkit from "./artoolkit/ARToolKit";
import * as THREE from "three";
import ARToolKitCameraParam from "./artoolkit/ARToolKitCameraParam";
import { ARToolKitController } from "./artoolkit/ARToolKitController";
import { WebGLRenderer, Object3D } from "three";
import { Source } from "./THREEAR";
import { PatternMarker } from "./PatternMarker";
import { BarcodeMarker } from "./BarcodeMarker";

export interface MarkerPositioningParameters {
    smooth: boolean;
    smoothCount: 5;
    smoothTolerance: 0.01;
    smoothThreshold: 2;
}

export interface ControllerParameters {
    source: Source;
    positioning: MarkerPositioningParameters;
    debug: boolean;
    changeMatrixMode: "modelViewMatrix" | "cameraTransformMatrix";
    detectionMode: "color" | "color_and_matrix" | "mono" | "mono_and_matrix";
    matrixCodeType: string;
    cameraParametersUrl: "../data/camera_para.dat";
    maxDetectionRate: number;
    canvasWidth: number;
    canvasHeight: number;
    patternRatio: number;
    imageSmoothingEnabled: boolean;
}

const enum Statuses {
    UNINITIALIZED = "UNINITIALIZED",
    INITIALIZING = "INITIALIZING",
    INITIALIZED = "INITIALIZED"
}

interface Markers {
    pattern: PatternMarker[];
    barcode: BarcodeMarker[];
}

export class Controller extends THREE.EventDispatcher {
    public status: Statuses;
    public ready: Promise<any>;
    private parameters: ControllerParameters;
    private arController: ARToolKitController | null;
    private smoothMatrices: any[];
    private _updatedAt: any;
    private _artoolkitProjectionAxisTransformMatrix: any;
    private _markers: Markers;
    // private contextError = "Canvas 2D Context was not available";

    constructor(parameters: ControllerParameters) {
        if (!parameters.source) {
            throw Error("Source must be provided");
        }

        super();

        // handle default parameters
        this.parameters = {
            source: parameters.source,

            changeMatrixMode: "modelViewMatrix",

            // handle default parameters
            positioning: {
                // turn on/off camera smoothing
                smooth: true,
                // number of matrices to smooth tracking over, more = smoother but slower follow
                smoothCount: 5,
                // distance tolerance for smoothing, if smoothThreshold # of matrices are under tolerance, tracking will stay still
                smoothTolerance: 0.01,
                // threshold for smoothing, will keep still unless enough matrices are over tolerance
                smoothThreshold: 2
            },

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
            imageSmoothingEnabled: false
        };

        // create the marker Root
        // this.parameters.group.matrixAutoUpdate = false;
        // this.parameters.group.visible = false;
        this._markers = {
            pattern: [],
            barcode: []
        };

        this.smoothMatrices = []; // last DEBOUNCE_COUNT modelViewMatrix
        this.status = Statuses.UNINITIALIZED;
        this.arController = null;
        this._updatedAt = null;
        this.setParameters(parameters);

        this.ready = this.initialize();
    }

    public setParameters(parameters: any) {
        if (!parameters) {
            return;
        }

        for (const key in parameters) {
            if (key) {
                const newValue = parameters[key];

                if (newValue === undefined) {
                    console.warn(
                        "THREEx.ArToolkitContext: '" +
                            key +
                            "' parameter is undefined."
                    );
                    continue;
                }

                const currentValue = (this.parameters as any)[key];

                if (currentValue === undefined) {
                    console.warn(
                        "THREEx.ArToolkitContext: '" +
                            key +
                            "' is not a property of this material."
                    );
                    continue;
                }

                (this.parameters as any)[key] = newValue;
            }
        }
    }

    public onResize(renderer: WebGLRenderer) {
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
        this._markers.pattern.forEach(m => (m.markerObject.visible = false));
        this._markers.barcode.forEach(m => (m.markerObject.visible = false));

        // process this frame
        this.arController.process(srcElement);

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

    private initialize() {
        if (this.status !== Statuses.UNINITIALIZED) {
            console.warn("Controller was already initialised");
            return Promise.resolve();
        }

        this.status = Statuses.INITIALIZING;

        return new Promise((resolve, reject) => {
            this.parameters.source.init(
                () => {
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
                            camera.projectionMatrix.copy(
                                this.getProjectionMatrix()
                            );
                        } else {
                            throw Error("Camera is not defined");
                        }

                        // dispatch event
                        this.dispatchEvent({
                            type: "initialized"
                        });

                        this.status = Statuses.INITIALIZED;
                        resolve(this);
                    });
                },
                error => {
                    throw error;
                }
            );
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
                    color: ARToolkit.AR_TEMPLATE_MATCHING_COLOR,
                    color_and_matrix:
                        ARToolkit.AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX,
                    mono: ARToolkit.AR_TEMPLATE_MATCHING_MONO,
                    mono_and_matrix:
                        ARToolkit.AR_TEMPLATE_MATCHING_MONO_AND_MATRIX
                };
                const detectionMode =
                    detectionModes[this.parameters.detectionMode];
                this.arController.setPatternDetectionMode(detectionMode);

                // setMatrixCodeType
                const matrixCodeTypes: any = {
                    "3x3": ARToolkit.AR_MATRIX_CODE_3x3,
                    "3x3_HAMMING63": ARToolkit.AR_MATRIX_CODE_3x3_HAMMING63,
                    "3x3_PARITY65": ARToolkit.AR_MATRIX_CODE_3x3_PARITY65,
                    "4x4": ARToolkit.AR_MATRIX_CODE_4x4,
                    "4x4_BCH_13_9_3": ARToolkit.AR_MATRIX_CODE_4x4_BCH_13_9_3,
                    "4x4_BCH_13_5_5": ARToolkit.AR_MATRIX_CODE_4x4_BCH_13_5_5
                };
                const matrixCodeType =
                    matrixCodeTypes[this.parameters.matrixCodeType];
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

    private getProjectionMatrix() {
        // get projectionMatrixArr from artoolkit
        const controller = this.arController as ARToolKitController;
        const projectionMatrixArr = Array.from(controller.getCameraMatrix());
        const projectionMatrix = new THREE.Matrix4().fromArray(
            projectionMatrixArr
        );

        // apply context._axisTransformMatrix - change artoolkit axis to match usual webgl one
        projectionMatrix.multiply(this._artoolkitProjectionAxisTransformMatrix);

        // return the result
        return projectionMatrix;
    }

    private trackPatternMarker(marker: PatternMarker) {
        if (this.arController === null) {
            return;
        }

        this._markers.pattern.push(marker);

        let patternMarkerId: number | null = null;

        // start tracking this pattern
        const onSuccess = (markerId: number) => {
            patternMarkerId = markerId;
            (this.arController as any).trackPatternMarkerId(
                markerId,
                marker.size
            );
        };
        const onError = (err: any) => {
            throw Error(err);
        };
        if (marker.patternUrl) {
            this.arController.loadMarker(marker.patternUrl, onSuccess, onError);
        } else {
            throw Error("No patternUrl defined in parameters");
        }

        // listen to the event
        this.arController.addEventListener("getMarker", (event: any) => {
            if (event.data.type === ARToolkit.PATTERN_MARKER) {
                if (event.data.marker.idPatt === patternMarkerId) {
                    this.onMarkerFound(
                        event,
                        marker.minConfidence,
                        marker.markerObject
                    );
                }
            }
        });
    }

    private trackBarcode(marker: BarcodeMarker) {
        if (this.arController === null) {
            return;
        }

        this._markers.barcode.push(marker);

        let barcodeMarkerId: number | null = null;

        if (marker.barcodeValue !== undefined) {
            barcodeMarkerId = marker.barcodeValue;
            this.arController.trackBarcodeMarkerId(
                barcodeMarkerId,
                marker.size
            );
        } else {
            throw Error("No barcodeValue defined in parameters");
        }

        this.arController.addEventListener("getMarker", (event: any) => {
            // console.log(event.data.type === ARToolkit.BARCODE_MARKER);
            if (event.data.type === ARToolkit.BARCODE_MARKER) {
                // console.log(event.data.marker, barcodeMarkerId);
                if (event.data.marker.idMatrix === barcodeMarkerId) {
                    this.onMarkerFound(
                        event,
                        marker.minConfidence,
                        marker.markerObject
                    );
                }
            }
        });
    }

    private onMarkerFound(
        event: any,
        minConfidence: number,
        markerObject: Object3D
    ) {
        // honor his.parameters.minConfidence
        if (
            event.data.type === ARToolkit.PATTERN_MARKER &&
            event.data.marker.cfPatt < minConfidence
        ) {
            return;
        }

        if (
            event.data.type === ARToolkit.BARCODE_MARKER &&
            event.data.marker.cfMatt < minConfidence
        ) {
            return;
        }

        const modelViewMatrix = new THREE.Matrix4().fromArray(
            event.data.matrix
        );
        this.updateWithModelViewMatrix(modelViewMatrix, markerObject);
    }

    /**
     * When you actually got a new modelViewMatrix, you need to perfom a whole bunch
     * of things. it is done here.
     */
    private updateWithModelViewMatrix(
        modelViewMatrix: THREE.Matrix4,
        markerObject: Object3D
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
                        averages[i] =
                            sum / this.parameters.positioning.smoothCount;
                        // check how many elements vary from the average by at least AVERAGE_MATRIX_TOLERANCE
                        const vary = Math.abs(
                            averages[i] - modelViewMatrix.elements[i]
                        );
                        if (
                            vary >= this.parameters.positioning.smoothTolerance
                        ) {
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
                        for (
                            let i = 0;
                            i < modelViewMatrix.elements.length;
                            i++
                        ) {
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
        } else if (
            this.parameters.changeMatrixMode === "cameraTransformMatrix"
        ) {
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

        // dispatchEvent
        this.dispatchEvent({ type: "markerFound" });

        return renderRequired;
    }
}

export default Controller;
