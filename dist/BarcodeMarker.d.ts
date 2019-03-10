import { Object3D } from "three";
/**
 * BarcodeMarker take a given predtermined barcode as the pattern to detect. Each barcode has
 * a predetermined number, for example the 3x3 matrix has 64 possible markers. You can find copies
 * of these markers in the artoolkit GitHub repository. This approach is faster than using
 * PatternMarker. The barcodes can be used to place a three.js Object3D and pin it to
 * the barcode marker.
 * @param parameters parameters for determing things like the barcode number and the minimum confidence
 */
export declare class BarcodeMarker {
    static markerCount: number;
    id: number;
    size: number;
    minConfidence: number;
    barcodeValue: number;
    markerObject: Object3D;
    constructor(parameters: any);
}
export default BarcodeMarker;
