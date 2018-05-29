const humanHeight = 16;
(() => {

    let viewer = undefined;

    viewer = new Cesium.Viewer('cesiumViewer', {
        //terrainProvider: Cesium.createWorldTerrain(),
    });

    viewer.scene.globe.depthTestAgainstTerrain = true;

    let campus = new Cesium.Cesium3DTileset({
        url: '/models/Batchedcampus_no_tree',
    });

    campus.readyPromise.then((tileset) => {
        let HPR = new Cesium.HeadingPitchRange(0.0, Cesium.Math.toRadians(-20.0), 1.0);

        Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;
        Cesium.Camera.DEFAULT_VIEW_OFFSET = HPR;
        Cesium.Camera.DEFAULT_VIEW_RECTANGLE = tileset._root._boundingVolume.rectangle;

        viewer.scene.primitives.add(tileset);

        let center = viewer.scene.globe.ellipsoid.cartesianToCartographic(tileset.boundingSphere.center);

        let distance = tileset.boundingSphere.radius;

        let latT = center.latitude - (1.5 * distance / viewer.scene.globe.ellipsoid.maximumRadius);
        let target = new Cesium.Cartographic(center.longitude, latT, 1.5 * distance / Math.tan(Cesium.Math.toRadians(70.0)));
        target = viewer.scene.globe.ellipsoid.cartographicToCartesian(target);
        viewer.entities.add({
            position: target,
            point: {
                pixelSize: 10,
                color: Cesium.Color.RED,
            }
        });

        // viewer.camera.flyTo({
        //     destination: target,
        //     orientation: {
        //         heading: Cesium.Math.toRadians(0.0),
        //         pitch: Cesium.Math.toRadians(-20.0),
        //         roll: 0.0,
        //     },
        // });
        // viewer.camera.flyToBoundingSphere(tileset.boundingSphere, {
        // offset: new Cesium.HeadingPitchRange(0.0, Cesium.Math.toRadians(-45.0), tileset.boundingSphere.radius),
        // });
        viewer.camera.lookAt(target, HPR);
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
    });

    // viewer.screenSpaceEventHandler.setInputAction((event) => {
    //     let coordinate = viewer.camera.pickEllipsoid(event.position, viewer.scene.globe.ellipsoid);
    //     coordinate = Cesium.Cartographic.fromCartesian(coordinate);
    //     Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, [coordinate]).then((samples) => {
    //         for (let sample of samples) sample.height += 10.0;
    //         viewer.entities.add({
    //             position: Cesium.Cartographic.toCartesian(samples[0], viewer.scene.globe.ellipsoid),
    //             point: {
    //                 pixelSize: 5,
    //                 color: Cesium.Color.GREEN,
    //                 heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    //             },
    //         });
    //     });
    // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    let preDot = undefined;

    viewer.screenSpaceEventHandler.setInputAction((event) => {
        let pickedObject = viewer.scene.pick(event.position);
        if (pickedObject) {
            console.log(pickedObject);
        } else {
            CameraFly(viewer, event);
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    function CameraFly(viewer, event) {
        let ray = viewer.camera.getPickRay(event.position);
        let position = viewer.scene.globe.pick(ray, viewer.scene);
        viewer.entities.add({
            position: position,
            point: {
                pixelSize: 5,
                color: Cesium.Color.LIME,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            },
        });
    
        position.z += humanHeight;
    
        if (preDot) {
            let directionV = Cesium.Cartesian3.subtract(position, preDot, new Cesium.Cartesian3());
            Cesium.Cartesian3.normalize(directionV, directionV);
    
            let up = Cesium.Ellipsoid.WGS84.geodeticSurfaceNormal(preDot);
            let east = Cesium.Cartesian3.cross({ x: 0, y: 0, z: 1 }, up, new Cesium.Cartesian3());
            let north = Cesium.Cartesian3.cross(up, east, new Cesium.Cartesian3());
            let enu = new Cesium.Cartesian3();
            enu.x = Cesium.Cartesian3.dot(directionV, east);
            enu.y = Cesium.Cartesian3.dot(directionV, north);
            enu.z = Cesium.Cartesian3.dot(directionV, up);
    
            let x = Cesium.Cartesian3.dot(enu, new Cesium.Cartesian3(1, 0, 0));
            let y = Cesium.Cartesian3.dot(enu, new Cesium.Cartesian3(0, 1, 0));
            let z = Cesium.Cartesian3.dot(enu, new Cesium.Cartesian3(0, 0, 1));
    
            let angle = Math.atan2(x, y);
            let pitch = Math.asin(z);
    
            angle += 0 / 180 * Math.PI;
            pitch += -20 / 180 * Math.PI;
    
//            viewer.camera.lookAt(position, new Cesium.HeadingPitchRange(angle, pitch, 80));
            //viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
            viewer.camera.flyTo({
                destination: position,
                orientation: {
                    heading: angle,
                    pitch: 0.0,
                    roll: 0.0
                },
            });
        } else {
            viewer.camera.flyTo({
                destination: position,
                orientation: {
                    heading: Cesium.Math.toRadians(0.0),
                    pitch: Cesium.Math.toRadians(0.0),
                    roll: 0.0
                },
            });
        }
    
        preDot = position;
    
    }
})();

