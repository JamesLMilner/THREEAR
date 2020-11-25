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
export class Source {
	public domElement: HTMLImageElement | HTMLVideoElement | undefined;
	private currentTorchStatus: boolean;
	private parameters: SourceParameters;

	constructor(parameters: Partial<SourceParameters>) {
		if (!parameters.renderer) {
			throw Error("ThreeJS Renderer is required");
		}

		if (!parameters.camera) {
			throw Error("ThreeJS Camera is required");
		}

		this.currentTorchStatus = false;

		// handle default parameters
		this.parameters = {
			parent: document.body,
			renderer: null,
			camera: null,
			// type of source - ['webcam', 'image', 'video']
			sourceType: "webcam",
			// url of the source - valid if sourceType = image|video
			sourceUrl: "",

			// Device id of the camera to use (optional)
			deviceId: null,

			facingMode: "environment",

			// resolution of at which we initialize in the source image
			sourceWidth: 640,
			sourceHeight: 480,
			// resolution displayed for the source
			displayWidth: 640,
			displayHeight: 480,
		};

		this.setParameters(parameters);
	}

	public setParameters(parameters: any) {
		if (!parameters) {
			return;
		}

		for (const key in parameters) {
			if (key) {
				const newValue = parameters[key];

				if (newValue === undefined) {
					console.warn(key + "' parameter is undefined.");
					continue;
				}

				const currentValue = (this.parameters as any)[key];

				if (currentValue === undefined) {
					console.warn(key + "' is not a property of this Source.");
					continue;
				}

				(this.parameters as any)[key] = newValue;
			}
		}
	}

	get renderer() {
		return this.parameters.renderer;
	}

	get camera() {
		return this.parameters.camera;
	}

	public dispose() {
		if (this.parameters.parent && this.domElement) {
			this.parameters.parent.removeChild(this.domElement);
		}
	}

	public initialize() {
		return new Promise((resolve, reject) => {
			const onReady = () => {
				if (!this.domElement) {
					reject("domElement not defined");
					return;
				}

				this.onResizeElement();
				this.parameters.parent.appendChild(this.domElement);
				resolve();
			};

			const onError = (message: Error | string) => {
				reject(message);
			};

			if (this.parameters.sourceType === "image") {
				this.domElement = this._initSourceImage(onReady, onError);
			} else if (this.parameters.sourceType === "video") {
				this.domElement = this._initSourceVideo(onReady, onError);
			} else if (this.parameters.sourceType === "webcam") {
				const webcam = this._initSourceWebcam(onReady, onError);
				if (!webcam) {
					reject("Webcam source could not be established");
					return;
				}
				this.domElement = webcam;
			} else {
				reject("Source type not recognised. Try: 'image', 'video', 'webcam'");
				return;
			}

			this.positionSourceDomElement();

			return this;
		});
	}

	/**
	 * Determine if the device supports torch capability
	 */
	public hasMobileTorch(domElement: HTMLVideoElement) {
		const stream = domElement.srcObject;

		if (stream instanceof MediaStream) {
			const videoTrack = stream.getVideoTracks()[0];

			// if videoTrack.getCapabilities() doesnt exist, return false now
			if (videoTrack.getCapabilities === undefined) {
				return false;
			}

			const capabilities = videoTrack.getCapabilities();

			return (capabilities as any).torch ? true : false;
		}

		return false;
	}

	/**
	 * Toggle the flash/torch of the mobile phone if possible.
	 * See: https://www.oberhofer.co/mediastreamtrack-and-its-capabilities/
	 */
	public toggleMobileTorch(domElement: HTMLVideoElement) {
		if (!this.hasMobileTorch(domElement) === true) {
			return;
		}

		const stream = domElement.srcObject;

		if (this.currentTorchStatus === undefined) {
			this.currentTorchStatus = false;
		}

		if (stream instanceof MediaStream) {
			const videoTrack = stream.getVideoTracks()[0];
			const capabilities = videoTrack.getCapabilities();

			// TypeScript doesn't recognise .torch
			if (!(capabilities as any).torch) {
				console.warn("Torch is not avaiable to be toggled");
				return;
			}

			// Toggle torch status
			this.currentTorchStatus = !this.currentTorchStatus;

			videoTrack
				.applyConstraints({
					advanced: [{ torch: this.currentTorchStatus } as any],
				})
				.catch((error: any) => {
					throw error;
				});
		}
	}

	public onResizeElement() {
		if (!this.domElement) {
			console.warn("Can't resize as domElement is not defined on source");
			return;
		}

		const screenWidth = window.innerWidth;
		const screenHeight = window.innerHeight;
		let sourceHeight = 0;
		let sourceWidth = 0;

		// compute sourceWidth, sourceHeight
		if (this.domElement instanceof HTMLImageElement) {
			sourceWidth = this.domElement.naturalWidth;
			sourceHeight = this.domElement.naturalHeight;
		} else if (this.domElement instanceof HTMLVideoElement) {
			sourceWidth = this.domElement.videoWidth;
			sourceHeight = this.domElement.videoHeight;
		}

		// compute sourceAspect
		const sourceAspect = sourceWidth / sourceHeight;
		// compute screenAspect
		const screenAspect = screenWidth / screenHeight;

		// if screenAspect < sourceAspect, then change the width, else change the height
		if (screenAspect < sourceAspect) {
			// compute newWidth and set .width/.marginLeft
			const newWidth = sourceAspect * screenHeight;
			this.domElement.style.width = newWidth + "px";
			this.domElement.style.marginLeft = -(newWidth - screenWidth) / 2 + "px";

			// init style.height/.marginTop to normal value
			this.domElement.style.height = screenHeight + "px";
			this.domElement.style.marginTop = "0px";
		} else {
			// compute newHeight and set .height/.marginTop
			const newHeight = 1 / (sourceAspect / screenWidth);
			this.domElement.style.height = newHeight + "px";
			this.domElement.style.marginTop = -(newHeight - screenHeight) / 2 + "px";

			// init style.width/.marginLeft to normal value
			this.domElement.style.width = screenWidth + "px";
			this.domElement.style.marginLeft = "0px";
		}
	}

