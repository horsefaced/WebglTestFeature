(() => {
    let viewer = new Cesium.Viewer("cesiumViewer", {
        fullscreenButton: false,
        vrButton: false,
        geocoder: false,
        infoBox: false,
        selectionIndicator: false,
        timeline: false,
        skyBox: new Cesium.SkyBox({ show: false }),
        skyAtmosphere: false,
        animation: false,
        terrainProvider: Cesium.createWorldTerrain(),
    });

    viewer.scene.globe.depthTestAgainstTerrian = true;

    viewer.extend(Cesium.viewerCesiumInspectorMixin);

    let pipe = new Cesium.Cesium3DTileset({
        url: '/models/Batchedonly_pipe',
    })

    pipe.readyPromise.then((tileset) => {
        clippingThis(viewer, tileset);

        viewer.scene.primitives.add(tileset)
        if (tileset.properties)
            for(let [name, value] of tileset.properties) {
                console.log('name is ' + name + ' value is ' + value)
            }
        
        //viewer.zoomTo(tileset)
    })
})()

function clippingThis(viewer, tileset) {
    let planes = [], n = 180, points = [], pointsR = [];
    let center = tileset.boundingSphere.center, radius = tileset.boundingSphere.radius;
    let R = viewer.scene.globe.ellipsoid.maximumRadius;

    center = Cesium.Cartographic.fromCartesian(center);
    //center = Cesium.Cartesian3.fromRadians(center.longitude, center.latitude, 0);
//latB = latA-((radius * Math.sin(Math.PI * i / n)) * 180) / (Math.PI * ellipsoid.R)
//latB = LatA-(Y*180)/(Math.PI * e)
//loB = loA - ((rdius * Math.cost(Math.PI * i / n)) * 180) / (Math.PI * ellipsoid.R * Math.cos((LatA + LatB) / 2))
//loB = loA - (x*180)/(math.pi * r * cost((latA + latB) / 2))
    for (let i = -n; i <= n; i++) {
        let x = Math.cos(Math.PI * i / n) * radius;
        let y = Math.sin(Math.PI * i / n) * radius;
        //let LatB = center.latitude - (y * 180) / (Math.PI * R);
        let LatB = center.latitude - (y / R);
        //let LonB = center.longitude - (x * 180) / (Math.PI * R * Math.cos((center.latitude + LatB) / 2));
        let LonB = center.longitude - (x / (R * Math.cos((center.latitude + LatB) / 2)));
        let point = new Cesium.Cartographic(LonB, LatB);
        //let point = new Cesium.Cartesian3(x, y, 0);
        pointsR.push(point);
        point = viewer.scene.globe.ellipsoid.cartographicToCartesian(point);
        // Cesium.Cartesian3.add(center, point, point);
        // point = Cesium.Cartographic.fromCartesian(point);
        // point = Cesium.Cartesian3.fromRadians(point.longitude, point.latitude, 0);
        points.push(point);
    }

    Cesium.when(Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, pointsR), (samples) => {
        for (let sample of samples) sample.height += 10.0;

        viewer.entities.add({
            polyline: {
                positions: Cesium.Ellipsoid.WGS84.cartographicArrayToCartesianArray(samples),
                width: 5,
                material: Cesium.Color.WHITE,
            },
        });
    });

    let polyline = viewer.entities.add({
        polyline: {
            positions: points,
            width: 5,
            material: Cesium.Color.RED,
        },
    });

    viewer.zoomTo(polyline);

    let point2 = [];
    for (let i = -n; i <=n; i++) {
        let x = Math.cos(Math.PI * i / n) * radius;
        let y = Math.sin(Math.PI * i / n) * radius;
        let lonB = center.longitude + (x / (Math.PI * R));
        let latB = center.latitude + (y / (Math.PI * R));
        let point = new Cesium.Cartographic(lonB, latB);
        point = viewer.scene.globe.ellipsoid.cartographicToCartesian(point);
        point2.push(point);
    }

    let polyline2 = viewer.entities.add({
        polyline: {
            positions: point2,
            width: 5,
            material: Cesium.Color.GREEN,
        },
    });

    viewer.entities.add({
        position: tileset.boundingSphere.center,
        point: {
            pixelSize: 5,
            color: Cesium.Color.RED,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        }
    });

    //viewer.zoomTo(polyline);

    //  points = [
    //     new Cesium.Cartesian3(-2358434.3501556474, -3743554.5012105294, 4581080.771684084),
    //     new Cesium.Cartesian3(-2357886.4482675144, -3744467.562778789, 4581020.9199767085),
    //     new Cesium.Cartesian3(-2357299.84353055, -3744954.0879047974, 4581080.992360969),
    //     new Cesium.Cartesian3(-2356412.05169956, -3745385.3013702347, 4580893.4737207815),
    //     new Cesium.Cartesian3(-2355472.889436636, -3745256.5725702164, 4581252.3128526565),
    //     new Cesium.Cartesian3(-2354385.7458722834, -3744319.3823686405, 4582372.770031389),
    //     new Cesium.Cartesian3(-2353758.788158616, -3743051.0128084184, 4583356.453176038),
    //     new Cesium.Cartesian3(-2353663.8128999653, -3741847.9126874236, 4584079.428665509),
    //     new Cesium.Cartesian3(-2354213.667592133, -3740784.50946316, 4584502.428203525),
    //     new Cesium.Cartesian3(-2355596.239450013, -3739901.0226732804, 4584515.9652557485),
    //     new Cesium.Cartesian3(-2356942.4170108805, -3740342.454698685, 4583686.690694482),
    //     new Cesium.Cartesian3(-2357529.554838029, -3740766.995076834, 4583145.055348843),
    //     new Cesium.Cartesian3(-2358106.017822064, -3741439.438418052, 4582452.293605261),
    //     new Cesium.Cartesian3(-2358539.5426236596, -3742680.720902901, 4581692.0260975715)
    // ];

    // var pointsLength = points.length;

    // // Create center points for each clipping plane
    // var clippingPlanes = [];
    // for (var i = 0; i < pointsLength - 1; ++i) {
    //     var nextIndex = (i + 1) % pointsLength;
    //     var midpoint = Cesium.Cartesian3.add(points[i], points[nextIndex], new Cesium.Cartesian3());
    //     midpoint = Cesium.Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint);

    //     var up = Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3());
    //     var right = Cesium.Cartesian3.subtract(points[nextIndex], midpoint, new Cesium.Cartesian3());
    //     right = Cesium.Cartesian3.normalize(right, right);

    //     var normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
    //     normal = Cesium.Cartesian3.normalize(normal, normal);

    //     // Compute distance by pretending the plane is at the origin
    //     var originCenteredPlane = new Cesium.Plane(normal, 0.0);
    //     var distance = Cesium.Plane.getPointDistance(originCenteredPlane, midpoint);

    //     clippingPlanes.push(new Cesium.ClippingPlane(normal, distance));
    // }
    // viewer.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
    //     planes : clippingPlanes,
    //     edgeWidth: 1.0,
    //     edgeColor: Cesium.Color.WHITE,
    //     enabled : true,
    // });
    let length = points.length;

    for (let i = 0; i < length - 1; ++i) {
        let next = (i + 1) % length;
        let midpoint = Cesium.Cartesian3.add(points[i], points[next], new Cesium.Cartesian3());
        midpoint = Cesium.Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint);

        let one = Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3());
        let two = Cesium.Cartesian3.subtract(points[i], midpoint, new Cesium.Cartesian3());
        two = Cesium.Cartesian3.normalize(two, two);

        let normal = Cesium.Cartesian3.cross(one, two, new Cesium.Cartesian3());
        
        Cesium.Cartesian3.normalize(normal, normal);

        let plane = new Cesium.Plane(normal, 0);
        var distance = Cesium.Plane.getPointDistance(plane, midpoint);
        plane = new Cesium.ClippingPlane(normal, distance);
        planes.push(plane);
        console.log(i);
    }

    viewer.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
        planes: planes,
        edgeWidth: 1.0,
        edgeColor: Cesium.Color.RED,
        enabled: true,
    });
}