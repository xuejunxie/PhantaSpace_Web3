import React, { useEffect } from "react";
import * as Cesium from "cesium";
import { useDispatch, useSelector } from "react-redux";
import { PLACE, UPDATE, CLICK, SELECT_LAND, SHOW_LAND } from "../redux/types";

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNmY0NjhmOS1iZGRjLTQ5ODgtYTQyOS0zNGFhZTQ3M2RlYzYiLCJpZCI6NzE5OTUsImlhdCI6MTYzNzIzODcyM30.C_x5USgZL8Gk2tZ7D3hd__1irF9-cyatRD-9GDaRBGc";
const dummyCredit = document.createElement("div");

var viewer = null;

var createHandler = null;
var landHandler = null;
var exploreHandler = null;

// this global variable is used to pass entity between useEffect on create and mouse event handler
var entity = null;

export default function Map(props) {
  const dispatch = useDispatch();
  const owned = useSelector((state) => state.map.owned);
  const all = useSelector((state) => state.map.all);
  const look = useSelector((state) => state.sidebar.look);

  const explore = useSelector((state) => state.sidebar.explore);
  const land = useSelector((state) => state.sidebar.land);
  const create = useSelector((state) => state.sidebar.create);

  const show_land = useSelector((state) => state.land.show_land);
  const selected_land = useSelector((state) => state.land.selected_land);

  // select land
  useEffect(() => {
    if (selected_land && selected_land.geocode) {
      const [precision, longitude, latitude, level, size, sizeX, sizeY, bottom, top] = parseGeocode(
        selected_land.geocode
      );

      viewer.entities.add({
        name: "test",
        wall: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(rectangleArray(longitude, latitude, sizeX, sizeY, top)),
          minimumHeights: [bottom, bottom, bottom, bottom, bottom],
          material: Cesium.Color.fromBytes(8, 182, 190, 100),
        },
      });
    }
  }, [selected_land]);

  useEffect(() => {
    if (show_land && show_land.geocode) {
      const [precision, longitude, latitude, level, size, sizeX, sizeY, bottom, top] = parseGeocode(
        selected_land.geocode
      );

      // Get a reference to the ellipsoid, with terrain on it.  (This API may change soon)
      var ellipsoid = viewer.scene.globe.ellipsoid;

      // Specify our point of interest.

      var pointOfInterest = Cesium.Cartographic.fromDegrees(longitude, latitude, top, new Cesium.Cartographic());

      viewer.camera.flyTo({
        destination: ellipsoid.cartographicToCartesian(pointOfInterest, new Cesium.Cartesian3()),
      });
    }
  }, [show_land]);

  // initialize the viewer
  useEffect(() => {
    viewer = new Cesium.Viewer("cesiumContainer", {
      terrainProvider: Cesium.createWorldTerrain({
        // requestWaterMask: true,
        // requestVertexNormals: true,
      }),
      shouldAnimate: true,
      animation: false,
      homeButton: false, // disable the default home button
      geocoder: true, // disable the default search button
      baseLayerPicker: false, // disable the default base layer button
      fullscreenButton: false, // disable the default full screen button
      timeline: true,
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

    // // enable anti-aliasing
    // viewer.scene.fxaa = true;

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

    // automatic play the animation after time adjustment
    viewer.timeline.container.onmouseup = (e) => {
      viewer.clockViewModel.shouldAnimate = true;
    };
  }, []);

  // handle mouse events for explore page
  useEffect(() => {
    const dispatchClick = (NFTid) => {
      dispatch({ type: CLICK, payload: NFTid });
    };
    if (explore) {
      exploreHandler = handleExplore(dispatchClick);
    } else {
      if (exploreHandler && !exploreHandler.isDestroyed()) {
        exploreHandler.destroy();
      }
    }
  }, [explore]);

  const dispatchPlace = (nft) => {
    dispatch({ type: PLACE, payload: nft });
  };

  const dispatchUpdate = (nft) => {
    dispatch({ type: UPDATE, payload: nft });
  };

  const dispatchClick = (NFTid) => {
    dispatch({ type: CLICK, payload: NFTid });
  };

  // handle mouse events for land page
  useEffect(() => {
    if (land) {
      landHandler = handleLand(dispatch);
    } else {
      if (landHandler && !landHandler.isDestroyed()) {
        landHandler.destroy();
      }
    }
  }, [land]);

  // clean up on explore page
  useEffect(() => {
    if (entity) {
      entity = null;
    }
  }, [explore]);

  // update the viewer when user edit the owned NFTs
  useEffect(() => {
    if (viewer) {
      const nft = owned.find((nft) => nft.selected === true);

      // handle mouse events for create page
      if (createHandler) {
        if (!createHandler.isDestroyed()) {
          createHandler.destroy();
        }
      }
      if (create) {
        createHandler = handleCreate(dispatchPlace, dispatchUpdate, dispatchClick, nft);
      }

      if (nft) {
        // find if the item exist in the viewer
        entity = viewer.entities.getById(nft.NFTid);

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

        // handle the update of the entity
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
  }, [owned, create]);

  // look at the entity when clicked on the list
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

  // put entity on the map when all is loaded
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
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: Cesium.JulianDate.fromIso8601(item.created),
        stop: item.removed
          ? Cesium.JulianDate.fromIso8601(item.removed)
          : Cesium.JulianDate.fromIso8601("9999-12-02T00:00:00Z"),
      }),
    ]),
    model: {
      uri: item.url,
      minimumPixelSize: 0,
      scale: scale,
    },
  });

  return newEntity;
}

