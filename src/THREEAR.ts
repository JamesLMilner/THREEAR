import Source from "./Source";
import PatternMarker from "./PatternMarker";
import BarcodeMarker from "./BarcodeMarker";
import { Controller, ControllerParameters } from "./Controller";

let controller: Controller;
function initialize(parameters: ControllerParameters) {
    if (!controller) {
        controller = new Controller(parameters);
    }
    return controller.ready;
}

export { Source, initialize, PatternMarker, BarcodeMarker };
