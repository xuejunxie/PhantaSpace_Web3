import React, { Component } from "react";
import * as Cesium from "cesium";
import { connect } from "react-redux";
import { place, removed } from "../redux/actions/map";

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNmY0NjhmOS1iZGRjLTQ5ODgtYTQyOS0zNGFhZTQ3M2RlYzYiLCJpZCI6NzE5OTUsImlhdCI6MTYzNzIzODcyM30.C_x5USgZL8Gk2tZ7D3hd__1irF9-cyatRD-9GDaRBGc";
const dummyCredit = document.createElement("div");

var viewer = null;

var handler = null;

class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: null,
      placed: null,
      camera: null,
      viewCenter: null,
      all: [],
    };
  }

  componentDidMount() {
    viewer = new Cesium.Viewer("cesiumContainer", {
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
    // disable single click green window pop up
    viewer.selectionIndicator.viewModel.selectionIndicatorElement.style.visibility = "hidden";
    // disable the double click focus
    viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    // disable double click zoom and tracking
    viewer.trackedEntity = undefined;

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

  static getDerivedStateFromProps(props, state) {
    // initialize the handler if clicked on another item
    if (viewer) {
      if (props.selected !== state.selected) {
        if (handler) {
          handler.destroy();
        }
        handler = null;
        handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        var entity = null;
      }

      // find if the item exist in the viewer
      var entity = viewer.entities.getById(props.selected.id);

      // if exist fly camera to entity
      if (entity) {
        viewer.flyTo(entity);

        // handle the edit of the entity
        handler = DoubleClickToPlace(entity, props);

        // handle the delete of the entity
        if (props.removing) {
          viewer.entities.remove(entity);
          props.removed(props.selected);
        }
      } else {
        handler = DoubleClickToPlace(entity, props);
        // Select plane when mouse down
        // var leftDownFlag = false;
        // handler.setInputAction(function (movement) {
        //   leftDownFlag = true;
        //   viewer.scene.screenSpaceCameraController.enableRotate = false; //锁定相机
        //   let ray = viewer.camera.getPickRay(movement.position);
        //   let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        //   entity.position = cartesian; // update the entity position
        // }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        // // Release plane on mouse up
        // handler.setInputAction(function () {
        //   leftDownFlag = false;
        //   viewer.scene.screenSpaceCameraController.enableInputs = true;
        // }, Cesium.ScreenSpaceEventType.LEFT_UP);

        // // Update plane on mouse move
        // handler.setInputAction(function (movement) {
        //   if (leftDownFlag === true) {
        //     let ray = viewer.camera.getPickRay(movement.endPosition);
        //     let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        //     entity.position = cartesian; // update the entity position
        //   }
        // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      }
      state.selected = props.selected;
    }
    return {
      selected: props.selected,
    };
  }

  render() {
    return <div id="cesiumContainer" style={{ height: this.props.viewHeight, width: this.props.viwerWidth }}></div>;
  }
}

const mapStateToProps = (state) => {
  return {
    selected: state.map.selected,
    removing: state.map.removing,
  };
};

export default connect(mapStateToProps, { place, removed })(Map);

function addModel(viewer, nft, cartesian, direction, scale) {
  // var position = Cesium.Cartesian3.fromDegrees(latitude, longitude, height);
  var heading = Cesium.Math.toRadians(direction);
  var pitch = 0;
  var roll = 0;
  var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  var orientation = Cesium.Transforms.headingPitchRollQuaternion(cartesian, hpr);
  var entity = viewer.entities.add({
    id: nft.id,
    name: nft.url,
    position: cartesian,
    orientation: orientation,
    model: {
      uri: nft.url,
      minimumPixelSize: 0,
      scale: scale,
    },
  });
  return entity;
}

function relocateModel(entity, cartesian) {
  entity.position = cartesian;
  entity.orientation = Cesium.Transforms.headingPitchRollQuaternion(cartesian, new Cesium.HeadingPitchRoll(0, 0, 0));

  return entity;
}

function DoubleClickToPlace(entity, props) {
  console.log("here");
  handler.setInputAction((click) => {
    if (click.position) {
      var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(click.position), viewer.scene);
      if (cartesian) {
        if (entity) {
          entity = relocateModel(entity, cartesian);
        } else {
          console.log(props.selected.id);
          entity = addModel(viewer, props.selected, cartesian, 45, 100);
        }
        viewer.flyTo(entity);
        props.place(props.selected);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  return handler;
}
