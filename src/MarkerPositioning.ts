import { BasePositioning } from "./BasePositioning";
import * as THREE from "three";
import ARToolkit from "./artoolkit/ARToolKit";
import ARToolKitController from "./artoolkit/ARToolKitController";
import { Context } from "./THREEAR";
import { Object3D } from "three";

interface MarkerPositioningParameters {
  size: number;
  type: "pattern" | "barcode" | "unknown";
  patternUrl: null | string;
  barcodeValue: null | number;
  changeMatrixMode: "modelViewMatrix" | "cameraTransformMatrix";
  minConfidence: number;

  [key: string]: any;
}

export class MarkerPositioning extends BasePositioning {
  private context: any;
  private smoothMatrices: any[];
  private parameters: MarkerPositioningParameters;

  constructor(
    context: Context,
    object3d: Object3D,
    parameters: MarkerPositioningParameters
  ) {
    super(object3d);
    this.context = context;
    // handle default parameters
    this.parameters = {
      // size of the marker in meter
      size: 1,
      // type of marker - ['pattern', 'barcode', 'unknown' ]
      type: "unknown",
      // url of the pattern - IIF type='pattern'
      patternUrl: null,
      // value of the barcode - IIF type='barcode'
      barcodeValue: null,
      // change matrix mode - [modelViewMatrix, cameraTransformMatrix]
      changeMatrixMode: "modelViewMatrix",
      // minimal confidence in the marke recognition - between [0, 1] - default to 1
      minConfidence: 0.6,
      // turn on/off camera smoothing
      smooth: true,
      // number of matrices to smooth tracking over, more = smoother but slower follow
      smoothCount: 5,
      // distance tolerance for smoothing, if smoothThreshold # of matrices are under tolerance, tracking will stay still
      smoothTolerance: 0.01,
      // threshold for smoothing, will keep still unless enough matrices are over tolerance
      smoothThreshold: 2
    };

    this.setParameters(parameters);

    // create the marker Root
    this.object3d = object3d;
    this.object3d.matrixAutoUpdate = false;
    this.object3d.visible = false;

    this.smoothMatrices = []; // last DEBOUNCE_COUNT modelViewMatrix

    context.addMarker(this);

    this._initArtoolkit();
  }

