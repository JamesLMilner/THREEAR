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
export declare class BarcodeMarker extends BaseMarker {
	static count: number;
	barcodeValue: number;
	markerObject: Object3D;
	constructor(parameters: BarcodeMarkerParameters);
}
export default BarcodeMarker;
