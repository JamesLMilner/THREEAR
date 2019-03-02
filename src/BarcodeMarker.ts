import { Object3D } from "three";

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
