const SRC = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
let loading;
function loadThree() {
    const w = window;
    if (w.THREE)
        return Promise.resolve(w.THREE);
    loading ??= new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = SRC;
        s.crossOrigin = 'anonymous';
        s.onload = () => resolve(w.THREE);
        s.onerror = () => resolve(undefined);
        document.head.append(s);
    });
    return loading;
}
async function mountFigure(box, labels) {
    const THREE = await loadThree();
    if (!THREE || !box.isConnected)
        return false;
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true });
    }
    catch {
        return false;
    }
    const w0 = box.clientWidth || 400;
    const h0 = box.clientHeight || 500;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w0, h0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const canvas = renderer.domElement;
    canvas.className = 'fig-gl';
    canvas.setAttribute('aria-hidden', 'true');
    // Three r128 treats hex colours as linear, which washes everything out under sRGB output.
    // Every colour goes through lin() so what you pick is what you see.
    const lin = (hex) => new THREE.Color(hex).convertSRGBToLinear();
    const std = (hex, o = {}) => new THREE.MeshStandardMaterial({ color: lin(hex), roughness: 0.8, ...o });
    const flat = (hex) => new THREE.MeshBasicMaterial({ color: lin(hex) });
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const scene = new THREE.Scene();
    scene.background = lin(0x1d1b18);
    scene.fog = new THREE.Fog(lin(0x1d1b18), 12, 24);
    const camera = new THREE.PerspectiveCamera(34, w0 / h0, 0.1, 60);
    scene.add(new THREE.HemisphereLight(lin(0xfff1dc), lin(0x3a2a20), 0.9));
    const key = new THREE.DirectionalLight(lin(0xffe2c0), 1.15);
    key.position.set(-4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -4.5, right: 4.5, top: 4.5, bottom: -4.5 });
    key.shadow.bias = -0.0005;
    scene.add(key);
    const group = new THREE.Group();
    scene.add(group);
    const add = (parent, geo, mat, x = 0, y = 0, z = 0) => {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        m.castShadow = true;
        m.receiveShadow = true;
        parent.add(m);
        return m;
    };
    const tone = new THREE.Color();
    const dummy = new THREE.Object3D();
    /** Many small shapes in one draw call. place() fills in each one's position, size and colour. */
    const swarm = (parent, geo, mat, count, place) => {
        const im = new THREE.InstancedMesh(geo, mat, count);
        for (let i = 0; i < count; i++) {
            dummy.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
            place(i, dummy, tone);
            dummy.updateMatrix();
            im.setMatrixAt(i, dummy.matrix);
            im.setColorAt(i, tone);
        }
        im.castShadow = true;
        parent.add(im);
    };
    const hsl = (h, s, l) => tone.setHSL(h, s, l).convertSRGBToLinear();
    // Round platform.
    add(group, new THREE.CylinderGeometry(3.3, 3.4, 0.14, 96), std(0x3a342e, { roughness: 0.9 }), 0, -0.07, 0);
    // ---- The coffee tree in the middle ----
    const tips = [];
    add(group, new THREE.CylinderGeometry(0.05, 0.1, 1.4, 12), std(0x5a3a22), 0, 0.7, 0);
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.4;
        const y = 0.55 + i * 0.16;
        const len = 0.55 + rnd() * 0.25;
        const tip = [Math.cos(a) * len, y + len * 0.55, Math.sin(a) * len];
        const geo = new THREE.CylinderGeometry(0.014, 0.032, len * 1.15, 6);
        geo.rotateX(Math.PI / 2);
        const br = add(group, geo, std(0x5a3a22), tip[0] / 2, (y + tip[1]) / 2, tip[2] / 2);
        br.lookAt(tip[0], tip[1], tip[2]);
        tips.push(tip);
    }
    tips.push([0, 1.45, 0]);
    const leafGeo = new THREE.SphereGeometry(1, 10, 6);
    swarm(group, leafGeo, std(0xffffff, { roughness: 0.7 }), 90, (i, d, c) => {
        const t = tips[i % tips.length] ?? [0, 1.4, 0];
        d.position.set(t[0] + (rnd() - 0.5) * 0.55, t[1] + (rnd() - 0.3) * 0.3, t[2] + (rnd() - 0.5) * 0.55);
        d.scale.set(0.2 + rnd() * 0.08, 0.03, 0.1);
        hsl(0.3 + rnd() * 0.04, 0.55, 0.14 + rnd() * 0.1);
        c.copy(tone);
    });
    swarm(group, new THREE.SphereGeometry(0.05, 12, 8), std(0xffffff, { roughness: 0.35 }), 34, (i, d, c) => {
        const t = tips[i % tips.length] ?? [0, 1.4, 0];
        d.position.set(t[0] + (rnd() - 0.5) * 0.3, t[1] - 0.06 - rnd() * 0.12, t[2] + (rnd() - 0.5) * 0.3);
        d.scale.set(1, 1, 1);
        if (rnd() > 0.25)
            hsl(0.0, 0.75, 0.32);
        else
            hsl(0.22, 0.55, 0.3);
        c.copy(tone);
    });
    // ---- The ring: cherry -> bean -> grounds -> product ----
    const R = 2.25;
    const spots = [1.25, 1.75, 2.25, 2.75].map((k) => k * Math.PI);
    const ring = add(group, new THREE.TorusGeometry(R, 0.022, 8, 160), flat(0xf0c43a), 0, 0.03, 0);
    ring.rotation.x = Math.PI / 2;
    ring.castShadow = false;
    spots.forEach((s) => {
        const m = s + Math.PI / 4;
        const geo = new THREE.ConeGeometry(0.11, 0.3, 16);
        geo.rotateX(Math.PI / 2); // tip now points along +Z
        const arrow = add(group, geo, flat(0xf0c43a), Math.cos(m) * R, 0.05, Math.sin(m) * R);
        arrow.castShadow = false;
        arrow.lookAt(Math.cos(m) * R - Math.sin(m), 0.05, Math.sin(m) * R + Math.cos(m));
    });
    const orb = add(group, new THREE.SphereGeometry(0.075, 16, 12), flat(0xfff2b0), R, 0.12, 0);
    orb.castShadow = false;
    const label = (text) => {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 128;
        const x = c.getContext('2d');
        if (x) {
            x.fillStyle = 'rgba(20,19,15,.88)';
            x.fillRect(0, 0, 512, 128);
            x.strokeStyle = '#f0c43a';
            x.lineWidth = 6;
            x.strokeRect(3, 3, 506, 122);
            x.fillStyle = '#f1eee6';
            x.font = '700 62px "Be Vietnam Pro", Arial, sans-serif';
            x.textAlign = 'center';
            x.textBaseline = 'middle';
            x.fillText(text, 256, 68, 480);
        }
        const tex = new THREE.CanvasTexture(c);
        tex.encoding = THREE.sRGBEncoding;
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
        sp.scale.set(1.5, 0.375, 1);
        sp.renderOrder = 10;
        return sp;
    };
    const stage = (k, text, build) => {
        const a = spots[k] ?? 0;
        const g = new THREE.Group();
        g.position.set(Math.cos(a) * R, 0, Math.sin(a) * R);
        add(g, new THREE.CylinderGeometry(0.52, 0.56, 0.1, 48), std(0xe8e1d3, { roughness: 0.4 }), 0, 0.05, 0);
        const inner = new THREE.Group();
        inner.position.y = 0.1;
        build(inner);
        g.add(inner);
        const sp = label(text);
        sp.position.set(0, 1.25, 0);
        g.add(sp);
        group.add(g);
    };
    // 1. Cherries.
    stage(0, labels.fruit, (g) => {
        const red = std(0xc4271c, { roughness: 0.3 });
        const spotsR = [];
        for (let i = 0; i < 6; i++)
            spotsR.push([Math.cos((i / 6) * 6.28) * 0.2, 0.1, Math.sin((i / 6) * 6.28) * 0.2]);
        for (let i = 0; i < 3; i++)
            spotsR.push([Math.cos((i / 3) * 6.28 + 0.5) * 0.09, 0.22, Math.sin((i / 3) * 6.28 + 0.5) * 0.09]);
        spotsR.push([0, 0.32, 0]);
        spotsR.forEach(([x, y, z]) => add(g, new THREE.SphereGeometry(0.105, 18, 14), red, x, y, z));
        const leaf = add(g, leafGeo, std(0x2f6a1f), 0.28, 0.05, 0.2);
        leaf.scale.set(0.2, 0.03, 0.1);
        leaf.rotation.y = 0.6;
    });
    // 2. Roasted beans.
    stage(1, labels.bean, (g) => {
        swarm(g, new THREE.SphereGeometry(1, 14, 10), std(0xffffff, { roughness: 0.5 }), 40, (i, d, c) => {
            const r = 0.34 * Math.sqrt(rnd());
            const a = rnd() * Math.PI * 2;
            d.position.set(Math.cos(a) * r, 0.05 + (1 - r / 0.34) * 0.22 * (0.5 + rnd() * 0.5), Math.sin(a) * r);
            d.scale.set(0.09, 0.055, 0.065);
            hsl(0.06, 0.6, 0.12 + rnd() * 0.1);
            c.copy(tone);
        });
    });
    // 3. Spent grounds: a lumpy dark heap with fine crumbs.
    stage(2, labels.ground, (g) => {
        const bump = (x, y, z) => Math.sin(x * 7.1 + Math.sin(y * 5.3)) * Math.sin(y * 6.7 + Math.sin(z * 4.9)) * Math.sin(z * 8.3 + Math.sin(x * 3.7));
        const lump = (x, y, z) => 1 + 0.08 * bump(x * 3, y * 3, z * 3) + 0.03 * bump(x * 9, y * 9, z * 9);
        const r = 0.36;
        const geo = new THREE.SphereGeometry(r, 64, 32, 0, Math.PI * 2, 0, Math.PI / 2);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize();
            v.multiplyScalar(r * lump(v.x, v.y, v.z));
            pos.setXYZ(i, v.x, v.y, v.z);
        }
        geo.computeVertexNormals();
        const heap = add(g, geo, std(0x2a1a10, { roughness: 0.98 }));
        heap.scale.y = 0.65;
        swarm(g, new THREE.SphereGeometry(1, 6, 5), std(0xffffff, { roughness: 0.95 }), 500, (i, d, c) => {
            const phi = rnd() * Math.PI * 2;
            const ct = Math.random();
            const st = Math.sqrt(1 - ct * ct);
            const dx = st * Math.cos(phi);
            const dz = st * Math.sin(phi);
            const k = r * lump(dx, ct, dz) + 0.002;
            d.position.set(dx * k, ct * k * 0.65, dz * k);
            const s = 0.006 + rnd() * 0.008;
            d.scale.set(s * 1.2, s * 0.8, s);
            hsl(0.06, 0.45, 0.04 + rnd() * 0.07);
            c.copy(tone);
        });
    });
    // 4. Finished products: a cloth sachet and a candle.
    stage(3, labels.item, (g) => {
        const pts = [[0.001, 0], [0.22, 0.01], [0.3, 0.1], [0.3, 0.26], [0.22, 0.4], [0.1, 0.46], [0.08, 0.5], [0.14, 0.56], [0.1, 0.6], [0.001, 0.6]].map(([x, y]) => new THREE.Vector2(x, y));
        const pouch = add(g, new THREE.LatheGeometry(pts, 40), std(0xe9d9b8, { roughness: 0.92, side: THREE.DoubleSide }), -0.15, 0, 0);
        pouch.scale.set(0.75, 0.75, 0.75);
        const tie = add(g, new THREE.TorusGeometry(0.065, 0.012, 8, 24), std(0xb5523b), -0.15, 0.375, 0);
        tie.rotation.x = Math.PI / 2;
        add(g, new THREE.CylinderGeometry(0.12, 0.12, 0.22, 32), std(0xd9a860, { roughness: 0.25 }), 0.24, 0.11, 0.04);
        const flame = add(g, new THREE.ConeGeometry(0.035, 0.12, 12), flat(0xffc860), 0.24, 0.29, 0.04);
        flame.castShadow = false;
    });
    box.append(canvas);
    let spin = 0.3;
    let drag = false;
    let lastX = 0;
    let visible = true;
    const onDown = (e) => { drag = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); };
    const onMove = (e) => { if (drag) {
        spin += (e.clientX - lastX) * 0.012;
        lastX = e.clientX;
    } };
    const onUp = () => { drag = false; };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    const io = new IntersectionObserver((e) => { visible = e[0]?.isIntersecting ?? true; });
    io.observe(box);
    /** Pull the camera back until the whole ring fits, whatever shape the frame is. */
    const fit = () => {
        const w = box.clientWidth;
        const h = box.clientHeight;
        if (w < 2 || h < 2)
            return;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        const seenH = Math.max(7.4 / camera.aspect, 5.6);
        const dist = seenH / 2 / Math.tan((camera.fov / 2) * (Math.PI / 180));
        const e = 0.62;
        camera.position.set(0, 0.5 + dist * Math.sin(e), dist * Math.cos(e));
        camera.lookAt(0, 0.45, 0);
        camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    fit();
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const stop = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        renderer.dispose();
        renderer.forceContextLoss();
    };
    const frame = (now) => {
        if (!box.isConnected) {
            stop();
            return;
        }
        if (visible && !document.hidden) {
            if (!drag && !still)
                spin += 0.003;
            group.rotation.y = spin;
            const a = (now / 1000) * 0.6;
            orb.position.set(Math.cos(a) * R, 0.12, Math.sin(a) * R);
            renderer.render(scene, camera);
        }
        if (!still)
            raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    // Hide the picture underneath once the live scene is on screen.
    box.querySelector('img')?.classList.add('broken');
    return true;
}

export { mountFigure };
