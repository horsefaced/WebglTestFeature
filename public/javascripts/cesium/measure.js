(() => {
    let id = 'measure';

    const basemapProvider = new Cesium.CartoDBImageryProvider({
        url: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        credit: 'Basemap courtesy of CartoDB'
    });

    // load footprints
    const dataSource1 = new Cesium.GeoJsonDataSource();
    dataSource1.load('/models/footprints_rectangle.json').then(() => {
        var entities = dataSource1.entities.values;
        var colorHash = {};
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
            //var name = entity.NAME;
            if (entity.properties.STORIES < 50) entity.show = false;
            entity.polygon.material = new Cesium.ColorMaterialProperty(new Cesium.Color(1.0, 1.0, 1.0, 0.1));
            entity.polygon.outlineColor = new Cesium.ConstantProperty(new Cesium.Color(1, 1, 1, 0.48));
            entity.polygon.outlineWidth = new Cesium.ConstantProperty(0.5);
            entity.polygon.extrudedHeight = new Cesium.ConstantProperty(entity.properties.STORIES * 5.0);
            entity.building = true;
        }
    });


    const viewer = new Cesium.Viewer('cesiumViewer', {
        imageryProvider: basemapProvider,
    });
    // viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
    viewer.extend(Cesium.viewerCesiumInspectorMixin);

    // let build = new Cesium.Cesium3DTileset({
    //     url: '/models/Batchedcampus_no_tree',
    // });

    //let build = new Cesium.Cesium3DTileset({ url: Cesium.IonResource.fromAssetId(3839), });
    viewer.dataSources.add(dataSource1);
    viewer.zoomTo(dataSource1);
    // build.readyPromise.then((tileset) => {
    //     viewer.scene.primitives.add(tileset);
    //     viewer.zoomTo(tileset);
    // });

    let entity = undefined, positions = [], measuring = false;
    let heightIndicator = undefined;
    let prePicked = undefined, preStyle = undefined;

    viewer.screenSpaceEventHandler.setInputAction((event) => {
        let picked = viewer.scene.pick(event.endPosition);
        if (picked !== prePicked) {
            if (prePicked instanceof Cesium.Cesium3DTileFeature) prePicked.color = preStyle;
            if (prePicked instanceof Cesium.Primitive) {
                let attributes = prePicked.getGeometryInstanceAttributes(prePicked.id);
                attributes.color = preStyle;
            }
            if (!picked) return;
            if (picked instanceof Cesium.Cesium3DTileFeature) {
                prePicked = picked, preStyle = picked.color;
                picked.color = Cesium.Color.YELLOW.withAlpha(0.5);
            }
            if (picked.primitive instanceof Cesium.Primitive) {
                prePicked = picked.primitive;
                prePicked.id = picked.id;
                let attributes = picked.primitive.getGeometryInstanceAttributes(picked.id);
                preStyle = attributes.color;
                attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(Cesium.Color.YELLOW.withAlpha(0.5));
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    viewer.screenSpaceEventHandler.setInputAction((event) => {
        if (measuring) {
            addPoint(event.position);
            show(positions);
        }
        else {
            let picked = viewer.scene.pick(event.position);
            if (picked) {
                let bottom = undefined, up, height, name;

                if (picked instanceof Cesium.Cesium3DTileFeature) {
                    for (let name of picked.getPropertyNames())
                        console.log(name + ':' + picked.getProperty(name));
                    let longitude = picked.getProperty('longitude'), latitude = picked.getProperty('latitude');
                    height = picked.getProperty('height');
                    bottom = Cesium.Cartesian3.fromRadians(longitude, latitude, 0, viewer.scene.globe.ellipsoid, new Cesium.Cartesian3());
                    up = Cesium.Cartesian3.fromRadians(longitude, latitude, height, viewer.scene.globe.ellipsoid, new Cesium.Cartesian3());
                } else if (picked.id && picked.id instanceof Cesium.Entity) {
                    height = picked.id.properties.STORIES.getValue(Cesium.JulianDate.now()) * 5.0;
                    let x = picked.id.properties.X_COORD.getValue(Cesium.JulianDate.now()), y = picked.id.properties.Y_COORD.getValue(Cesium.JulianDate.now()), z = picked.id.properties.Z_COORD.getValue(Cesium.JulianDate.now());                    
                    //bottom = new Cesium.Cartographic(x, y, 0), up = new Cesium.Cartographic(x, y, height);
                    //bottom = Cesium.Cartographic.toCartesian(bottom, viewer.scene.globe.ellipsoid);
                    //up = Cesium.Cartographic.toCartesian(up, viewer.scene.globe.ellipsoid);
                    bottom = picked.id.polygon.hierarchy._value.positions[0];
                    bottom = Cesium.Cartographic.fromCartesian(bottom, viewer.scene.globe.ellipsoid);
                    up = new Cesium.Cartographic(bottom.longitude, bottom.latitude, height);
                    bottom = new Cesium.Cartographic(bottom.longitude, bottom.latitude, 0);
                    up = Cesium.Cartographic.toCartesian(up, viewer.scene.globe.ellipsoid);
                    bottom = Cesium.Cartographic.toCartesian(bottom, viewer.scene.globe.ellipsoid);

                    console.log('height: ' + height + ', x: ' + x + ', y: ' + y + ', z: ' + z);
                }
                if (heightIndicator) viewer.entities.remove(heightIndicator);
                heightIndicator = viewer.entities.add({
                    id: 'height_indicator',
                    polyline: {
                        positions: [bottom, up],
                        width: 5,
                        material: new Cesium.ColorMaterialProperty(Cesium.Color.AQUA),
                    },
                });
        }
        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    function addPoint(position) {
        //if (positions.length >= 4) positions = [];
        positions.push(viewer.scene.globe.pick(viewer.camera.getPickRay(position), viewer.scene));
    }

    function clean() {
        if (entity) {
            viewer.entities.remove(entity);
            delete entity;
        }
    }

    function show(positions) {
        clean();
        if (positions.length === 1)
            entity = viewer.entities.add({
                id: id,
                position: positions[0],
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.LIME,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                },
            });
        else if (positions.length === 2)
            entity = viewer.entities.add({
                id: id,
                polyline: {
                    positions: positions,
                    width: 5,
                    material: new Cesium.ColorMaterialProperty(Cesium.Color.LIME),
                },
            });
        else if (positions.length > 2)
            entity = viewer.entities.add({
                id: id,
                polygon: {
                    hierarchy: new Cesium.PolygonHierarchy(positions),
                    material: new Cesium.ColorMaterialProperty(Cesium.Color.LIME.withAlpha(0.5)),
                },
            });
    }

    function measure() {
        if (positions.length === 2) measureLine(entity);
        else if (positions.length > 2) measureArea(entity);

        //clean();
    }

    function measureLine(entity) {
        let hierarchy = entity.polyline.positions._value;
        hierarchy = Cesium.PolylinePipeline.generateArc({
            positions: hierarchy,
        });
        let vector = new Cesium.Cartesian3();
        let distance = 0;
        for (let i = 3; i < hierarchy.length; i += 3) {
            vector.x = hierarchy[i] - hierarchy[i - 3];
            vector.y = hierarchy[i + 1] - hierarchy[i - 2];
            vector.z = hierarchy[i + 2] - hierarchy[i - 1];
            distance += Cesium.Cartesian3.magnitude(vector);
        }

        console.log(distance);

        console.log(Cesium.Cartesian3.distance(entity.polyline.positions._value[1], entity.polyline.positions._value[0]));
    }

    function measureArea(entity) {
        let hierarchy = entity.polygon.hierarchy._value;
        let indices = Cesium.PolygonPipeline.triangulate(hierarchy.positions, hierarchy.holes);
        let area = 0;

        for (let i = 0; i < indices.length; i += 3) {
            let v1 = hierarchy.positions[indices[i]],
                v2 = hierarchy.positions[indices[i + 1]],
                v3 = hierarchy.positions[indices[i + 2]];

            // viewer.entities.add({
            //     polygon: {
            //         hierarchy: new Cesium.PolygonHierarchy([v1, v2, v3]),
            //         fill: false,
            //         outline: true,
            //         outlineColor: Cesium.Color.RED,
            //     },
            // });

            let vC = Cesium.Cartesian3.subtract(v2, v1, new Cesium.Cartesian3());
            let vD = Cesium.Cartesian3.subtract(v3, v1, new Cesium.Cartesian3());
            let areaV = Cesium.Cartesian3.cross(vC, vD, new Cesium.Cartesian3());
            area += Cesium.Cartesian3.magnitude(areaV) / 2.0;
        }

        console.log(area);
    }

    function startMeasure() {
        measuring = true;
    }

    function endMeasure() {
        measuring = false;
        clean();
        positions = [];
    }


    document.getElementById('measureArea').onclick = () => measure();
    document.getElementById('startMeasure').onclick = () => startMeasure();
    document.getElementById('endMeasure').onclick = () => endMeasure();
})();