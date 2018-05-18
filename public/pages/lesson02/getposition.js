// Get your own Bing Maps API key at https://www.bingmapsportal.com, prior to publishing your Cesium application:
// Cesium.BingMapsApi.defaultKey = 'put your API key here';

// Construct the default list of terrain sources.
var terrainModels = Cesium.createDefaultTerrainProviderViewModels();

// Construct the viewer with just what we need for this base application
var viewer = new Cesium.Viewer('cesiumContainer', {
    timeline: false,
    animation: false,
    vrButton: true,
    sceneModePicker: false,
    infoBox: true,
    // scene3DOnly:true,
    // terrainProviderViewModels: terrainModels,
    // selectedTerrainProviderViewModel: terrainModels[1]  // Select STK high-res terrain
});

// No depth testing against the terrain to avoid z-fighting
viewer.scene.globe.depthTestAgainstTerrain = false;
viewer.extend(Cesium.viewerCesiumInspectorMixin);

var tileset = viewer.scene.primitives.add(Cesium.Model.fromGltf({
    modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 0.0)),
    url: '/models/campus_no_tree.gltf',
}));


Cesium.when(tileset.readyPromise).then(() => {

    viewer.scene.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 0.0),
    })
})


var step = 10;

function changeStep(stepin) {
    step = stepin;
}

function change(type) {
    var x = 0;
    var y = 0;
    var z = 0;

    switch (type) {
        case 0:
            x += step;
            break;
        case 1:
            x -= step;
            break;
        case 2:
            y += step;
            break;
        case 3:
            y -= step;
            break;
        case 4:
            z += step;
            break;
        case 5:
            z -= step;
            break;
    }

    //创建平移矩阵方法一
    // m = Cesium.Matrix4.fromArray([
    //     1.0, 0.0, 0.0, 0.0,
    //     0.0, 1.0, 0.0, 0.0,
    //     0.0, 0.0, 1.0, 0.0,
    //     x, y, z, 1.0
    // ]);

    //创建平移矩阵方法二
    // var gpos = Cesium.Matrix4.getTranslation(tileset.modelMatrix, new Cesium.Cartesian3());
    // var normalGPos = Cesium.Cartesian3.normalize(gpos, new Cesium.Cartesian3());
    // Cesium.Cartesian3.subtract(gpos, normalGPos, gpos);
    // //viewer.scene.globe.ellipsoid.cartesianToCartographic(gpos, lla);
    // Cesium.Matrix4.fromTranslation(gpos, tileset.modelMatrix);

    // var translation=Cesium.Cartesian3.fromArray([x, y, z]);
    // m= Cesium.Matrix4.fromTranslation(translation);

    // document.getElementById("result").innerText = "x:" + x + " y:" + y + " z:" + z;

    // tileset.modelMatrix = m;
    var translation = new Cesium.Cartesian3(x, y, z);
    Cesium.Matrix4.multiplyByTranslation(tileset.modelMatrix, translation, tileset.modelMatrix);


}

