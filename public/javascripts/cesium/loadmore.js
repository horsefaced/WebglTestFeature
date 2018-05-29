(() => {

    let viewer = new Cesium.Viewer("cesiumViewer");
    
    let models = ['/models/rus/scene.gltf', '/models/CesiumMilkTruck.gltf', '/models/ancient_arabe_building/scene.gltf', '/models/3_seconds_of_vacations/scene.gltf', '/models/smithmill_house/scene.gltf'];

    let long = -74.01881302800248, lat = 40.69114333714821, entity = undefined;
    let items = [], path = [];
    for (let i = 0; i < 30; i++) {
        let long1 = long + Math.random() / 100, lat1 = lat + Math.random() / 100;
        let heading = Math.floor(Math.random() * 360);
        let model = Math.floor(Math.random() * 10 % models.length);
        //console.log(model + ":" + models[model]);
        items.push({ id: i, model: '/models/rus/scene.gltf', longitude: long1, latitude: lat1, heading: heading });
        path.push({longitude: long1, latitude: lat1});
        entity = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(long1, lat1, 0, viewer.scene.globe.ellipsoid),
            model: {
                //uri: models[model],
                uri: '/models/rus/scene.gltf',
                scale: 50.0,
            },
        });
    }

    //console.log(JSON.stringify(items));
    console.log(JSON.stringify(path));
    // var position = Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706, 0);
    // var heading = Cesium.Math.toRadians(135);
    // var pitch = 0;
    // var roll = 0;
    // var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    // var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

    // var entity = viewer.entities.add({
    //     position : position,
    //     orientation : orientation,
    //     model : {
    //         uri : '/models/Miami_Sample.gltf',
    //         minimumPixelSize : 128,
    //         maximumScale : 20000
    //     }
    // });
    //viewer.trackedEntity = entity;

   viewer.zoomTo(entity);
})();