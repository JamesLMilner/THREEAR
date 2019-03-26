export abstract class BaseMarker {
	public id: number;
	public size: number;
	public minConfidence: number;
	public found: boolean;
	public lastDetected?: Date;

	constructor(id: number, parameters: any) {
		this.id = id;
		this.size = parameters.size || 1;
		this.minConfidence = parameters.minConfidence || 0.6;
		this.found = false;
	}
}
