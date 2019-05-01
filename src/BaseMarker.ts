interface BaseMarkerParameters {
	size?: number;
	minConfidence?: number;
}

export abstract class BaseMarker {
	public id?: number;
	public size: number;
	public minConfidence: number;
	public found: boolean;
	public lastDetected?: Date;

	constructor(parameters: BaseMarkerParameters) {
		this.size = parameters.size || 1;
		this.minConfidence = parameters.minConfidence || 0.6;
		this.found = false;
	}
}
