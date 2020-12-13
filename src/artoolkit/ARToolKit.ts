import * as Module from "./lib/arjs.artoolkit.min.js";

export class ARToolKit {
	public static AR_DEBUG_DISABLE: number = 0;
	public static AR_DEBUG_ENABLE: number = 1;
	public static AR_DEFAULT_DEBUG_MODE: number = 0;
	public static AR_DEFAULT_IMAGE_PROC_MODE: number = 0;
	public static AR_DEFAULT_LABELING_MODE: number = 1;
	public static AR_DEFAULT_LABELING_THRESH: number = 100;
	public static AR_DEFAULT_MARKER_EXTRACTION_MODE: number = 2;
	public static AR_DEFAULT_PATTERN_DETECTION_MODE: number = 0;
	public static AR_IMAGE_PROC_FIELD_IMAGE: number = 1;
	public static AR_IMAGE_PROC_FRAME_IMAGE: number = 0;
	public static AR_LABELING_BLACK_REGION: number = 1;
	public static AR_LABELING_THRESH_MODE_AUTO_ADAPTIVE: number = 3;
	public static AR_LABELING_THRESH_MODE_AUTO_MEDIAN: number = 1;
	public static AR_LABELING_THRESH_MODE_AUTO_OTSU: number = 2;
	public static AR_LABELING_THRESH_MODE_MANUAL: number = 0;
	public static AR_LABELING_WHITE_REGION: number = 0;
	public static AR_LOG_LEVEL_DEBUG: number = 0;
	public static AR_LOG_LEVEL_ERROR: number = 3;
	public static AR_LOG_LEVEL_INFO: number = 1;
	public static AR_LOG_LEVEL_REL_INFO: number = 4;
	public static AR_LOG_LEVEL_WARN: number = 2;
	public static AR_LOOP_BREAK_THRESH: number = 0;
	public static AR_MARKER_INFO_CUTOFF_PHASE_HEURISTIC_TROUBLESOME_MATRIX_CODES: number = 9;
	public static AR_MARKER_INFO_CUTOFF_PHASE_MATCH_BARCODE_EDC_FAIL: number = 5;
	public static AR_MARKER_INFO_CUTOFF_PHASE_MATCH_BARCODE_NOT_FOUND: number = 4;
	public static AR_MARKER_INFO_CUTOFF_PHASE_MATCH_CONFIDENCE: number = 6;
	public static AR_MARKER_INFO_CUTOFF_PHASE_MATCH_CONTRAST: number = 3;
	public static AR_MARKER_INFO_CUTOFF_PHASE_MATCH_GENERIC: number = 2;
	public static AR_MARKER_INFO_CUTOFF_PHASE_NONE: number = 0;
	public static AR_MARKER_INFO_CUTOFF_PHASE_PATTERN_EXTRACTION: number = 1;
	public static AR_MARKER_INFO_CUTOFF_PHASE_POSE_ERROR: number = 7;
	public static AR_MARKER_INFO_CUTOFF_PHASE_POSE_ERROR_MULTI: number = 8;
	public static AR_MATRIX_CODE_3x3: number = 3;
	public static AR_MATRIX_CODE_3x3_HAMMING63: number = 515;
	public static AR_MATRIX_CODE_3x3_PARITY65: number = 259;
	public static AR_MATRIX_CODE_4x4: number = 4;
	public static AR_MATRIX_CODE_4x4_BCH_13_5_5: number = 1028;
	public static AR_MATRIX_CODE_4x4_BCH_13_9_3: number = 772;
	public static AR_MATRIX_CODE_DETECTION: number = 2;
	public static AR_MAX_LOOP_COUNT: number = 5;
	public static AR_NOUSE_TRACKING_HISTORY: number = 1;
	public static AR_TEMPLATE_MATCHING_COLOR: number = 0;
	public static AR_TEMPLATE_MATCHING_COLOR_AND_MATRIX: number = 3;
	public static AR_TEMPLATE_MATCHING_MONO: number = 1;
	public static AR_TEMPLATE_MATCHING_MONO_AND_MATRIX: number = 4;
	public static AR_USE_TRACKING_HISTORY: number = 0;
	public static AR_USE_TRACKING_HISTORY_V2: number = 2;

