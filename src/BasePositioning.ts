import { EventDispatcher, Object3D } from "three";

export class BasePositioning extends EventDispatcher {
    public static id = 0;
    protected id: number;
    protected object3d: any;

    constructor(object3d: Object3D) {
        super();
        this.id = BasePositioning.id++;
        this.object3d = object3d;
        this.object3d.matrixAutoUpdate = false;
        this.object3d.visible = false;
    }

    public update(targetObject3d?: any) {
        throw Error("update(): you need to implement your own update ");
    }

    public name() {
        throw Error("name(): Not yet implemented ");
    }

    // Events to honor
    // this.dispatchEvent({ type: 'becameVisible' })
    // this.dispatchEvent({ type: 'markerVisible' })	// replace markerFound
    // this.dispatchEvent({ type: 'becameUnVisible' })
}

export default BasePositioning;