  public setParameters(parameters: MarkerPositioningParameters) {
    if (!parameters) {
      return;
    }

    for (const key in parameters) {
      if (key) {
        const newValue = parameters[key];

        if (newValue === undefined) {
          console.warn(
            "THREEx.ArToolkitContext: '" + key + "' parameter is undefined."
          );
          continue;
        }

        const currentValue = this.parameters[key];

        if (currentValue === undefined) {
          console.warn(
            "THREEx.ArToolkitContext: '" +
              key +
              "' is not a property of this material."
          );
          continue;
        }

        this.parameters[key] = newValue;
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
  public updateWithModelViewMatrix(modelViewMatrix: THREE.Matrix4): boolean {
    const markerObject3D = this.object3d;

    // mark object as visible
    markerObject3D.visible = true;

    // apply context._axisTransformMatrix - change artoolkit axis to match usual webgl one
    const transformMatrix = this.context
      ._artoolkitProjectionAxisTransformMatrix;
    const tmpMatrix = new THREE.Matrix4().copy(transformMatrix);
    tmpMatrix.multiply(modelViewMatrix);

    modelViewMatrix.copy(tmpMatrix);

    let renderRequired = false;

    // change axis orientation on marker - artoolkit say Z is normal to the marker - ar.js say Y is normal to the marker
    const markerAxisTransformMatrix = new THREE.Matrix4().makeRotationX(
      Math.PI / 2
    );
    modelViewMatrix.multiply(markerAxisTransformMatrix);

    // change markerObject3D.matrix based on parameters.changeMatrixMode
    if (this.parameters.changeMatrixMode === "modelViewMatrix") {
      if (this.parameters.smooth) {
        let averages: number[] = []; // average values for matrix over last smoothCount
        let exceedsAverageTolerance = 0;

        this.smoothMatrices.push(modelViewMatrix.elements.slice()); // add latest

        if (this.smoothMatrices.length < this.parameters.smoothCount + 1) {
          markerObject3D.matrix.copy(modelViewMatrix); // not enough for average
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
            averages[i] = sum / this.parameters.smoothCount;
            // check how many elements vary from the average by at least AVERAGE_MATRIX_TOLERANCE
            const vary = Math.abs(averages[i] - modelViewMatrix.elements[i]);
            if (vary >= this.parameters.smoothTolerance) {
              exceedsAverageTolerance++;
            }
          }

          // if moving (i.e. at least AVERAGE_MATRIX_THRESHOLD
          // entries are over AVERAGE_MATRIX_TOLERANCE
          if (exceedsAverageTolerance >= this.parameters.smoothThreshold) {
            // then update matrix values to average, otherwise, don't render to minimize jitter
            for (let i = 0; i < modelViewMatrix.elements.length; i++) {
              modelViewMatrix.elements[i] = averages[i];
            }
            markerObject3D.matrix.copy(modelViewMatrix);
            renderRequired = true; // render required in animation loop
          }
        }
      } else {
        markerObject3D.matrix.copy(modelViewMatrix);
      }
      // markerObject3D.matrix.copy(modelViewMatrix);
    } else if (this.parameters.changeMatrixMode === "cameraTransformMatrix") {
      markerObject3D.matrix.getInverse(modelViewMatrix);
    } else {
      throw Error();
    }

    // decompose - the matrix into .position, .quaternion, .scale
    markerObject3D.matrix.decompose(
      markerObject3D.position,
      markerObject3D.quaternion,
      markerObject3D.scale
    );

    // dispatchEvent
    this.dispatchEvent({ type: "markerFound" });

    return renderRequired;
  }

  /**
   * provide a name for a marker
   * - silly heuristic for now
   * - should be improved
   */
  public name() {
    let name = "";
    name += this.parameters.type;
    if (this.parameters.type === "pattern") {
      const url = this.parameters.patternUrl || "";
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
    let artoolkitMarkerId: null | number = null;
    const delayedInitTimerId = setInterval(() => {
      // check if arController is init
      if (this.context.arController === null) {
        return;
      }
      // stop looping if it is init
      clearInterval(delayedInitTimerId);
      // launch the _postInitArtoolkit
      postInit();
    }, 1000 / 50);

    const postInit = () => {
      // check if arController is init
      const arController: ARToolKitController = this.context.arController;
      arController.setLogLevel(1);

      // start tracking this pattern
      if (this.parameters.type === "pattern") {
        const onSuccess = (markerId: number) => {
          artoolkitMarkerId = markerId;
          arController.trackPatternMarkerId(
            artoolkitMarkerId,
            this.parameters.size
          );
        };
        const onError = (err: any) => {
          throw Error(err);
        };
        if (this.parameters.patternUrl) {
          arController.loadMarker(
            this.parameters.patternUrl,
            onSuccess,
            onError
          );
        } else {
          throw Error("No patternUrl defined in parameters");
        }
      } else if (this.parameters.type === "barcode") {
        artoolkitMarkerId = this.parameters.barcodeValue;
        if (artoolkitMarkerId) {
          arController.trackBarcodeMarkerId(
            artoolkitMarkerId,
            this.parameters.size
          );
        } else {
          throw Error("No barcodeValue defined in parameters");
        }
      } else if (this.parameters.type === "unknown") {
        artoolkitMarkerId = null;
      } else {
        throw Error("invalid marker type" + this.parameters.type);
      }

      // listen to the event
      arController.addEventListener("getMarker", (event: any) => {
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
          if (artoolkitMarkerId === null) {
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

    const onMarkerFound = (event: any) => {
      // honor his.parameters.minConfidence
      if (
        event.data.type === ARToolkit.PATTERN_MARKER &&
        event.data.marker.cfPatt < this.parameters.minConfidence
      ) {
        return;
      }
      if (
        event.data.type === ARToolkit.BARCODE_MARKER &&
        event.data.marker.cfMatt < this.parameters.minConfidence
      ) {
        return;
      }

      const modelViewMatrix = new THREE.Matrix4().fromArray(event.data.matrix);
      this.updateWithModelViewMatrix(modelViewMatrix);
    };

    return;
  }
}

export default MarkerPositioning;
