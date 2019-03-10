import { Object3D } from "three";

/**
 * BarcodeMarker take a given predtermined barcode as the pattern to detect. Each barcode has
 * a predetermined number, for example the 3x3 matrix has 64 possible markers. You can find copies
 * of these markers in the artoolkit GitHub repository. This approach is faster than using
 * PatternMarker. The barcodes can be used to place a three.js Object3D and pin it to
 * the barcode marker.
 * @param parameters parameters for determing things like the barcode number and the minimum confidence
 */
export class BarcodeMarker {
	public static markerCount = 0;
	public id: number;
	public size: number;
	public minConfidence: number;
	public barcodeValue: number;
	public markerObject: Object3D;

	constructor(parameters: any) {
		if (parameters.barcodeValue === undefined) {
			throw Error("Barcode Marker requires a barcodeValue to be passed");
		}

		if (parameters.markerObject === undefined) {
			throw Error("Barcode Marker requires a markerObject to be passed");
		}

		this.id = BarcodeMarker.markerCount++;
		this.size = parameters.size || 1;
		this.minConfidence = parameters.size || 0.6;
		this.barcodeValue = parameters.barcodeValue;
		this.markerObject = parameters.markerObject;

		this.markerObject.visible = false;
	}
}

export default BarcodeMarker;