	public static HEAPU8 = Module.HEAPU8;

	public static UNKNOWN_MARKER = -1;
	public static PATTERN_MARKER = 0;
	public static BARCODE_MARKER = 1;

	public static markerInfo: any;
	public static multiEachMarkerInfo: any;

	public static setup: (
		width: number,
		height: number,
		cameraParamId: any
	) => any = Module.setup;
	public static teardown: (id: number) => any = Module.teardown;
	public static setupAR2: () => any = Module.setupAR2;
	public static setLogLevel: (mode: any) => any = Module.setLogLevel;
	public static getLogLevel: () => any = Module.getLogLevel;
	public static setDebugMode: (id: number, mode: number) => any =
		Module.setDebugMode;
	public static getDebugMode: (id: number) => any = Module.getDebugMode;
	public static getProcessingImage: (id: number) => any =
		Module.getProcessingImage;
	public static setMarkerInfoDir: (
		id: number,
		markerIndex: number,
		dir: any
	) => any = Module.setMarkerInfoDir;
	public static setMarkerInfoVertex: (id: number, markerIndex: number) => any =
		Module.setMarkerInfoVertex;
	public static getTransMatSquare: (
		id: number,
		markerUID: number,
		markerWidth: number
	) => any = Module.getTransMatSquare;
	public static getTransMatSquareCont: (
		id: any,
		markerUID: number,
		markerWidth: number
	) => any = Module.getTransMatSquareCont;
	public static getTransMatMultiSquare: (id: any, markerUID: number) => any =
		Module.getTransMatMultiSquare;
	public static getTransMatMultiSquareRobust: (id: number, i: number) => any =
		Module.getTransMatMultiSquareRobust;
	public static getMultiMarkerNum: (id: number, multiId: number) => any =
		Module.getMultiMarkerNum;
	public static getMultiMarkerCount: (id: number) => any =
		Module.getMultiMarkerCount;
	public static detectMarker: (id: number) => any = Module.detectMarker;
	public static getMarkerNum: (id: number) => any = Module.getMarkerNum;
	public static getMarker: (id: number, markerIndex: number) => any =
		Module.getMarker;
	public static getMultiEachMarker: (
		id: number,
		multiMarkerId: number,
		markerIndex: number
	) => any = Module.getMultiEachMarker;
	public static detectNFTMarker: (id: number) => any = Module.detectNFTMarker;
	public static setProjectionNearPlane: (id: number, value: any) => any =
		Module.setProjectionNearPlane;
	public static getProjectionNearPlane: (id: number) => any =
		Module.getProjectionNearPlane;
	public static setProjectionFarPlane: (id: number, value: any) => any =
		Module.setProjectionFarPlane;
	public static getProjectionFarPlane: (id: number) => any =
		Module.getProjectionFarPlane;
	public static setThresholdMode: (id: number, mode: any) => any =
		Module.setThresholdMode;
	public static getThresholdMode: (id: number) => any = Module.getThresholdMode;
	public static setThreshold: (id: number, threshold: number) => any =
		Module.setThreshold;
	public static getThreshold: (id: number) => any = Module.getThreshold;
	public static setPatternDetectionMode: (id: number, mode: any) => any =
		Module.setPatternDetectionMode;
	public static getPatternDetectionMode: (id: number) => any =
		Module.getPatternDetectionMode;
	public static setMatrixCodeType: (id: number, type: any) => any =
		Module.setMatrixCodeType;
	public static getMatrixCodeType: (id: number) => any =
		Module.getMatrixCodeType;
	public static setLabelingMode: (id: number, mode: any) => any =
		Module.setLabelingMode;
	public static getLabelingMode: (id: number) => any = Module.getLabelingMode;
	public static setPattRatio: (id: number, ratio: number) => any =
		Module.setPattRatio;
	public static getPattRatio: (id: number) => any = Module.getPattRatio;
	public static setImageProcMode: (id: number, mode: any) => any =
		Module.setImageProcMode;
	public static getImageProcMode: (id: number) => any = Module.getImageProcMode;

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

