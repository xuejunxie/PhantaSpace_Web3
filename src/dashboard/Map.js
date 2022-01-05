import React, { Component } from "react";
import * as Cesium from "cesium";

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNmY0NjhmOS1iZGRjLTQ5ODgtYTQyOS0zNGFhZTQ3M2RlYzYiLCJpZCI6NzE5OTUsImlhdCI6MTYzNzIzODcyM30.C_x5USgZL8Gk2tZ7D3hd__1irF9-cyatRD-9GDaRBGc";
const dummyCredit = document.createElement("div");

export default class Map extends Component {
  componentDidMount() {
    var viewer = new Cesium.Viewer("cesiumContainer", {
      terrainProvider: Cesium.createWorldTerrain(),
      shouldAnimate: true,
      animation: false,
      homeButton: false, // disable the default home button
      geocoder: true, // disable the default search button
      baseLayerPicker: false, // disable the default base layer button
      fullscreenButton: false, // disable the default full screen button
      timeline: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      creditContainer: dummyCredit,
      infoBox: false,
      vrButton: false,
    });
    viewer.scene.globe.depthTestAgainstTerrain = true;

    // Set the initial camera view to look at Manhattan
    var initialPosition = Cesium.Cartesian3.fromDegrees(-74.01881302800248, 40.69114333714821, 753);
    var initialOrientation = new Cesium.HeadingPitchRoll.fromDegrees(
      21.27879878293835,
      -21.34390550872461,
      0.0716951918898415
    );
    viewer.scene.camera.setView({
      destination: initialPosition,
      orientation: initialOrientation,
      endTransform: Cesium.Matrix4.IDENTITY,
    });

    // Load the OSM buildings tileset
    var tileset = new Cesium.Cesium3DTileset({
      url: Cesium.IonResource.fromAssetId(96188),
    });
    viewer.scene.primitives.add(tileset);

    // Load the NYC buildings tileset  // Not working
    // var tileset = new Cesium.Cesium3DTileset({
    //   url: Cesium.IonResource.fromAssetId(75343),
    // });
    // viewer.scene.primitives.add(tileset);

    function createModel(url, longitude, latitude, height, direction, scale) {
      var position = Cesium.Cartesian3.fromDegrees(latitude, longitude, height);
      var heading = Cesium.Math.toRadians(direction);
      var pitch = 0;
      var roll = 0;
      var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

      var entity = viewer.entities.add({
        name: url,
        position: position,
        orientation: orientation,
        model: {
          uri: url,
          minimumPixelSize: 0,
          scale: scale,
        },
      });
    }

    createModel(
      // "https://storage.opensea.io/files/cb639bcfb20628b13bf9785c1f22e73f.gltf",
      "https://ipfs.io/ipfs/QmbmSbbqFRi4dYRCaeXq6W8ijTn7s6rDaL9YXtG1jmioBp/nft.gltf",
      40.71800777336079,
      -74.00734148289514,
      600,
      45,
      0.4
    );

    createModel(
      "https://storage.opensea.io/files/fcb0f930c51013791c6ff8e05ac22870.gltf",
      40.71190850831766,
      -74.0042523657344,
      300,
      -45,
      100
    );

    createModel(
      "https://storage.opensea.io/files/38f06a0dd647a8e4556b5d983e41ce39.glb",
      40.73440501787107,
      -73.98893286773647,
      300,
      -45,
      100
    );
  }

  render() {
    return <div id="cesiumContainer" style={{ height: this.props.viewHeight, width: this.props.viwerWidth }}></div>;
  }
}
