export abstract class BaseMarker {
	public id: number;
	public size: number;
	public minConfidence: number;

	constructor(id: number, parameters: any) {
		this.id = id;
		this.size = parameters.size || 1;
		this.minConfidence = parameters.minConfidence || 0.6;
	}
}
