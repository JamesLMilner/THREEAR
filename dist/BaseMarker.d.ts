export declare abstract class BaseMarker {
    id: number;
    size: number;
    minConfidence: number;
    found: boolean;
    lastDetected?: Date;
    constructor(id: number, parameters: any);
}