	public static loadCamera(
		url: string | Uint8Array,
		callback: (id: number) => any,
		onerror: (err: any) => any
	) {
		const filename = "/camera_param_" + ARToolKit.cameraCount++;
		const writeCallback = () => {
			const id = Module._loadCamera(filename);
			if (callback) {
				callback(id);
			}
		};
		if (typeof url === "object") {
			// Maybe it's a byte array
			ARToolKit.writeByteArrayToFS(filename, url, writeCallback);
		} else if (url.indexOf("\n") > -1) {
			// Or a string with the camera param
			ARToolKit.writeStringToFS(filename, url, writeCallback);
		} else {
			ARToolKit.ajax(url, filename, writeCallback);
		}
	}

	public static getFrameMalloc() {
		return Module.frameMalloc;
	}

	public static addMarker(
		arId: number,
		url: string,
		callback: (id: number) => any,
		onError: (err: any) => any
	) {
		const filename = "/marker_" + ARToolKit.markerCount++;
		ARToolKit.ajax(url, filename, () => {
			const id = Module._addMarker(arId, filename);
			if (callback) {
				callback(id);
			}
		});
	}

	public static addNFTMarker(
		arId: number,
		url: string,
		callback: (id: number) => any,
		onError: () => any
	) {
		const mId = ARToolKit.markerCount++;
		const prefix = "/markerNFT_" + mId;
		const filename1 = prefix + ".fset";
		const filename2 = prefix + ".iset";
		const filename3 = prefix + ".fset3";
		ARToolKit.ajax(url + ".fset", filename1, () => {
			ARToolKit.ajax(url + ".iset", filename2, () => {
				ARToolKit.ajax(url + ".fset3", filename3, () => {
					const id = Module._addNFTMarker(arId, prefix);
					if (callback) {
						callback(id);
					}
				});
			});
		});
	}

	public static bytesToString(array: Uint8Array) {
		return String.fromCharCode.apply(String, Array.from(array));
	}

	public static parseMultiFile(bytes: Uint8Array) {
		const str = this.bytesToString(bytes);
		const lines = str.split("\n");
		const files: any[] = [];

		let state = 0; // 0 - read,

		lines.forEach((line: string) => {
			line = line.trim();
			if (!line || line.startsWith("#")) {
				return;
			}

			switch (state) {
				case 0:
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

	public static addMultiMarker(
		arId: number,
		url: string,
		callback: (id: number, markerNum: any) => any,
		onError: () => any
	) {
		const filename = "/multi_marker_" + ARToolKit.multiMarkerCount++;
		ARToolKit.ajax(url, filename, (bytes: Uint8Array) => {
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

			ARToolKit.ajaxDependencies(files, ok);
		});
	}

	// transfer image
	public static writeStringToFS(
		filename: string,
		string: string,
		callback: () => any
	) {
		const byteArray = new Uint8Array(string.length);
		for (let i = 0; i < byteArray.length; i++) {
			byteArray[i] = string.charCodeAt(i) & 0xff;
		}
		ARToolKit.writeByteArrayToFS(filename, byteArray, callback);
	}

	public static writeByteArrayToFS(
		filename: string,
		byteArray: Uint8Array,
		callback: (byteArray: Uint8Array) => any
	) {
		Module.FS.writeFile(filename, byteArray, { encoding: "binary" });
		callback(byteArray);
	}

	// Eg.
	// 	ajax('../bin/Data2/markers.dat', '/Data2/markers.dat', callback);
	// 	ajax('../bin/Data/patt.hiro', '/patt.hiro', callback);
	public static ajax(
		url: string,
		filename: string,
		callback: (bytes: Uint8Array) => any
	) {
		const oReq = new XMLHttpRequest();
		oReq.open("GET", url, true);
		oReq.responseType = "arraybuffer"; // blob arraybuffer

		oReq.onload = () => {
			const arrayBuffer = oReq.response;
			const byteArray = new Uint8Array(arrayBuffer);
			ARToolKit.writeByteArrayToFS(filename, byteArray, callback);
		};

		oReq.send();
	}

	public static ajaxDependencies(files: any[], callback: () => any) {
		const next = files.pop();
		if (next) {
			ARToolKit.ajax(next[0], next[1], () => {
				ARToolKit.ajaxDependencies(files, callback);
			});
		} else {
			callback();
		}
	}
}

export default ARToolKit;
