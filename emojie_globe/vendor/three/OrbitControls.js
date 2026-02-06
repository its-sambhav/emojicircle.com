(function (global) {
	if (!global || !global.THREE) {
		console.warn('OrbitControls: THREE.js not found on window.');
		return;
	}

	const THREE = global.THREE;
	const Vector2 = THREE.Vector2;
	const Vector3 = THREE.Vector3;
	const Quaternion = THREE.Quaternion;
	const Spherical = THREE.Spherical;
	const EventDispatcher = THREE.EventDispatcher;

	const STATE = {
		NONE: -1,
		ROTATE: 0,
		DOLLY: 1,
		TOUCH_ROTATE: 2,
		TOUCH_DOLLY: 3
	};

	const CHANGE_EVENT = { type: 'change' };
	const START_EVENT = { type: 'start' };
	const END_EVENT = { type: 'end' };
	const EPS = 1e-6;

	function OrbitControls(object, domElement) {
		EventDispatcher.call(this);

		if (!object) {
			throw new Error('OrbitControls: camera is required.');
		}

		this.object = object;
		this.domElement = domElement || global.document;

		this.enabled = true;
		this.target = new Vector3();

		this.minDistance = 0;
		this.maxDistance = Infinity;

		this.minPolarAngle = 0;
		this.maxPolarAngle = Math.PI;

		this.minAzimuthAngle = -Infinity;
		this.maxAzimuthAngle = Infinity;

		this.enableDamping = false;
		this.dampingFactor = 0.05;

		this.enableZoom = true;
		this.zoomSpeed = 1.0;

		this.enableRotate = true;
		this.rotateSpeed = 1.0;

		this.enablePan = false;
		this.panSpeed = 1.0;

		this.autoRotate = false;
		this.autoRotateSpeed = 2.0;

		this.enableKeys = false;
		this.listenToKeyEvents = function () {};

		this.screenSpacePanning = false;

		this.touches = {
			ONE: THREE.TOUCH ? THREE.TOUCH.ROTATE : 0,
			TWO: THREE.TOUCH ? THREE.TOUCH.DOLLY_PAN : 0
		};

		if (this.domElement && this.domElement.style) {
			this.domElement.style.touchAction = 'none';
		}

		const scope = this;

		const spherical = new Spherical();
		const sphericalDelta = new Spherical(0, 0, 0);
		let scale = 1;
		const panOffset = new Vector3();
		let zoomChanged = false;

		const rotateStart = new Vector2();
		const rotateEnd = new Vector2();
		const rotateDelta = new Vector2();

		const dollyStart = new Vector2();
		const dollyEnd = new Vector2();
		const dollyDelta = new Vector2();

		const pointerCache = new Map();

		const quat = new Quaternion().setFromUnitVectors(object.up, new Vector3(0, 1, 0));
		const quatInverse = quat.clone().invert();
		const lastPosition = new Vector3();
		const lastQuaternion = new Quaternion();

		let state = STATE.NONE;
		let touchInitialDistance = null;

		function getAutoRotationAngle() {
			return (2 * Math.PI / 60 / 60) * scope.autoRotateSpeed;
		}

		function getZoomScale() {
			return Math.pow(0.95, scope.zoomSpeed);
		}

		function rotateLeft(angle) {
			sphericalDelta.theta -= angle;
		}

		function rotateUp(angle) {
			sphericalDelta.phi -= angle;
		}

		function dollyIn(dollyScale) {
			if (!scope.enableZoom) return;
			scale /= dollyScale;
			zoomChanged = true;
		}

		function dollyOut(dollyScale) {
			if (!scope.enableZoom) return;
			scale *= dollyScale;
			zoomChanged = true;
		}

		function handleRotateStart(x, y) {
			rotateStart.set(x, y);
		}

		function handleRotateMove(x, y) {
			rotateEnd.set(x, y);
			rotateDelta.subVectors(rotateEnd, rotateStart).multiplyScalar(scope.rotateSpeed);

			const element = scope.domElement;
			const height = element && element.clientHeight ? element.clientHeight : global.innerHeight || 1;
			const width = element && element.clientWidth ? element.clientWidth : global.innerWidth || 1;

			rotateLeft((2 * Math.PI * rotateDelta.x) / width);
			rotateUp((2 * Math.PI * rotateDelta.y) / height);

			rotateStart.copy(rotateEnd);
		}

		function handleDollyStart(y) {
			dollyStart.set(0, y);
		}

		function handleDollyMove(y) {
			dollyEnd.set(0, y);
			dollyDelta.subVectors(dollyEnd, dollyStart);

			if (dollyDelta.y > 0) {
				dollyIn(getZoomScale());
			} else if (dollyDelta.y < 0) {
				dollyOut(getZoomScale());
			}

			dollyStart.copy(dollyEnd);
		}

		function handleTouchDistanceChange(distance) {
			if (touchInitialDistance === null) {
				touchInitialDistance = distance;
				return;
			}

			const delta = distance - touchInitialDistance;
			if (Math.abs(delta) < 0.5) return;

			if (delta > 0) {
				dollyOut(getZoomScale());
			} else {
				dollyIn(getZoomScale());
			}

			touchInitialDistance = distance;
		}

			function onPointerDown(event) {
			if (!scope.enabled) return;

				if (typeof event.preventDefault === 'function') {
					event.preventDefault();
				}

			scope.domElement.setPointerCapture(event.pointerId);
			pointerCache.set(event.pointerId, { x: event.clientX, y: event.clientY, type: event.pointerType });

			if (event.pointerType === 'touch') {
				if (pointerCache.size === 1) {
					state = STATE.TOUCH_ROTATE;
					const pointer = pointerCache.get(event.pointerId);
					handleRotateStart(pointer.x, pointer.y);
				} else if (pointerCache.size >= 2) {
					const pts = Array.from(pointerCache.values());
					const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
					touchInitialDistance = dist;
					state = STATE.TOUCH_DOLLY;
				}
			} else {
				if (event.button === 1) {
					state = STATE.DOLLY;
					handleDollyStart(event.clientY);
				} else {
					state = STATE.ROTATE;
					handleRotateStart(event.clientX, event.clientY);
				}
			}

			scope.dispatchEvent(START_EVENT);
		}

			function onPointerMove(event) {
			if (!scope.enabled) return;

			if (!pointerCache.has(event.pointerId)) return;
			pointerCache.set(event.pointerId, { x: event.clientX, y: event.clientY, type: event.pointerType });

			if (event.pointerType === 'touch') {
				if (pointerCache.size >= 2) {
					const pts = Array.from(pointerCache.values());
					const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
					handleTouchDistanceChange(dist);
				} else if (state === STATE.TOUCH_ROTATE) {
					const pointer = pointerCache.get(event.pointerId);
					handleRotateMove(pointer.x, pointer.y);
				}
					} else {
				if (state === STATE.ROTATE) {
					handleRotateMove(event.clientX, event.clientY);
				} else if (state === STATE.DOLLY) {
					handleDollyMove(event.clientY);
				}
			}

					if (typeof event.preventDefault === 'function') {
						event.preventDefault();
					}
		}

		function onPointerUp(event) {
			if (!scope.enabled) return;

			if (pointerCache.has(event.pointerId)) {
				pointerCache.delete(event.pointerId);
			}

			if (pointerCache.size === 1 && event.pointerType === 'touch') {
				const remaining = Array.from(pointerCache.values())[0];
				state = STATE.TOUCH_ROTATE;
				handleRotateStart(remaining.x, remaining.y);
			} else {
				state = STATE.NONE;
				touchInitialDistance = null;
			}

			try {
				scope.domElement.releasePointerCapture(event.pointerId);
			} catch (_err) {
				/* ignore */
			}

			scope.dispatchEvent(END_EVENT);
		}

		function onContextMenu(event) {
			if (scope.enabled) {
				event.preventDefault();
			}
		}

		function onWheel(event) {
			if (!scope.enabled || !scope.enableZoom) return;

			event.preventDefault();

			if (event.deltaY < 0) {
				dollyOut(getZoomScale());
			} else if (event.deltaY > 0) {
				dollyIn(getZoomScale());
			}

			scope.dispatchEvent(START_EVENT);
			scope.dispatchEvent(END_EVENT);
		}

		this.update = function () {
			const offset = new Vector3();

			const position = scope.object.position;
			offset.copy(position).sub(scope.target);

			offset.applyQuaternion(quat);
			spherical.setFromVector3(offset);

			if (scope.autoRotate && state === STATE.NONE) {
				rotateLeft(getAutoRotationAngle());
			}

			spherical.theta = Math.max(scope.minAzimuthAngle, Math.min(scope.maxAzimuthAngle, spherical.theta));
			spherical.phi = Math.max(scope.minPolarAngle, Math.min(scope.maxPolarAngle, spherical.phi));
			spherical.makeSafe();

			spherical.theta += sphericalDelta.theta;
			spherical.phi += sphericalDelta.phi;

			spherical.radius *= scale;
			spherical.radius = Math.max(scope.minDistance, Math.min(scope.maxDistance, spherical.radius));

			scope.target.add(panOffset);

			offset.setFromSpherical(spherical);
			offset.applyQuaternion(quatInverse);

			position.copy(scope.target).add(offset);
			scope.object.lookAt(scope.target);

			if (scope.enableDamping) {
				sphericalDelta.theta *= 1 - scope.dampingFactor;
				sphericalDelta.phi *= 1 - scope.dampingFactor;
			} else {
				sphericalDelta.set(0, 0, 0);
			}

			scale = 1;
			panOffset.set(0, 0, 0);

			if (
				zoomChanged ||
				lastPosition.distanceToSquared(scope.object.position) > EPS ||
				8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS
			) {
				scope.dispatchEvent(CHANGE_EVENT);
				lastPosition.copy(scope.object.position);
				lastQuaternion.copy(scope.object.quaternion);
				zoomChanged = false;
			}
		};

		this.dispose = function () {
			scope.domElement.removeEventListener('pointerdown', onPointerDown);
			scope.domElement.removeEventListener('pointermove', onPointerMove);
			scope.domElement.removeEventListener('pointerup', onPointerUp);
			scope.domElement.removeEventListener('pointercancel', onPointerUp);
			scope.domElement.removeEventListener('pointerleave', onPointerUp);
			scope.domElement.removeEventListener('wheel', onWheel);
			scope.domElement.removeEventListener('contextmenu', onContextMenu);
		};

		this.listenToKeyEvents = function () {
			return undefined;
		};

		scope.domElement.addEventListener('pointerdown', onPointerDown);
		scope.domElement.addEventListener('pointermove', onPointerMove, { passive: false });
		scope.domElement.addEventListener('pointerup', onPointerUp);
		scope.domElement.addEventListener('pointercancel', onPointerUp);
		scope.domElement.addEventListener('pointerleave', onPointerUp);
		scope.domElement.addEventListener('wheel', onWheel, { passive: false });
		scope.domElement.addEventListener('contextmenu', onContextMenu);
	}

	OrbitControls.prototype = Object.create(EventDispatcher.prototype);
	OrbitControls.prototype.constructor = OrbitControls;

	global.THREE.OrbitControls = OrbitControls;
})(typeof window !== 'undefined' ? window : this);