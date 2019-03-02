interface SourceParameters {
    camera: THREE.Camera | null;
    parent: HTMLElement;
    sourceType: "webcam" | "image" | "video";
    sourceUrl: string;
    deviceId: any;
    sourceWidth: number;
    sourceHeight: number;
    displayWidth: number;
    displayHeight: number;
    [key: string]: any;
}
export declare class Source {
    ready: boolean;
    private domElement;
    private parameters;
    private currentTorchStatus;
    constructor(parameters: SourceParameters);
    setParameters(parameters: SourceParameters): void;
    readonly renderer: any;
    readonly camera: import("three").Camera | null;
    init(onReady: () => any, onError: (error: any) => any): this;
    _initSourceImage(onReady: () => any): HTMLImageElement;
    _initSourceVideo(onReady: () => any): HTMLVideoElement;
    _initSourceWebcam(onReady: () => any, onError: (err: any) => any): HTMLVideoElement | null;
    hasMobileTorch(domElement: any): boolean;
    /**
     * toggle the flash/torch of the mobile fun if applicable.
     * Great post about it https://www.oberhofer.co/mediastreamtrack-and-its-capabilities/
     */
    toggleMobileTorch(domElement: any): void;
    onResizeElement(): void;
    copyElementSizeTo(otherElement: any): void;
}
export default Source;
