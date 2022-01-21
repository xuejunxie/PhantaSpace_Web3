import React, { useEffect } from "react";
import * as Cesium from "cesium";
import { useDispatch, useSelector } from "react-redux";
import { PLACE, UPDATE, CLICK } from "../redux/types";

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNmY0NjhmOS1iZGRjLTQ5ODgtYTQyOS0zNGFhZTQ3M2RlYzYiLCJpZCI6NzE5OTUsImlhdCI6MTYzNzIzODcyM30.C_x5USgZL8Gk2tZ7D3hd__1irF9-cyatRD-9GDaRBGc";
const dummyCredit = document.createElement("div");

var viewer = null;

var entity = null;

var nft = null;

export default function Map(props) {
  const dispatch = useDispatch();
  const owned = useSelector((state) => state.map.owned);
  const all = useSelector((state) => state.map.all);
  const look = useSelector((state) => state.sidebar.look);
  const explore = useSelector((state) => state.sidebar.explore);

  useEffect(() => {
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

    // enable shadows
    // viewer.shadowMap.enabled = true;

    // set directional light
    viewer.scene.light = new Cesium.DirectionalLight({
      direction: viewer.scene.camera.directionWC,
    });
    viewer.scene.preRender.addEventListener(function (scene, time) {
      viewer.scene.light.direction = Cesium.Cartesian3.clone(
        viewer.scene.camera.directionWC,
        viewer.scene.light.direction
      );
    });

    // use stamen map
    viewer.imageryLayers.removeAll();
    const imageryProvider = new Cesium.OpenStreetMapImageryProvider({
      url: "https://stamen-tiles.a.ssl.fastly.net/watercolor/",
      fileExtension: "jpg",
      credit: "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA.",
    });
    viewer.imageryLayers.addImageryProvider(imageryProvider);

    // change saturation
    // var layer = viewer.imageryLayers.get(0);
    // layer.saturation = 0;

    // Cesium.ImageryLayer(imageryProvider);
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

    // add mouse click event
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    const place = (nft) => {
      dispatch({
        type: PLACE,
        payload: nft,
      });
    };

    const update = (nft) => {
      dispatch({
        type: UPDATE,
        payload: nft,
      });
    };

    const click = (NFTid) => {
      dispatch({
        type: CLICK,
        payload: NFTid,
      });
    };

    DoubleClickToPlace(handler, place);

    MoveEntity(update, click);
    // Load the NYC buildings tileset  // Not working
    // var tileset = new Cesium.Cesium3DTileset({
    //   url: Cesium.IonResource.fromAssetId(75343),
    // });
    // viewer.scene.primitives.add(tileset);
  }, []);

  // initialize
  useEffect(() => {
    if (entity) {
      entity = null;
    }
    if (nft) {
      nft = null;
    }
  }, [explore]);

  useEffect(() => {
    if (viewer) {
      nft = owned.find((nft) => nft.selected === true);

      if (nft) {
        // find if the item exist in the viewer
        entity = viewer.entities.getById(nft.NFTid);
        if (entity && !nft.editing) {
          viewer.flyTo(entity);
        }

        // handle the delete of the entity
        if (!nft.placed) {
          viewer.entities.remove(entity);
        }

        if (nft.editing) {
          viewer.scene.screenSpaceCameraController.enableRotate = false; // lock the camera
        } else {
          viewer.scene.screenSpaceCameraController.enableRotate = true;
          entity = null;
        }

        // if exist fly camera to entity
        if (entity) {
          // update endity position and orientation based on its current position and orientation
          var cartographic = Cesium.Cartographic.fromCartesian(entity.position._value);
          cartographic.height = nft.height;
          var cartesian = Cesium.Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            cartographic.height
          );
          entity.position = cartesian;

          // update entity scale
          entity.model.scale = nft.scale;

          // update entity orientation
          var heading = Cesium.Math.toRadians(nft.heading);
          var pitch = Cesium.Math.toRadians(nft.pitch);
          var roll = Cesium.Math.toRadians(nft.roll);
          var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
          var orientation = Cesium.Transforms.headingPitchRollQuaternion(cartesian, hpr);
          entity.orientation = orientation;
        }
      }
    }
  }, [owned]);

  useEffect(() => {
    if (viewer) {
      if (look) {
        const clickedEndity = viewer.entities.getById(look.NFTid);
        if (clickedEndity) {
          viewer.flyTo(clickedEndity);
        }
      }
    }
  }, [look]);

  useEffect(() => {
    if (viewer) {
      all.map((item) => {
        // if the item is not on the map, add it
        if (!viewer.entities.getById(item.NFTid)) {
          const cartesian = Cesium.Cartesian3.fromRadians(item.longitude, item.latitude, item.height);
          const heading = Cesium.Math.toRadians(item.heading);
          const pitch = Cesium.Math.toRadians(item.pitch);
          const roll = Cesium.Math.toRadians(item.roll);
          const scale = item.scale;
          addModel(cartesian, heading, pitch, roll, scale, item);
        }
      });
    }
  }, [all]);

  return <div id="cesiumContainer" style={{ height: props.viewerHeight, width: props.viewerWidth }}></div>;
}

