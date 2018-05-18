(() => {
    // let viewer = new Cesium.Viewer('cesiumViewer');

    // let build = new Cesium.Cesium3DTileset({
    //     url: '/models/Batchedcampus_no_tree',
    // });

    // build.readyPromise.then((tileset) => {
    //     viewer.scene.primitives.add(tileset);
    //     viewer.zoomTo(tileset);
    // });

    // viewer.screenSpaceEventHandler.setInputAction((event) => {
    //     let picked = viewer.scene.pick(event.position);
    //     if (picked) {
    //         for (let name of picked.getPropertyNames()) 
    //             console.log('name: ' + name + ' property: ' + picked.getProperty(name));
    //     }
    // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // A demo of interactive 3D Tiles styling
    // Styling language Documentation: https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/Styling
    // Building data courtesy of NYC OpenData portal: http://www1.nyc.gov/site/doitt/initiatives/3d-building.page
    var viewer = new Cesium.Viewer('cesiumViewer');
    // viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
    // Set the initial camera view to look at Manhattan
    // var initialPosition = Cesium.Cartesian3.fromDegrees(-74.01881302800248, 40.69114333714821, 753);
    // var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(21.27879878293835, -21.34390550872461, 0.0716951918898415);
    // viewer.scene.camera.setView({
    //     destination: initialPosition,
    //     orientation: initialOrientation,
    //     endTransform: Cesium.Matrix4.IDENTITY
    // });

    // Load the NYC buildings tileset.
    var tileset = new Cesium.Cesium3DTileset({ url: Cesium.IonResource.fromAssetId(3839) });
    // var tileset = new Cesium.Cesium3DTileset({
    //     url: '/models/Batchedcampus_no_tree',
    // });

    tileset.tileLoad.addEventListener((tile) => {
        // console.log(new Date())
        // console.log(tile);
    });


    tileset.readyPromise.then(() => {
        // tileset.style = new Cesium.Cesium3DTileStyle({
        //     color: "color('#FF0000', 0.5)",
        // });
        viewer.scene.primitives.add(tileset);

        viewer.zoomTo(tileset);
    });

    let prePicked = undefined, preStyle = undefined;
    viewer.screenSpaceEventHandler.setInputAction((event) => {
        let picked = viewer.scene.pick(event.endPosition);
        if (picked !== prePicked) {
            if (prePicked) prePicked.color = preStyle;
            if (picked) {
                prePicked = picked, preStyle = picked.color;
                picked.color = Cesium.Color.YELLOW.withAlpha(0.5);
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    viewer.screenSpaceEventHandler.setInputAction((event) => {
        let picked = viewer.scene.pick(event.position);
        if (picked) {
            for (let name of picked.getPropertyNames())
                console.log('name: ' + name + ' property: ' + picked.getProperty(name));
            console.log('bounding sphere: ');
            console.log(picked.primitive.boundingSphere);
            // viewer.camera.flyTo({
            //     destination: picked.primitive.boundingSphere.center,
            //     orientation: {
            //         heading: Cesium.Math.toRadians(0.0),
            //         pitch: Cesium.Math.toRadians(-20.0),
            //         roll: 0.0,
            //     },
            // });
            // let position = Cesium.Cartesian3.add(picked.primitive.boundingSphere.center, picked.content._model.boundingSphere.center, new Cesium.Cartesian3());
            // viewer.entities.add({
            //     position: position,
            //     point: {
            //         pixelSize: 1,
            //         color: Cesium.Color.LIME,
            //     },
            // });
            //picked.content.tile.color = Cesium.Color.LIME;
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Color buildings based on their height.
    function colorByHeight() {
        tileset.style = new Cesium.Cesium3DTileStyle({
            color: {
                conditions: [
                    ["${height} >= 300", "rgba(45, 0, 75, 0.5)"],
                    ["${height} >= 200", "rgb(102, 71, 151)"],
                    ["${height} >= 100", "rgb(170, 162, 204)"],
                    ["${height} >= 50", "rgb(224, 226, 238)"],
                    ["${height} >= 25", "rgb(252, 230, 200)"],
                    ["${height} >= 10", "rgb(248, 176, 87)"],
                    ["${height} >= 5", "rgb(198, 106, 11)"],
                    ["true", "rgb(127, 59, 8)"]
                ]
            }
        });
    }

    // Color buildings by their total area.
    function colorByArea() {
        tileset.style = new Cesium.Cesium3DTileStyle({
            color: "mix(color('yellow'), color('red'), min(${area} / 10000.0, 1.0))"
        });
    }

    // Color buildings by their latitude coordinate.
    function colorByLatitude() {
        tileset.style = new Cesium.Cesium3DTileStyle({
            color: {
                conditions: [
                    ["${latitude} >= 0.7125", "color('purple')"],
                    ["${latitude} >= 0.712", "color('red')"],
                    ["${latitude} >= 0.7115", "color('orange')"],
                    ["${latitude} >= 0.711", "color('yellow')"],
                    ["${latitude} >= 0.7105", "color('lime')"],
                    ["${latitude} >= 0.710", "color('cyan')"],
                    ["true", "color('blue')"]
                ]
            }
        });
    }

    // Color buildings by distance from a landmark.
    function colorByDistance() {
        tileset.style = new Cesium.Cesium3DTileStyle({
            defines: {
                distance: "distance(vec2(${longitude}, ${latitude}), vec2(-1.291777521, 0.7105706624))"
            },
            color: {
                conditions: [
                    ["${distance} > 0.0002", "color('gray')"],
                    ["true", "mix(color('yellow'), color('green'), ${distance} / 0.0002)"]
                ]
            }
        });
    }

    // Color buildings with a '3' in their name.
    function colorByNameRegex() {
        tileset.style = new Cesium.Cesium3DTileStyle({
            color: "(regExp('3').test(${name})) ? color('cyan', 0.9) : color('purple', 0.1)"
        });
    }

    // Show only buildings greater than 200 meters in height.
    function hideByHeight() {
        tileset.style = new Cesium.Cesium3DTileStyle({
            show: "${height} > 200"
        });
    }

    function find({ id, long, lat, height }) {

        let heading = viewer.camera.heading, pitch = viewer.camera.pitch, roll = viewer.camera.roll;

        new Promise((resolve, reject) => {
            let position = viewer.scene.globe.ellipsoid.cartographicToCartesian(new Cesium.Cartographic(long, lat, 0.5 * height));
            let offset = offsetFromHeadingPitchRange(heading, pitch, roll, height * 2.0);
            let transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
            Cesium.Matrix4.multiplyByPoint(transform, offset, position);

            viewer.camera.flyTo({
                destination: position,
                orientation: {
                    heading: heading,
                    pitch: pitch,
                },
                complete: () => {
                    resolve();
                }
            });
        }).then(() => {
            return new Promise((resolve, reject) => {
                let event = () => {
                    tileset.allTilesLoaded.removeEventListener(event);
                    resolve();
                };
                tileset.allTilesLoaded.addEventListener(event);
            });
        }).then(() => {
            return new Promise((resolve, reject) => {
                let event = (tile) => {
                    for (let i = 0; i < tile.content.featuresLength; i++) {
                        if (tile.content.getFeature(i).getProperty('id') === id) {
                            //tileset.tileVisible.removeEventListener(event);
                            resolve(tile.content.getFeature(i));
                            return;
                        }
                    }
                }
                tileset.tileVisible.addEventListener(event);
            });
        }).then((feature) => {
            feature.color = Cesium.Color.BLUE.withAlpha(0.5);
            return feature;
        }).then((feature) => {
            let position = viewer.scene.globe.ellipsoid.cartographicToCartesian(new Cesium.Cartographic(long, lat, 1.2 * height));
            viewer.entities.add({
                position: position,
                label: {
                    text: feature.getProperty('name'),
                },
            });
        });
    }

    document.getElementById('colorByHeight').onclick = () => colorByHeight();
    document.getElementById('colorByArea').onclick = () => colorByArea();
    document.getElementById('colorByLatitude').onclick = () => colorByLatitude();
    document.getElementById('colorByDistance').onclick = () => colorByDistance();
    document.getElementById('colorByNameRegex').onclick = () => colorByNameRegex();
    document.getElementById('hideByHeight').onclick = () => hideByHeight();
    document.getElementById('find').onclick = () => find({  
        id: 'gml_JYH0SMXYHPV4HEBUVLYC9X1030L37X47FB0O',
        long: -1.2917727072831369, 
        lat: 0.7105749513910979, 
        height: 547.7591871983744 
    });

})();

function offsetFromHeadingPitchRange(heading, pitch, roll, range) {
    pitch = Cesium.Math.clamp(pitch, -Cesium.Math.PI_OVER_TWO, Cesium.Math.PI_OVER_TWO);
    heading = Cesium.Math.zeroToTwoPi(heading) - Cesium.Math.PI_OVER_TWO;

    var pitchQuat = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Y, -pitch);
    var headingQuat = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_Z, -heading);
    var rollQuat = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_X, -roll);
    var rotQuat = Cesium.Quaternion.multiply(headingQuat, pitchQuat, new Cesium.Quaternion());
    //rotQuat = Cesium.Quaternion.multiply(rotQuat, rollQuat, rotQuat);
    var rotMatrix = Cesium.Matrix3.fromQuaternion(rotQuat);

    var offset = Cesium.Cartesian3.clone(Cesium.Cartesian3.UNIT_X);
    //var offset = new Cesium.Cartesian3(1, 1, 1);
    Cesium.Matrix3.multiplyByVector(rotMatrix, offset, offset);
    Cesium.Cartesian3.negate(offset, offset);
    Cesium.Cartesian3.multiplyByScalar(offset, range, offset);
    return offset;
}