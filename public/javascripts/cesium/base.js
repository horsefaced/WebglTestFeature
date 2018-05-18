(function () {
    "use strict";

    let viewer = new Cesium.Viewer("cesiumViewer", {
        selectionIndicator: false,
    });

    //viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
    viewer.extend(Cesium.viewerCesiumInspectorMixin);

    let build = new Cesium.Cesium3DTileset({
        url: '/models/Batchedcampus_no_tree',
    });

    let pipe = new Cesium.Cesium3DTileset({
        url: '/models/Batchedonly_pipe',
    })

    build.readyPromise.then((tileset) => {
        viewer.scene.primitives.add(tileset);

        let originPositon = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
        let surface = Cesium.Cartesian3.fromRadians(originPositon.longitude, originPositon.latitude, 0.0);
        let newPosition = Cesium.Cartesian3.fromRadians(originPositon.longitude, originPositon.latitude, 450.0);
        let translation = Cesium.Cartesian3.subtract(newPosition, surface, new Cesium.Cartesian3());
        tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

        viewer.zoomTo(tileset);
    });

    pipe.readyPromise.then((tileset) => {
        viewer.scene.primitives.add(pipe);

        let originPositon = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center)
        let newPosition = Cesium.Cartesian3.fromRadians(originPositon.longitude, originPositon.latitude, 200.0);
        let translation = Cesium.Cartesian3.subtract(newPosition, tileset.boundingSphere.center, new Cesium.Cartesian3());
        tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

        viewer.scene.globe.depthTestAgainTerrian = true;
        var radius = 75, n = 360, lat = Cesium.Math.toDegrees(originPositon.latitude), long = Cesium.Math.toDegrees(originPositon.longitude);
        var points = [], planes = [];
        for (let i = 1; i < n; i++) {
            if (i === 90 || i === 180 || i === 270) continue;
            let x = Math.cos(Math.PI * i / n) * radius;
            let y = Math.sin(Math.PI * i / n) * radius;
            let iLat = lat + y, iLong = long + x;
            points.push(new Cesium.Cartesian3.fromDegrees(iLat, iLong, 0.0));
        }

        let pointsLength = points.length, clippingPlanes = [];
        for (var i = 0; i < pointsLength; ++i) {
            var nextIndex = (i + 1) % pointsLength;
            var midpoint = Cesium.Cartesian3.add(points[i], points[nextIndex], new Cesium.Cartesian3());
            midpoint = Cesium.Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint);
    
            var up = Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3());
            var right = Cesium.Cartesian3.subtract(points[nextIndex], midpoint, new Cesium.Cartesian3());
            right = Cesium.Cartesian3.normalize(right, right);
    
            var normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
            normal = Cesium.Cartesian3.normalize(normal, normal);
    
            // Compute distance by pretending the plane is at the origin
            var originCenteredPlane = new Cesium.Plane(normal, 0.0);
            var distance = Cesium.Plane.getPointDistance(originCenteredPlane, midpoint);
    
            clippingPlanes.push(new Cesium.ClippingPlane(normal, distance));
        }

        viewer.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
            modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(tileset.boundingSphere.center),
            planes: clippingPlanes,
            enabled: true,
            edgeWidth: 1.0,
            edgeColor: Cesium.Color.WHITE,
        })
    })

    let prePickedObject = undefined;
    new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas).setInputAction(
        (event) => {
            let pickedObject = viewer.scene.pick(event.position);
            if (pickedObject) {
                console.log(pickedObject);
                if (prePickedObject) {
                    console.log('primitive is the same? ', pickedObject.primitive === prePickedObject.primitive);
                    console.log('tileset is the same? ', pickedObject.tileset == prePickedObject.tileset);
                    prePickedObject.color = prePickedObject.color.withAlpha(1.0);
                }
                pickedObject.color = pickedObject.color.withAlpha(0.5);
                prePickedObject = pickedObject;
            }
        },
        Cesium.ScreenSpaceEventType.LEFT_CLICK
    );
})();