function addModel(cartesian, heading, pitch, roll, scale, item) {
  // var cartesian = Cesium.Cartesian3.fromDegrees(latitude, longitude, height);
  var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  var orientation = Cesium.Transforms.headingPitchRollQuaternion(cartesian, hpr);
  const newEntity = viewer.entities.add({
    id: item.NFTid,
    name: item.url,
    position: cartesian,
    orientation: orientation,
    model: {
      uri: item.url,
      minimumPixelSize: 0,
      scale: scale,
    },
  });
  return newEntity;
}

function DoubleClickToPlace(handler, place) {
  handler.setInputAction((click) => {
    if (click.position) {
      var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(click.position), viewer.scene);
      if (cartesian) {
        // increase height
        cartesian.z += 100;
        if (nft) {
          // make sure the entity is not already in the viewer
          entity = viewer.entities.getById(nft.NFTid);
          var newPosition = Cesium.Cartographic.fromCartesian(cartesian);

          if (entity) {
            // keep the height
            var newCartesian = Cesium.Cartesian3.fromRadians(
              newPosition.longitude,
              newPosition.latitude,
              Cesium.Cartographic.fromCartesian(entity.position._value).height
            );

            entity.position = newCartesian;
            entity.orientation = Cesium.Transforms.headingPitchRollQuaternion(
              cartesian,
              new Cesium.HeadingPitchRoll(0, 0, 0)
            );
          } else {
            var heading = Cesium.Math.toRadians(0);
            var pitch = 0;
            var roll = 0;
            var scale = 100;
            const newEntity = addModel(cartesian, heading, pitch, roll, scale, nft);
            viewer.flyTo(newEntity);
          }
          nft.longitude = newPosition.longitude;
          nft.latitude = newPosition.latitude;
          place(nft);
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  return handler;
}

function MoveEntity(update, click) {
  var leftDownFlag = false;
  const moveHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  // Select plane when mouse down
  moveHandler.setInputAction(function (movement) {
    leftDownFlag = true;
    var pickedObject = viewer.scene.pick(movement.position);
    if (Cesium.defined(pickedObject)) {
      if (pickedObject.id) {
        click(pickedObject.id.id);
      }
    }
    // } else {
    //   viewer.scene.screenSpaceCameraController.enableRotate = true; // lock the camera
    // }
    // }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  // Release plane on mouse up
  moveHandler.setInputAction(function () {
    leftDownFlag = false;
    if (nft) {
      if (nft.editing) {
        update(nft);
      }
    }
    // viewer.scene.screenSpaceCameraController.enableRotate = true;
  }, Cesium.ScreenSpaceEventType.LEFT_UP);
  // Update plane on mouse move
  moveHandler.setInputAction(function (movement) {
    if (leftDownFlag === true && entity != null) {
      var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.endPosition), viewer.scene);

      // keep the height
      var newPosition = Cesium.Cartographic.fromCartesian(cartesian);
      var newCartesian = Cesium.Cartesian3.fromRadians(
        newPosition.longitude,
        newPosition.latitude,
        Cesium.Cartographic.fromCartesian(entity.position._value).height
      );
      if (nft) {
        nft.longitude = newPosition.longitude;
        nft.latitude = newPosition.latitude;
      }
      entity.position = newCartesian;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  return moveHandler;
}
