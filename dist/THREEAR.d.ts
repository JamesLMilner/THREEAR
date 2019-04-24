import Source from "./Source";
import PatternMarker from "./PatternMarker";
import BarcodeMarker from "./BarcodeMarker";
import { Controller, ControllerParameters } from "./Controller";
declare let controller: Controller;
declare function initialize(
	parameters: Partial<ControllerParameters>
): Promise<any>;
export declare type Controller = typeof controller;
export { Source, initialize, PatternMarker, BarcodeMarker };
