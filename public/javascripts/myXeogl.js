let model = new xeogl.GLTFModel({
    id: 'city',
    //src: '/models/adamHead.gltf',
    //src: '/models/2CylinderEngine.gltf',
    src: '/models/campus_no_tree.gltf',
    ghostEdgeThreshold: 20,
});

let scene = xeogl.scene;

let cameraControl = new xeogl.CameraControl();

let preEntity = undefined;

cameraControl.on('picked', e => {
    if (preEntity) preEntity.ghost = false;

    if (e.entity) {
        preEntity = e.entity;
        preEntity.ghost = true;
    }
});