	/**
	 * Copy the dimensions of the domElement of the source to another given domElement
	 * @param otherElement the target element to copy the size to, from the Source dom element
	 */
	public copyElementSizeTo(otherElement: any) {
		if (!this.domElement) {
			console.warn("Cant set size to match domElement as it is not defined");
			return;
		}

		if (window.innerWidth > window.innerHeight) {
			// landscape
			otherElement.style.width = this.domElement.style.width;
			otherElement.style.height = this.domElement.style.height;
			otherElement.style.marginLeft = this.domElement.style.marginLeft;
			otherElement.style.marginTop = this.domElement.style.marginTop;
		} else {
			// portrait
			otherElement.style.height = this.domElement.style.height;
			otherElement.style.width =
				(parseInt(otherElement.style.height, 10) * 4) / 3 + "px";
			otherElement.style.marginLeft =
				(window.innerWidth - parseInt(otherElement.style.width, 10)) / 2 + "px";
			otherElement.style.marginTop = 0;
		}
	}

	private _initSourceImage(
		onReady: () => any,
		onError: (message: string) => any
	) {
		if (!this.parameters.sourceUrl) {
			throw Error("No source URL provided");
		}

		const domElement = document.createElement("img");
		domElement.src = this.parameters.sourceUrl;

		domElement.width = this.parameters.sourceWidth;
		domElement.height = this.parameters.sourceHeight;
		domElement.style.width = this.parameters.displayWidth + "px";
		domElement.style.height = this.parameters.displayHeight + "px";

		domElement.onload = () => onReady();

		return domElement;
	}

	private _initSourceVideo(
		onReady: () => any,
		onError: (message: string) => any
	) {
		const domElement = document.createElement("video");
		domElement.src = this.parameters.sourceUrl;

		domElement.style.objectFit = "initial";

		domElement.autoplay = true;
		(domElement as any).webkitPlaysinline = true;
		domElement.controls = false;
		domElement.loop = true;
		domElement.muted = true;

		// trick to trigger the video on android
		document.body.addEventListener("click", function onClick() {
			document.body.removeEventListener("click", onClick);
			domElement.play();
		});

		domElement.width = this.parameters.sourceWidth;
		domElement.height = this.parameters.sourceHeight;
		domElement.style.width = this.parameters.displayWidth + "px";
		domElement.style.height = this.parameters.displayHeight + "px";

		// wait until the video stream is ready
		domElement.addEventListener(
			"loadeddata",
			() => {
				onReady();
			},
			false
		);
		return domElement;
	}

	private _initSourceWebcam(
		onReady: () => any,
		onError: (message: string) => any
	) {
		const domElement = document.createElement("video");
		domElement.setAttribute("autoplay", "");
		domElement.setAttribute("muted", "");
		domElement.setAttribute("playsinline", "");
		domElement.style.width = this.parameters.displayWidth + "px";
		domElement.style.height = this.parameters.displayHeight + "px";

		// check API is available
		if (
			navigator.mediaDevices === undefined ||
			navigator.mediaDevices.enumerateDevices === undefined ||
			navigator.mediaDevices.getUserMedia === undefined
		) {
			let fctName = "";
			if (navigator.mediaDevices === undefined) {
				fctName = "navigator.mediaDevices";
			} else if (navigator.mediaDevices.enumerateDevices === undefined) {
				fctName = "navigator.mediaDevices.enumerateDevices";
			} else if (navigator.mediaDevices.getUserMedia === undefined) {
				fctName = "navigator.mediaDevices.getUserMedia";
			}
			onError("WebRTC issue-! " + fctName + " not present in your browser");
			return;
		}

		// get available devices
		navigator.mediaDevices
			.enumerateDevices()
			.then((devices) => {
				const userMediaConstraints = {
					audio: false,
					video: {
						facingMode: this.parameters.facingMode,
						width: {
							ideal: this.parameters.sourceWidth,
						},
						height: {
							ideal: this.parameters.sourceHeight,
						},
					},
				};

				if (null !== this.parameters.deviceId) {
					(userMediaConstraints as any).video.deviceId = {
						exact: this.parameters.deviceId,
					};
				}

				// get a device which satisfy the constraints
				navigator.mediaDevices
					.getUserMedia(userMediaConstraints)
					.then(function success(stream) {
						// set the .src of the domElement
						domElement.srcObject = stream;
						// to start the video, when it is possible to start it only on userevent. like in android
						document.body.addEventListener("click", () => {
							domElement.play();
						});

						domElement.addEventListener("loadedmetadata", (event) => {
							onReady();
						});
					})
					.catch((error) => {
						onError(error);
					});
			})
			.catch((error) => {
				onError(error);
			});

		return domElement;
	}

	private positionSourceDomElement() {
		if (this.domElement) {
			this.domElement.style.position = "absolute";
			this.domElement.style.top = "0px";
			this.domElement.style.left = "0px";
			this.domElement.style.zIndex = "-2";
		}
	}
}

export default Source;
