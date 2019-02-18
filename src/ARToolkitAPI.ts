import Module from "./vendor/artoolkitx";

export class ARToolkit {
	public static AR_TEMPLATE_MATCHING_COLOR: any;
	public static AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX: any;
	public static AR_TEMPLATE_MATCHING_MONO: any;
	public static AR_TEMPLATE_MATCHING_MONO_AND_MATRIX: any;
	public static AR_MATRIX_CODE_3x3: any;
	public static AR_MATRIX_CODE_3x3_HAMMING63: any;
	public static AR_MATRIX_CODE_3x3_PARITY65: any;
	public static AR_MATRIX_CODE_4x4: any;
	public static AR_MATRIX_CODE_4x4_BCH_13_9_3: any;
	public static AR_MATRIX_CODE_4x4_BCH_13_5_5: any;
	public static HEAPU8: any;

	public static UNKNOWN_MARKER = -1;
	public static PATTERN_MARKER = 0;
	public static BARCODE_MARKER = 1;

	public static markerInfo: any;
	public static multiEachMarkerInfo: any;

	public static setup: (width: number, height: number, cameraParamId: any) => any;
	public static teardown: (id: number) => any;
	public static setupAR2: () => any;
	public static setLogLevel: (mode: any) => any;
	public static getLogLevel: () => any;
	public static setDebugMode: (id: number, mode: boolean) => any;
	public static getDebugMode: (id: number) => any;
	public static getProcessingImage: (id: number) => any;
	public static setMarkerInfoDir: (id: number, markerIndex: number, dir: any) => any;
	public static setMarkerInfoVertex: (id: number, markerIndex: number) => any;
	public static getTransMatSquare: (id: number, markerUID: number, markerWidth: number) => any;
	public static getTransMatSquareCont: (id: any, markerUID: number, markerWidth) => any;
	public static getTransMatMultiSquare: (id: any, markerUID: number) => any;
	public static getTransMatMultiSquareRobust: (id: number, i: number) => any;
	public static getMultiMarkerNum: (id: number, multiId: number) => any;
	public static getMultiMarkerCount: (id: number) => any;
	public static detectMarker: (id: number) => any;
	public static getMarkerNum: (id: number) => any;
	public static getMarker: (id: number, markerIndex: number) => any;
	public static getMultiEachMarker: (id: number, multiMarkerId: number, markerIndex: number) => any;
	public static detectNFTMarker: (id: number) => any;
	public static setProjectionNearPlane: (id: number, value: any) => any;
	public static getProjectionNearPlane: (id: number) => any;
	public static setProjectionFarPlane: (id: number, value: any) => any;
	public static getProjectionFarPlane: (id: number) => any;
	public static setThresholdMode: (id: number, mode: any) => any;
	public static getThresholdMode: (id: number) => any;
	public static setThreshold: (id: number, threshold: number) => any;
	public static getThreshold: (id: number) => any;
	public static setPatternDetectionMode: (id: number, mode: any) => any;
	public static getPatternDetectionMode: (id: number) => any;
	public static setMatrixCodeType: (id: number, type: any) => any;
	public static getMatrixCodeType: (id: number) => any;
	public static setLabelingMode: (id: number, mode: any) => any;
	public static getLabelingMode: (id: number) => any;
	public static setPattRatio: (id: number, ratio: number) => any;
	public static getPattRatio: (id: number) => any;
	public static setImageProcMode: (id: number, mode: any) => any;
	public static getImageProcMode: (id: number) => any;

	public static FUNCTIONS = [
		"setup",
		"teardown",

		"setupAR2",

		"setLogLevel",
		"getLogLevel",

		"setDebugMode",
		"getDebugMode",

		"getProcessingImage",

		"setMarkerInfoDir",
		"setMarkerInfoVertex",

		"getTransMatSquare",
		"getTransMatSquareCont",

		"getTransMatMultiSquare",
		"getTransMatMultiSquareRobust",

		"getMultiMarkerNum",
		"getMultiMarkerCount",

		"detectMarker",
		"getMarkerNum",

		"detectNFTMarker",

		"getMarker",
		"getMultiEachMarker",
		"getNFTMarker",

		"setProjectionNearPlane",
		"getProjectionNearPlane",

		"setProjectionFarPlane",
		"getProjectionFarPlane",

		"setThresholdMode",
		"getThresholdMode",

		"setThreshold",
		"getThreshold",

		"setPatternDetectionMode",
		"getPatternDetectionMode",

		"setMatrixCodeType",
		"getMatrixCodeType",

		"setLabelingMode",
		"getLabelingMode",

		"setPattRatio",
		"getPattRatio",

		"setImageProcMode",
		"getImageProcMode",
	];

	public static markerCount = 0;
	public static multiMarkerCount = 0;
	public static cameraCount = 0;

	public static getMarkerInfo() {
		return Module.markerInfo;
	}

	public static deleteCamera(id: number) {
		throw Error("deleteCamera not implemented");
		// TODO: This was never implemented
	}

