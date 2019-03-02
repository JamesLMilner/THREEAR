import { Object3D } from "three";
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
