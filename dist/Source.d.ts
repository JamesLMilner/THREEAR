interface SourceParameters {
	parent: HTMLElement;
	camera: THREE.Camera | null;
	renderer: THREE.WebGLRenderer | null;
	sourceType: "webcam" | "image" | "video";
	sourceUrl: string;
	facingMode: "user" | "environment";
	deviceId: any;
	sourceWidth: number;
	sourceHeight: number;
	displayWidth: number;
	displayHeight: number;
}
/**
 * Source describes how and where THREE AR should accept imagery to
 * track markers for. Images, Video and the Webcam can be used as sources.
 * @param parameters parameters for determining if it should come from a webcam or a video
 */
export declare class Source {
	domElement: HTMLImageElement | HTMLVideoElement | undefined;
	private currentTorchStatus;
	private parameters;
	constructor(parameters: Partial<SourceParameters>);
	setParameters(parameters: any): void;
	get renderer(): import("three").WebGLRenderer | null;
	get camera(): import("three").Camera | null;
	dispose(): void;
	initialize(): Promise<unknown>;
	/**
	 * Determine if the device supports torch capability
	 */
	hasMobileTorch(domElement: HTMLVideoElement): boolean;
	/**
	 * Toggle the flash/torch of the mobile phone if possible.
	 * See: https://www.oberhofer.co/mediastreamtrack-and-its-capabilities/
	 */
	toggleMobileTorch(domElement: HTMLVideoElement): void;
	onResizeElement(): void;
	/**
	 * Copy the dimensions of the domElement of the source to another given domElement
	 * @param otherElement the target element to copy the size to, from the Source dom element
	 */
	copyElementSizeTo(otherElement: any): void;
	private _initSourceImage;
	private _initSourceVideo;
	private _initSourceWebcam;
	private positionSourceDomElement;
}
export default Source;