	public static loadCamera(url, callback, onerror) {
		const filename = "/camera_param_" + ARToolkit.cameraCount++;
		const writeCallback = () => {
			const id = Module._loadCamera(filename);
			if (callback) {
				callback(id);
			}
		};
		if (typeof url === "object") { // Maybe it's a byte array
			ARToolkit.writeByteArrayToFS(filename, url, writeCallback);
		} else if (url.indexOf("\n") > -1) { // Or a string with the camera param
			ARToolkit.writeStringToFS(filename, url, writeCallback);
		} else {
			ARToolkit.ajax(url, filename, writeCallback);
		}
	}

	public static getFrameMalloc() {
		return Module.frameMalloc;
	}

	public static runtimeLoad() {
		ARToolkit.FUNCTIONS.forEach((n) => {
			ARToolkit[n] = Module[n];
		});

		ARToolkit.HEAPU8 = Module.HEAPU8;

		for (const m in Module) {
			if (m.match(/^AR/)) {
				ARToolkit[m] = Module[m];
			}
		}
	}

	public static addMarker(arId, url, callback, onError) {
		const filename = "/marker_" + ARToolkit.markerCount++;
		ARToolkit.ajax(url, filename, () => {
			const id = Module._addMarker(arId, filename);
			if (callback) {
				callback(id);
			}
		});
	}

	public static addNFTMarker(arId, url, callback) {
		const mId = ARToolkit.markerCount++;
		const prefix = "/markerNFT_" + mId;
		const filename1 = prefix + ".fset";
		const filename2 = prefix + ".iset";
		const filename3 = prefix + ".fset3";
		ARToolkit.ajax(url + ".fset", filename1, () => {
			ARToolkit.ajax(url + ".iset", filename2, () => {
				ARToolkit.ajax(url + ".fset3", filename3, () => {
					const id = Module._addNFTMarker(arId, prefix);
					if (callback) { callback(id); }
				});
			});
		});
	}

	public static bytesToString(array) {
		return String.fromCharCode.apply(String, array);
	}

	public static parseMultiFile(bytes) {
		const str = this.bytesToString(bytes);
		const lines = str.split("\n");
		const files = [];

		let state = 0; // 0 - read,
		let markers = 0;

		lines.forEach((line) => {
			line = line.trim();
			if (!line || line.startsWith("#")) {
				return;
			}

			switch (state) {
				case 0:
					markers = +line;
					state = 1;
					return;
				case 1: // filename or barcode
					if (!line.match(/^\d+$/)) {
						files.push(line);
					}
				case 2: // width
				case 3: // matrices
				case 4:
					state++;
					return;
				case 5:
					state = 1;
					return;
			}
		});

		return files;
	}

	public static addMultiMarker(arId, url, callback, onError) {
		const filename = "/multi_marker_" + ARToolkit.multiMarkerCount++;
		ARToolkit.ajax(url, filename, (bytes) => {
			let files = this.parseMultiFile(bytes);

			const ok = () => {
				const markerID = Module._addMultiMarker(arId, filename);
				const markerNum = Module.getMultiMarkerNum(arId, markerID);
				if (callback) {
					callback(markerID, markerNum);
				}
			};

			if (!files.length) {
				return ok();
			}

			const path = url.split("/").slice(0, -1).join("/");
			files = files.map((file) => {
				return [path + "/" + file, file];
			});

			ARToolkit.ajaxDependencies(files, ok);
		});
	}

	// transfer image
	public static writeStringToFS(target, string, callback) {
		const byteArray = new Uint8Array(string.length);
		for (let i = 0; i < byteArray.length; i++) {
			byteArray[i] = string.charCodeAt(i) & 0xff;
		}
		ARToolkit.writeByteArrayToFS(target, byteArray, callback);
	}

	public static writeByteArrayToFS(target, byteArray, callback) {
		Module.FS.writeFile(target, byteArray, { encoding: "binary" });
		callback(byteArray);
	}

	// Eg.
	// 	ajax('../bin/Data2/markers.dat', '/Data2/markers.dat', callback);
	// 	ajax('../bin/Data/patt.hiro', '/patt.hiro', callback);

	public static ajax(url, target, callback) {
		const oReq = new XMLHttpRequest();
		oReq.open("GET", url, true);
		oReq.responseType = "arraybuffer"; // blob arraybuffer

		oReq.onload = () => {
			const arrayBuffer = oReq.response;
			const byteArray = new Uint8Array(arrayBuffer);
			ARToolkit.writeByteArrayToFS(target, byteArray, callback);
		};

		oReq.send();
	}

	public static ajaxDependencies(files, callback) {
		const next = files.pop();
		if (next) {
			ARToolkit.ajax(next[0], next[1], () => {
				ARToolkit.ajaxDependencies(files, callback);
			});
		} else {
			callback();
		}
	}

}

ARToolkit.runtimeLoad();

export default ARToolkit;
