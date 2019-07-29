interface BaseMarkerParameters {
	size?: number;
	minConfidence?: number;
}
export declare abstract class BaseMarker {
	id?: number;
	size: number;
	minConfidence: number;
	found: boolean;
	lastDetected?: Date;
	constructor(parameters: BaseMarkerParameters);
}
export {};
