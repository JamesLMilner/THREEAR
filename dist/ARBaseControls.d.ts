import { EventDispatcher } from "three";
export declare class ARBaseControls extends EventDispatcher {
    static id: number;
    protected id: number;
    protected object3d: any;
    constructor(object3d: any);
    update(): void;
    name(): void;
}
export default ARBaseControls;
