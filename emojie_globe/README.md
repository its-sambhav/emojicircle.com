Emoji Globe Demo

This is a single-file demo that renders a 3D globe built from emoji sprites using Three.js.

Files
- index.html — the demo. Open it in a modern browser to try the emoji globe.

How to run
1. Open `index.html` directly in Chrome, Firefox, or Edge.
	- If WebGL is disabled, the page shows a 2D fallback. Click "Try 3D anyway" after enabling hardware acceleration, or open with `?force3d=1`.
2. Drag to rotate, scroll to zoom. Use the density slider to change how many emoji appear.
3. Optional local server (can help with browser policies):
   
	```bash
	# from project root
	python3 -m http.server 8000
	# open http://localhost:8000/index.html
	```

Customizations
- Edit the `EMOJI_LIST` array in `index.html` to change which emoji are used.
- Change `EMOJI_COUNT` to adjust initial density.
- Tweak `SPRITE_SCALE` to make emoji larger or smaller.

Notes
- The page first tries local vendor files, then CDNs:
	- Local: `vendor/three/three.min.js` and `vendor/three/OrbitControls.js` (add real library files here for offline use)
	- CDNs: unpkg, jsDelivr, cdnjs
- If CDNs are blocked and local vendor files are placeholders, you will see an error. To fix:
	1. Download Three.js UMD build and OrbitControls and place them here:
		 - `vendor/three/three.min.js`
		 - `vendor/three/OrbitControls.js`
	2. Reload the page.
- Use `?force3d=1` to attempt 3D even if detection says WebGL is unavailable (useful right after enabling hardware acceleration).
- For best performance, reduce the emoji count or sprite size on slower devices.