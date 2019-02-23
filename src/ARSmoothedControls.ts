import ARBaseControls from "./ARBaseControls";

export class ARSmoothedControls extends ARBaseControls {

	private parameters: any;
	private _lastLerpStepAt: null | number;
	private _visibleStartedAt: null | number;
	private _unvisibleStartedAt: null | number;

	/**
	 * - lerp position/quaternino/scale
	 * - minDelayDetected
	 * - minDelayUndetected
	 * @param {[type]} object3d   [description]
	 * @param {[type]} parameters [description]
	 */
	constructor(object3d, parameters) {
		super(object3d);

		// copy parameters
		this.object3d.visible = false;

		this._lastLerpStepAt = null;
		this._visibleStartedAt = null;
		this._unvisibleStartedAt = null;

		// handle default parameters
		parameters = parameters || {};
		this.parameters = {
			// lerp coeficient for the position - between [0,1] - default to 1
			lerpPosition: 0.8,
			// lerp coeficient for the quaternion - between [0,1] - default to 1
			lerpQuaternion: 0.2,
			// lerp coeficient for the scale - between [0,1] - default to 1
			lerpScale: 0.7,
			// delay for lerp fixed steps - in seconds - default to 1/120
			lerpStepDelay: 1 / 60,
			// minimum delay the sub-control must be visible before this controls become visible - default to 0 seconds
			minVisibleDelay: 0.0,
			// minimum delay the sub-control must be unvisible before this controls become unvisible - default to 0 seconds
			minUnvisibleDelay: 0.2,
		};

		this.setParameters(parameters);
	}

	public setParameters(parameters) {

		if (!parameters) {
			return;
		}

		for (const key in parameters) {
			if (key) {
				const newValue = parameters[ key ];

				if (newValue === undefined) {
					console.warn( "THREEx.ArToolkitContext: '" + key + "' parameter is undefined." );
					continue;
				}

				const currentValue = this.parameters[key];

				if (currentValue === undefined) {
					console.warn( "THREEx.ArToolkitContext: '" + key + "' is not a property of this material." );
					continue;
				}

				this.parameters[ key ] = newValue;
			}
		}
	}

	public update(targetObject3d) {

		const parameters = this.parameters;
		const wasVisible = this.object3d.visible;
		const present = performance.now() / 1000;

		const snapDirectlyToTarget = () => {
			this.object3d.position.copy(targetObject3d.position);
			this.object3d.quaternion.copy(targetObject3d.quaternion);
			this.object3d.scale.copy(targetObject3d.scale);
		};

		const applyOneSlerpStep = () => {
			this.object3d.position.lerp(targetObject3d.position, parameters.lerpPosition);
			this.object3d.quaternion.slerp(targetObject3d.quaternion, parameters.lerpQuaternion);
			this.object3d.scale.lerp(targetObject3d.scale, parameters.lerpScale);
		};

		// handle object3d.visible with minVisibleDelay/minUnvisibleDelay

		if (targetObject3d.visible === false) {
			this._visibleStartedAt = null;
		}

		if (targetObject3d.visible === true) {
			this._unvisibleStartedAt = null;
		}

		if ( targetObject3d.visible === true && this._visibleStartedAt === null ) {
			this._visibleStartedAt = present;
		}

		if ( targetObject3d.visible === false && this._unvisibleStartedAt === null ) {
			this._unvisibleStartedAt = present;
		}

		if (wasVisible === false && targetObject3d.visible === true) {
			const visibleFor = present - this._visibleStartedAt;
			if ( visibleFor >= this.parameters.minVisibleDelay ) {
				this.object3d.visible = true;
				snapDirectlyToTarget();
			}
		}

		if (wasVisible === true && targetObject3d.visible === false) {
			const unvisibleFor = present - this._unvisibleStartedAt;

			if ( unvisibleFor >= this.parameters.minUnvisibleDelay ) {
				this.object3d.visible = false;
			}

		}

		// apply lerp on positon/quaternion/scale
		// apply lerp steps - require fix time steps to behave the same no matter the fps
		if ( this._lastLerpStepAt === null) {
			applyOneSlerpStep();
			this._lastLerpStepAt = present;
		} else {
			const nStepsToDo = Math.floor( (present - this._lastLerpStepAt) / this.parameters.lerpStepDelay );
			for (let i = 0; i < nStepsToDo; i++) {
				applyOneSlerpStep();
				this._lastLerpStepAt += this.parameters.lerpStepDelay;
			}
		}

		// disable the lerp by directly copying targetObject3d position/quaternion/scale
		// if (false) {
		// 	snapDirectlyToTarget();
		// }

		// update the matrix
		this.object3d.updateMatrix();

		// honor becameVisible event
		if (wasVisible === false && this.object3d.visible === true) {
			this.dispatchEvent({ type: "becameVisible" });
		}
		// honor becameUnVisible event
		if (wasVisible === true && this.object3d.visible === false) {
			this.dispatchEvent({ type: "becameUnVisible" });
		}

	}

}

export default ARSmoothedControls;
