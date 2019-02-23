interface ARSourceParameters {
    sourceType: "webcam" | "image" | "video";
    sourceUrl: null | string;
    deviceId: any;
    sourceWidth: number;
    sourceHeight: number;
    displayWidth: number;
    displayHeight: number;
    [key: string]: any;
}
export declare class ARSource {
    ready: boolean;
    private domElement;
    private parameters;
    private currentTorchStatus;
    constructor(parameters: ARSourceParameters);
    setParameters(parameters: ARSourceParameters): void;
    init(onReady: () => any, onError: () => any): this;
    _initSourceImage(onReady: () => any): HTMLImageElement;
    _initSourceVideo(onReady: () => any): HTMLVideoElement;
    _initSourceWebcam(onReady: () => any, onError: (err: any) => any): HTMLVideoElement;
    hasMobileTorch(domElement: any): boolean;
    /**
     * toggle the flash/torch of the mobile fun if applicable.
     * Great post about it https://www.oberhofer.co/mediastreamtrack-and-its-capabilities/
     */
    toggleMobileTorch(domElement: any): void;
    domElementWidth(): number;
    domElementHeight(): number;
    onResizeElement(): void;
    copyElementSizeTo(otherElement: any): void;
    onResize(arToolkitContext: any, renderer: any, camera: any): any;
}
export default ARSource;
