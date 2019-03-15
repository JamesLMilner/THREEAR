interface SourceParameters {
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
	private domElement;
	private parameters;
	private currentTorchStatus;
	constructor(parameters: SourceParameters);
	setParameters(parameters: any): void;
	readonly renderer: import("three").WebGLRenderer | null;
	readonly camera: import("three").Camera | null;
	initialize(): Promise<{}>;
	hasMobileTorch(domElement: any): boolean;
	/**
	 * toggle the flash/torch of the mobile fun if applicable.
	 * Great post about it https://www.oberhofer.co/mediastreamtrack-and-its-capabilities/
	 */
	toggleMobileTorch(domElement: any): void;
	onResizeElement(): void;
	copyElementSizeTo(otherElement: any): void;
	private _initSourceImage;
	private _initSourceVideo;
	private _initSourceWebcam;
}
export default Source;