function handleExplore(dispatchClick) {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (movement) {
    var pickedObject = viewer.scene.pick(movement.position);
    if (Cesium.defined(pickedObject)) {
      if (pickedObject.id) {
        dispatchClick(pickedObject.id.id);
      }
    }

    // } else {
    //   viewer.scene.screenSpaceCameraController.enableRotate = true; // lock the camera
    // }
    // }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  return handler;
}

function handleCreate(dispatchPlace, dispatchUpdate, dispatchClick, nft) {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

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
            var newCartesian = Cesium.Cartesian3.fromRadians(
              newPosition.longitude,
              newPosition.latitude,
              newPosition.height
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
          nft.height = newPosition.height;
          dispatchPlace(nft);
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

  var leftDownFlag = false;
  // Select plane when mouse down
  handler.setInputAction(function (movement) {
    leftDownFlag = true;
    var pickedObject = viewer.scene.pick(movement.position);
    if (Cesium.defined(pickedObject)) {
      if (pickedObject.id) {
        dispatchClick(pickedObject.id.id);
      }
    }

    //   viewer.scene.screenSpaceCameraController.enableRotate = true; // lock the camera
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  // Update plane on mouse move
  handler.setInputAction(function (movement) {
    if (leftDownFlag === true && entity != null) {
      var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.endPosition), viewer.scene);

      // keep the height
      var newPosition = Cesium.Cartographic.fromCartesian(cartesian);
      var newCartesian = Cesium.Cartesian3.fromRadians(
        newPosition.longitude,
        newPosition.latitude,
        // newPosition.height,
        Math.max(Cesium.Cartographic.fromCartesian(entity.position._value).height, newPosition.height)
      );
      if (nft) {
        nft.longitude = newPosition.longitude;
        nft.latitude = newPosition.latitude;
        // nft.height = newPosition.height;
        nft.height = Math.max(Cesium.Cartographic.fromCartesian(entity.position._value).height, newPosition.height);
      }
      entity.position = newCartesian;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // Release plane on mouse up
  handler.setInputAction(function () {
    leftDownFlag = false;
    if (nft) {
      if (nft.editing) {
        dispatchUpdate(nft);
      }
    }
    // viewer.scene.screenSpaceCameraController.enableRotate = true;
  }, Cesium.ScreenSpaceEventType.LEFT_UP);

  return handler;
}

// show squre on the map when the user move the mouse
function handleLand(dispatch) {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  // initialize the rectangle
  var landEntity = viewer.entities.add({
    name: "test",
    wall: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights([
        -90.0, 43.0, 0, -87.5, 45.0, 0, -85.0, 43.0, 0, -87.5, 41.0, 0, -90.0, 43.0, 0,
      ]),
      material: Cesium.Color.fromBytes(8, 182, 190, 100),
    },
  });

  // show a square on the floor when the mouse move

  handler.setInputAction(function (movement) {
    const cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.endPosition), viewer.scene);

    if (cartesian) {
      drawLand(cartesian, landEntity);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // select the land when the mouse click
  handler.setInputAction(function (movement) {
    const cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.position), viewer.scene);
    if (cartesian) {
      const geocode = drawLand(cartesian, landEntity);
      dispatch({
        type: SELECT_LAND,
        payload: {
          geocode: geocode,
        },
      });
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  return handler;
}

// function to draw land
function drawLand(cartesian, landEntity) {
  var newPosition = Cesium.Cartographic.fromCartesian(cartesian);
  const longitude = Cesium.Math.toDegrees(newPosition.longitude);
  const latitude = Cesium.Math.toDegrees(newPosition.latitude);
  const precision = 4;
  const size = 0.1 ** precision;
  const sizeX = size;
  const sizeY = size;
  // const sizeY = size * Math.cos((latitude / 180) * Math.PI).toPrecision(precision);
  const earth_radius = 6378137;
  const heightUnit = ((earth_radius * sizeY) / 180) * Math.PI;

  const longitudeRounded = Math.round(longitude / sizeX) * sizeX;
  const latitudeRounded = Math.round(latitude / sizeY) * sizeY;

  const longitudePositive = (longitudeRounded + 180) * 10 ** precision;
  const longitudeCode = longitudePositive
    .toFixed(0)
    .toString()
    .padStart(3 + precision, "0");

  const latitudePositive = (latitudeRounded + 90) * 10 ** precision;
  const latitudeCode = latitudePositive
    .toFixed(0)
    .toString()
    .padStart(3 + precision, "0");
  const level = newPosition.height > 0 ? Math.round(newPosition.height / heightUnit) : 0;
  const bottom = level ? level * heightUnit : -50;
  const top = (level + 1) * heightUnit;

  const levelCode = level.toString().padStart(3 + precision, "0");

  landEntity.wall.minimumHeights = [bottom, bottom, bottom, bottom, bottom];
  landEntity.wall.positions = new Cesium.CallbackProperty(function () {
    return Cesium.Cartesian3.fromDegreesArrayHeights(
      rectangleArray(longitudeRounded, latitudeRounded, sizeX, sizeY, top)
    );
  }, false); // prevent flashing

  return precision.toString() + longitudeCode + latitudeCode + levelCode;
}

// function to get the rectangle array
function rectangleArray(longitude, latitude, sizeX, sizeY, height) {
  return [
    longitude - sizeX / 2,
    latitude - sizeY / 2,
    height,
    longitude + sizeX / 2,
    latitude - sizeY / 2,
    height,
    longitude + sizeX / 2,
    latitude + sizeY / 2,
    height,
    longitude - sizeX / 2,
    latitude + sizeY / 2,
    height,
    longitude - sizeX / 2,
    latitude - sizeY / 2,
    height,
  ];
}

// function to parse the geocode
function parseGeocode(geocode) {
  const precision = parseInt(geocode[0]);
  const longitude = parseFloat(geocode.substring(1, 4 + precision)) * 0.1 ** precision - 180;
  const latitude = parseFloat(geocode.substring(4 + precision, 7 + 2 * precision)) * 0.1 ** precision - 90;
  const level = parseInt(geocode.substring(7 + 2 * precision, 7 + 2 * precision + 3 + precision));
  const size = 0.1 ** precision;
  const sizeX = size;
  const sizeY = size;
  const earth_radius = 6378137;
  const heightUnit = ((earth_radius * sizeY) / 180) * Math.PI;

  const bottom = level ? level * heightUnit : -50;
  const top = (level + 1) * heightUnit;

  return [precision, longitude, latitude, level, size, sizeX, sizeY, bottom, top];
}
