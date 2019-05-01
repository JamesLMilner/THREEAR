import { Object3D } from "three";
import { BaseMarker } from "./BaseMarker";

/**
 * BarcodeMarker take a given predtermined barcode as the pattern to detect. Each barcode has
 * a predetermined number, for example the 3x3 matrix has 64 possible markers. You can find copies
 * of these markers in the artoolkit GitHub repository. This approach is faster than using
 * PatternMarker. The barcodes can be used to place a three.js Object3D and pin it to
 * the barcode marker.
 * @param parameters parameters for determing things like the barcode number and the minimum confidence
 */

interface BarcodeMarkerParameters {
	barcodeValue: number;
	markerObject: Object3D;
	size?: number;
	minConfidence?: number;
}

export class BarcodeMarker extends BaseMarker {
	public static count = 0;
	public barcodeValue: number;
	public markerObject: Object3D;

	constructor(parameters: BarcodeMarkerParameters) {
		super(parameters);

		if (parameters.barcodeValue === undefined) {
			throw Error("Barcode Marker requires a barcodeValue to be passed");
		}

		if (parameters.markerObject === undefined) {
			throw Error("Barcode Marker requires a markerObject to be passed");
		}

		this.barcodeValue = parameters.barcodeValue;
		this.markerObject = parameters.markerObject;

		this.markerObject.visible = false;
	}
}

export default BarcodeMarker;
