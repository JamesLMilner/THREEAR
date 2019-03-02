import { EventDispatcher, Object3D } from "three";
export declare class BasePositioning extends EventDispatcher {
	static id: number;
	protected id: number;
	protected object3d: any;
	constructor(object3d: Object3D);
	update(targetObject3d?: any): void;
	name(): void;
}
export default BasePositioning;
