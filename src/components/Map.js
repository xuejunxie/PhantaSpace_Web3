import React, { useEffect } from "react";
import * as Cesium from "cesium";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  PLACE_NFT,
  PLACE_BOX,
  UPDATE,
  CLICK,
  SELECT_SPACE,
  MAP_LOADED,
  SPACE_PICKED,
  KEY_PRESSED,
  BOX_PLACED,
  DELETE_BOX,
  CHECK_IN,
} from "../redux/types";
import sha256 from "crypto-js/sha256";
import AxisAlignedBoundingBox from "cesium/Source/Core/AxisAlignedBoundingBox";

Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNmY0NjhmOS1iZGRjLTQ5ODgtYTQyOS0zNGFhZTQ3M2RlYzYiLCJpZCI6NzE5OTUsImlhdCI6MTYzNzIzODcyM30.C_x5USgZL8Gk2tZ7D3hd__1irF9-cyatRD-9GDaRBGc";
const dummyCredit = document.createElement("div");

var viewer = null;

var createHandler = null;
var spaceHandler = null;
var exploreHandler = null;
var placeBoxHandler = null;

// this global variable is used to pass entity between useEffect on create and mouse event handler
var entity = null;

var box_color = { rgb: { r: "255", g: "255", b: "255", a: "1" } };

// this global variable is used to pass selected_space between selected_space and space_level
var current_space_entity = null;
var current_box_entity = null;
var all_space_entity = {};

export default function Map(props) {
  const dispatch = useDispatch();
  const owned = useSelector((state) => state.map.owned);
  const all = useSelector((state) => state.map.all);
  const look = useSelector((state) => state.sidebar.look);

  const explore = useSelector((state) => state.sidebar.explore);
  const pick_a_space = useSelector((state) => state.sidebar.pick_a_space);
  const create = useSelector((state) => state.sidebar.create);

  const show_space = useSelector((state) => state.space.show_space);
  const selected_space = useSelector((state) => state.sidebar.selected_space);

  const all_spaces = useSelector((state) => state.space.all);
  const show_all_spaces = useSelector((state) => state.sidebar.show_all_spaces);

  const jump_in = useSelector((state) => state.sidebar.jump_in);
  const place_box = useSelector((state) => state.sidebar.place_box);
  box_color = useSelector((state) => state.place.box_color);

  // check if the map is loaded
  var loaded = false;
  var numTiles = 0;
  var newNumTiles = 0;

  function checkLoad() {
    if (!loaded) {
      newNumTiles = viewer.scene.globe._surface._tileLoadQueueMedium.length;
      if (newNumTiles === 0 && numTiles > newNumTiles) {
        loaded = true;
        dispatch({ type: MAP_LOADED });
        console.log("map loaded");
        // spinGlobe(viewer);
        // Hide the loading overlay.
      } else {
        numTiles = newNumTiles;
        setTimeout(checkLoad, 100);
      }
    }
  }

  var last_all_space = [];

  useEffect(() => {
    if (all_spaces !== last_all_space) {
      const difference = all_spaces.filter((item) => !last_all_space.includes(item));
      difference.map((item) => {
        const { precision, longitude, latitude, level, size, bottom, top, heightUnit } = parseGeocode(item.geocode);
        if (all_space_entity[item.geocode] === undefined) {
          all_space_entity[item.geocode] = viewer.entities.add({
            name: item.geocode,
            wall: {
              positions: Cesium.Cartesian3.fromDegreesArray(rectangleArray(longitude, latitude, size)),
              minimumHeights: [bottom, bottom, bottom, bottom, bottom],
              maximumHeights: [top, top, top, top, top],
              material: Cesium.Color.fromBytes(255, 255, 255, 100),
              outline: true,
            },
          });
        }
      });
      last_all_space = all_spaces;
    }
  }, [all_spaces]);

  useEffect(() => {
    if (show_all_spaces) {
      Object.keys(all_space_entity).map((item) => {
        all_space_entity[item].show = true;
      });
    } else {
      Object.keys(all_space_entity).map((item) => {
        all_space_entity[item].show = false;
      });
    }
  }, [show_all_spaces]);

  // select space
  useEffect(() => {
    if (selected_space && selected_space.geocode) {
      const { precision, longitude, latitude, level, size, bottom, top, heightUnit } = parseGeocode(
        selected_space.geocode
      );
      dispatch({ type: SPACE_PICKED });

      if (current_space_entity === null) {
        current_space_entity = viewer.entities.add({
          name: "selected_space",
          wall: {
            positions: Cesium.Cartesian3.fromDegreesArray(rectangleArray(longitude, latitude, size)),
            minimumHeights: [bottom, bottom, bottom, bottom, bottom],
            maximumHeights: [top, top, top, top, top],
            material: Cesium.Color.fromBytes(8, 182, 190, 100),
            outline: true,
          },
        });
      } else {
        current_space_entity.wall.minimumHeights = [bottom, bottom, bottom, bottom, bottom];
        current_space_entity.wall.maximumHeights = [top, top, top, top, top];
        current_space_entity.wall.positions = new Cesium.CallbackProperty(function () {
          return Cesium.Cartesian3.fromDegreesArray(rectangleArray(longitude, latitude, size));
        }, false); // prevent flashing
      }
    } else {
      if (current_space_entity) {
        viewer.entities.remove(current_space_entity);
        current_space_entity = null;
      }
    }
  }, [selected_space]);

  useEffect(() => {
    if (show_space && show_space.geocode) {
      const { precision, longitude, latitude, level, size, bottom, top, heightUnit } = parseGeocode(show_space.geocode);

      // Get a reference to the ellipsoid, with terrain on it.  (This API may change soon)
      var ellipsoid = viewer.scene.globe.ellipsoid;

      // Specify our point of interest.

      var pointOfInterest = Cesium.Cartographic.fromDegrees(
        longitude + size / 2,
        latitude + size / 2,
        top + heightUnit * 1.5
      );

      viewer.camera.flyTo({
        destination: ellipsoid.cartographicToCartesian(pointOfInterest),
        duration: 2,
      });
    }
  }, [show_space]);

  // initialize the viewer
  useEffect(() => {
    const imageryViewModels = [];
    imageryViewModels.push(
      new Cesium.ProviderViewModel({
        name: "Watercolor",
        iconUrl: Cesium.buildModuleUrl("Widgets/Images/ImageryProviders/stamenWatercolor.png"),
        tooltip: "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA.",
        creationFunction: function () {
          return new Cesium.OpenStreetMapImageryProvider({
            url: "https://stamen-tiles.a.ssl.fastly.net/watercolor/",
          });
        },
      })
    );

    imageryViewModels.push(
      new Cesium.ProviderViewModel({
        name: "Real world",
        iconUrl: Cesium.buildModuleUrl("Widgets/Images/ImageryProviders/bingAerial.png"),
        tooltip: "Map tiles by Bing",
        creationFunction: function () {
          return new Cesium.BingMapsImageryProvider({
            url: "https://dev.virtualearth.net",
            key: process.env.REACT_APP_BING_API_KEY,
            mapStyle: Cesium.BingMapsStyle.AERIAL,
          });
        },
      })
    );

    viewer = new Cesium.Viewer("cesiumContainer", {
      terrainProvider: Cesium.createWorldTerrain({
        // requestWaterMask: true,
        // requestVertexNormals: true,
      }),

      // terrainProvider: new Cesium.CesiumTerrainProvider({
      //   url: Cesium.IonResource.fromAssetId(3957),
      // }),
      imageryProviderViewModels: imageryViewModels,
      selectedImageryProviderViewModel: imageryViewModels[0],
      terrainProviderViewModels: [],

      shouldAnimate: true,
      animation: false,
      homeButton: false, // disable the default home button
      geocoder: true, // disable the default search button
      baseLayerPicker: true, // disable the default base layer button
      fullscreenButton: false, // disable the default full screen button
      timeline: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      creditContainer: dummyCredit,
      infoBox: false,
      vrButton: false,
      showRenderLoopErrors: false,

      imageryProvider: false,
    });

    // check if the map is loaded
    checkLoad();

    viewer.scene.pickTranslucentDepth = true;

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
    // viewer.imageryLayers.removeAll();

    // const imageryProvider = new Cesium.OpenStreetMapImageryProvider({
    //   url: "https://stamen-tiles.a.ssl.fastly.net/watercolor/",
    //   fileExtension: "jpg",
    //   credit: "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA.",
    // });
    // viewer.imageryLayers.addImageryProvider(imageryProvider);

    // change saturation
    // var layer = viewer.imageryLayers.get(0);
    // layer.saturation = 0;

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
      0.0116951918898415
    );
    viewer.scene.camera.setView({
      destination: initialPosition,
      orientation: initialOrientation,
      endTransform: Cesium.Matrix4.IDENTITY,
    });

    // turn off stars
    // viewer.scene.skyBox.show = false;

    // Load the OSM buildings tileset

    viewer.scene.primitives.add(
      new Cesium.Cesium3DTileset({
        url: Cesium.IonResource.fromAssetId(96188),
      })
    );

    // viewer.scene.primitives.add(
    //   new Cesium.Cesium3DTileset({
    //     url: Cesium.IonResource.fromAssetId(775877),
    //   })
    // );

    // Boston city
    // viewer.scene.primitives.add(
    //   new Cesium.Cesium3DTileset({
    //     url: Cesium.IonResource.fromAssetId(354759),
    //   })
    // );

    // automatic play the animation after time adjustment
    // viewer.timeline.container.onmouseup = (e) => {
    //   viewer.clockViewModel.shouldAnimate = true;
    // };
  }, []);

  // // codes to spin the globe for fun
  // var lastNow;

  // function spinIt(scene, time) {
  //   var now = Date.now();
  //   var spinRate = ((360 / 8) * 3.1415928) / 180;
  //   var delta = (now - lastNow) / 1000;
  //   lastNow = now;
  //   viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, spinRate * delta);
  // }
  // function spinGlobe(viewer) {
  //   lastNow = Date.now();
  //   viewer.scene.postRender.addEventListener(spinIt);
  // }

  // handle mouse events for explore page
  useEffect(() => {
    if (explore) {
      exploreHandler = handleExplore(dispatch);
    } else {
      if (exploreHandler && !exploreHandler.isDestroyed()) {
        exploreHandler.destroy();
      }
    }
  }, [explore]);

  // handle mouse events for space page
  useEffect(() => {
    if (pick_a_space && all_spaces) {
      spaceHandler = handleSpace(dispatch);
    } else {
      if (spaceHandler && !spaceHandler.isDestroyed()) {
        spaceHandler.destroy();
      }
    }
  }, [pick_a_space, all_spaces]);

  // load all boxes

  const boxes_placed = useSelector((state) => state.place.boxes_placed);
  useEffect(() => {
    if (boxes_placed.length > 0) {
      boxes_placed.map((box) => {
        drawBox(
          box.geocode,
          box.lengthUnit,
          box.widthUnit,
          box.longitudeRounded,
          box.latitudeRounded,
          box.size,
          box.bottom,
          box.box_color.rgb
        );
      });
    }
  }, [boxes_placed]);

  // add box placed by others
  const box_placed_by_others = useSelector((state) => state.place.box_placed_by_others);
  useEffect(() => {
    if (box_placed_by_others) {
      drawBox(
        box_placed_by_others.geocode,
        box_placed_by_others.lengthUnit,
        box_placed_by_others.widthUnit,
        box_placed_by_others.longitudeRounded,
        box_placed_by_others.latitudeRounded,
        box_placed_by_others.size,
        box_placed_by_others.bottom,
        box_placed_by_others.box_color.rgb
      );
    }
  }, [box_placed_by_others]);

  // remove box deteled by others
  const box_deleted_by_others = useSelector((state) => state.place.box_deleted_by_others);
  useEffect(() => {
    if (box_deleted_by_others) {
      // viewer.scene.primitives.remove(Cesium.PrimitiveCollection.get(box_deleted_by_others.geocode));
      //remove a box by geocode
      viewer.scene.primitives._primitives.map((primitive) => {
        if (primitive.constructor.name === "Primitive" && primitive._instanceIds[0] === box_deleted_by_others.geocode) {
          viewer.scene.primitives.remove(primitive);
        }
        // if (primitive._instanceIds[0] === box_deleted_by_others.geocode) {
        //   viewer.scene.primitives.remove(primitive);
        // }
      });
    }
  }, [box_deleted_by_others]);

  useEffect(() => {
    if (place_box) {
      placeBoxHandler = handlePlaceBox(dispatch);
    } else {
      if (placeBoxHandler && !placeBoxHandler.isDestroyed()) {
        placeBoxHandler.destroy();
      }
    }
  }, [place_box]);

  // clean up on explore page
  useEffect(() => {
    if (entity) {
      entity = null;
    }
  }, [explore]);

  // update the viewer when user edit the owned NFTs
  useEffect(() => {
    if (viewer) {
      if (create == "select") {
        var nft = owned.find((nft) => nft.selected === true);
      }

      // handle mouse events for create page
      if (createHandler) {
        if (!createHandler.isDestroyed()) {
          createHandler.destroy();
        }
      }
      if (create) {
        createHandler = handleCreate(dispatch, nft);
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
          var cartesian = Cesium.Cartesian3.fromRadians(nft.longitude, nft.latitude, nft.height);
          entity.position = new Cesium.CallbackProperty(function () {
            return cartesian;
          }, false);

          // update entity scale
          if (entity.model) {
            entity.model.scale = nft.scale;
          } else {
            entity.box.dimensions = new Cesium.CallbackProperty(function () {
              return new Cesium.Cartesian3(nft.wide * nft.scale, 0, nft.tall * nft.scale);
            }, false);
          }
          // update entity orientation
          var heading = Cesium.Math.toRadians(nft.heading);
          var pitch = Cesium.Math.toRadians(nft.pitch);
          var roll = Cesium.Math.toRadians(nft.roll);
          var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
          var orientation = Cesium.Transforms.headingPitchRollQuaternion(cartesian, hpr);
          entity.orientation = new Cesium.CallbackProperty(function () {
            return orientation;
          }, false);
        }
      }
    }
  }, [owned, create]);

  // FPV camera
  const onMouseMove = (event) => {
    const camera = viewer.scene.camera;
    const movementFactor = 0.001;
    if (document.pointerLockElement === viewer.scene.canvas) {
      const heading = camera.heading + event.movementX * movementFactor;
      const pitch = camera.pitch - event.movementY * movementFactor;
      // var box = Cesium.Cartesian3.add(
      //   camera.position,
      //   Cesium.Cartesian3.multiplyByScalar(camera.direction, 200, new Cesium.Cartesian3()),
      //   new Cesium.Cartesian3()
      // );
      // drawSpace(box, 4);
      camera.setView({
        orientation: {
          heading: heading,
          pitch: pitch,
        },
      });
    }
  };

  var move_forward = false;
  var move_back = false;
  var move_left = false;
  var move_right = false;
  var move_up = false;
  var high_speed = 50;
  var low_speed = 2;
  var move_speed = 2;
  var check_in = false;

  // FPV move
  const onKeyDown = (event) => {
    const keyCode = event.keyCode;
    if (event.shiftKey) {
      move_speed = high_speed;
    }
    switch (keyCode) {
      case "W".charCodeAt(0):
        move_forward = true;
        return;
      case "S".charCodeAt(0):
        move_back = true;
        return;
      case "D".charCodeAt(0):
        move_right = true;
        return;
      case "A".charCodeAt(0):
        move_left = true;
        return;
      case 32: // space
        move_up = true;
        return;
      case "E".charCodeAt(0):
        check_in = true;
        return;
      default:
        return;
    }
  };

  const onKeyUp = (event) => {
    const keyCode = event.keyCode;
    if (!event.shiftKey) {
      move_speed = low_speed;
    }
    switch (keyCode) {
      case "W".charCodeAt(0):
        move_forward = false;
        return;
      case "S".charCodeAt(0):
        move_back = false;
        return;
      case "D".charCodeAt(0):
        move_right = false;
        return;
      case "A".charCodeAt(0):
        move_left = false;
        return;
      case 32: // space
        move_up = false;
        return;
      case "E".charCodeAt(0):
        check_in = false;
        return;
      default:
        return;
    }
  };

  // var key_pressed = useSelector((state) => state.jumpIn.key_pressed);
  // handle the FPV camera movement
  const onClockTik = (clock) => {
    const camera = viewer.scene.camera;
    const globe = viewer.scene.globe;
    var destination = Cesium.Cartesian3.ZERO;
    let dt = clock._clockStep * move_speed;
    var dHeight = 0;
    if (move_forward) {
      destination = Cesium.Cartesian3.add(
        destination,
        Cesium.Cartesian3.multiplyByScalar(camera.direction, dt, new Cesium.Cartesian3()),
        new Cesium.Cartesian3()
      );
    }
    if (move_back) {
      destination = Cesium.Cartesian3.add(
        destination,
        Cesium.Cartesian3.multiplyByScalar(camera.direction, -dt, new Cesium.Cartesian3()),
        new Cesium.Cartesian3()
      );
    }
    if (move_right) {
      destination = Cesium.Cartesian3.add(
        destination,
        Cesium.Cartesian3.multiplyByScalar(camera.right, dt, new Cesium.Cartesian3()),
        new Cesium.Cartesian3()
      );
    }
    if (move_left) {
      destination = Cesium.Cartesian3.add(
        destination,
        Cesium.Cartesian3.multiplyByScalar(camera.right, -dt, new Cesium.Cartesian3()),
        new Cesium.Cartesian3()
      );
    }
    if (move_up) {
      dHeight = dt;
    }

    if (check_in) {
      dispatch({
        type: CHECK_IN,
        payload: {
          longitude: camera.positionCartographic.longitude,
          latitude: camera.positionCartographic.latitude,
          height: camera.positionCartographic.height,
        },
      });
    }

    if (move_forward || move_back || move_left || move_right || move_up) {
      destination = Cesium.Cartesian3.add(camera.position, destination, new Cesium.Cartesian3());

      var destinationCartographic = globe.ellipsoid.cartesianToCartographic(destination);

      var destination_height = globe.getHeight(destinationCartographic);

      destinationCartographic.height = Math.max(destination_height + 1.6, destinationCartographic.height + dHeight);
      destination = globe.ellipsoid.cartographicToCartesian(destinationCartographic);
      // var box = Cesium.Cartesian3.add(
      //   destination,
      //   Cesium.Cartesian3.multiplyByScalar(camera.direction, 200, new Cesium.Cartesian3()),
      //   new Cesium.Cartesian3()
      // );
      // drawSpace(box, 4);
      camera.setView({
        destination: destination,
        orientation: {
          heading: camera.heading,
          pitch: camera.pitch,
          roll: camera.roll,
        },
        endTransform: Cesium.Matrix4.IDENTITY,
      });
    }

    // var cameraCartographic = ellipsoid.cartesianToCartographic(camera.position);
    // var height = cameraCartographic.height;
    // if (height < 160) {
    //   camera.setView({
    //     destination: ellipsoid.cartographicToCartesian(cameraCartographic.longitude, cameraCartographic.latitude, 1.6),
    //   });
    // }
  };

  // click to disengage the FPV camera
  // const onClick = (event) => {
  //   // if (document.pointerLockElement === viewer.scene.canvas) {
  //   //   document.exitPointerLock();
  //   // }
  //   // console.log(event);
  // };

  //  comment out the event.target.setPointerCapture(event.pointerId);
  //   in node_modules/cesium/Source/Core/ScreenSpaceEventHandler.js
  //   to avoid the "InvalidStateError"
  function getMobileOperatingSystem() {
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Windows Phone must come first because its UA also contains "Android"
    if (/windows phone/i.test(userAgent)) {
      return "Windows Phone";
    }

    if (/android/i.test(userAgent)) {
      return "Android";
    }

    // iOS detection from: http://stackoverflow.com/a/9039885/177710
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return "iOS";
    }

    return "unknown";
  }

  useEffect(() => {
    const canvas = viewer.scene.canvas;
    if (jump_in) {
      // click to engage the FPV camera
      if (getMobileOperatingSystem() != "iOS") {
        canvas.requestPointerLock();
        canvas.onclick = () => {
          if (document.pointerLockElement != viewer.scene.canvas) {
            canvas.requestPointerLock();
          } else {
            // click to disengage the FPV camera
            // document.exitPointerLock();
          }
        };
      }

      document.addEventListener("mousemove", onMouseMove);
      // document.addEventListener("click", onClick);
      document.addEventListener("keydown", onKeyDown);
      document.addEventListener("keyup", onKeyUp);
      viewer.clock.onTick.addEventListener(onClockTik);
    } else {
      canvas.onclick = null;
      document.removeEventListener("mousemove", onMouseMove);
      // document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      viewer.clock.onTick.removeEventListener(onClockTik);
    }
  }, [jump_in]);

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
    // name: item.url,
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
  });

  if (item.model) {
    newEntity.model = {
      // uri: item.metadata.animation_original_url,
      // uri: item.metadata.animation_url,
      uri: item.model,
      // uri: new Cesium.Resource({
      //   url: item.metadata.animation_original_url,
      //   headers: {
      //     "X-API-KEY": process.env.REACT_APP_OPENSEA_X_API_KEY,
      //   },
      // }),
      minimumPixelSize: 0,
      scale: scale,
    };
  } else {
    if (item.video) {
      newEntity.box = {
        dimensions: new Cesium.Cartesian3(item.wide * item.scale, 0, item.tall * item.scale),
        material: document.getElementById(item.NFTid + "-video"),
      };
    } else {
      newEntity.box = {
        dimensions: new Cesium.Cartesian3(item.wide * item.scale, 0, item.tall * item.scale),
        material: item.image,
      };
    }
  }

  return newEntity;
}

function handleExplore(dispatch) {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(function (movement) {
    var pickedObject = viewer.scene.pick(movement.position);
    // const position = viewer.scene.globe.ellipsoid.cartesianToCartographic(pickedObject, new Cesium.Cartographic());
    // const geocode = encodeGeocode(position.longitude, position.latitude, position.height, 4);
    // console.log(geocode);
    if (Cesium.defined(pickedObject)) {
      if (pickedObject.id) {
        dispatch({ type: CLICK, payload: pickedObject.id.id });
      }
    }

    // } else {
    //   viewer.scene.screenSpaceCameraController.enableRotate = true; // lock the camera
    // }
    // }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  return handler;
}

function handleCreate(dispatch, nft) {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  handler.setInputAction((click) => {
    if (click.position) {
      var cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(click.position), viewer.scene);
      if (cartesian) {
        // increase height

        // cartesian.z = nft.height * nft.scale;
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
            var scale = 1;
            const newEntity = addModel(cartesian, heading, pitch, roll, scale, nft);
            viewer.flyTo(newEntity);
          }
          nft.longitude = newPosition.longitude;
          nft.latitude = newPosition.latitude;
          nft.height = newPosition.height;
          dispatch({ type: PLACE_NFT, payload: nft });
          dispatch({ type: EDIT, payload: nft });
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
        dispatch({ type: CLICK, payload: pickedObject.id.id });
      }
    }

    //   viewer.scene.screenSpaceCameraController.enableRotate = true; // lock the camera
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  // Update plane on mouse move
  handler.setInputAction(function (movement) {
    if (leftDownFlag === true && entity != null) {
      var mouseCartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.endPosition), viewer.scene);

      // keep the height
      var newPosition = Cesium.Cartographic.fromCartesian(mouseCartesian);
      var newHeight = Math.max(nft.height, newPosition.height);
      var newCartesian = Cesium.Cartesian3.fromRadians(
        newPosition.longitude,
        newPosition.latitude,
        // newPosition.height,
        newHeight
      );
      if (nft) {
        nft.longitude = newPosition.longitude;
        nft.latitude = newPosition.latitude;
        // nft.height = newPosition.height;
        nft.height = newHeight;
      }
      entity.position = newCartesian;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // Release plane on mouse up
  handler.setInputAction(function () {
    leftDownFlag = false;
    if (nft) {
      if (nft.editing) {
        dispatch({ type: UPDATE, payload: nft });
      }
    }
    // viewer.scene.screenSpaceCameraController.enableRotate = true;
  }, Cesium.ScreenSpaceEventType.LEFT_UP);

  return handler;
}

// show squre on the map when the user move the mouse
function handleSpace(dispatch) {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

  // show a square on the floor when the mouse move

  handler.setInputAction(function (movement) {
    const cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.endPosition), viewer.scene);

    if (cartesian) {
      drawSpace(cartesian, 1);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // select the space when the mouse click
  handler.setInputAction(function (movement) {
    const cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.position), viewer.scene);
    if (cartesian) {
      const geocode = drawSpace(cartesian, 1);
      dispatch({ type: SPACE_PICKED });
      dispatch({
        type: SELECT_SPACE,
        payload: {
          geocode: geocode,
        },
      });
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  return handler;
}

// function to haldle of placing a box
function handlePlaceBox(dispatch) {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  const precision = 4;
  handler.setInputAction(function (movement) {
    const cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.endPosition), viewer.scene);

    if (cartesian) {
      // var pickedObject = viewer.scene.pick(movement.endPosition);
      // var pickPosition = viewer.scene.pickPosition(movement.endPosition);
      // console.log(pickedObject);
      // const position = viewer.scene.globe.ellipsoid.cartesianToCartographic(pickPosition, new Cesium.Cartographic());
      // putBox(cartesian, precision);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // select the space when the mouse click
  handler.setInputAction(function (movement) {
    // const cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(movement.position), viewer.scene);
    const pickPosition = viewer.scene.pickPosition(movement.position);
    const cameraPosition = viewer.camera.positionWC;
    const boxPosition = Cesium.Cartesian3.add(
      pickPosition,
      Cesium.Cartesian3.multiplyByScalar(
        Cesium.Cartesian3.subtract(cameraPosition, pickPosition, new Cesium.Cartesian3()),
        0.001,
        new Cesium.Cartesian3()
      ),
      new Cesium.Cartesian3()
    );
    // console.log(cartesian, pickPosition);
    if (boxPosition) {
      const box_info = putBox(boxPosition, precision);

      // current_box_entity.rectangle.material = Cesium.Color.fromBytes(8, 182, 190, 255);
      // current_box_entity = null;
      dispatch({
        type: BOX_PLACED,
        payload: box_info,
      });
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // right click to remove the box
  handler.setInputAction(function (movement) {
    const pickedObject = viewer.scene.pick(movement.position);
    if (pickedObject) {
      if ("primitive" in pickedObject) {
        viewer.scene.primitives.remove(pickedObject.primitive);
        dispatch({
          type: DELETE_BOX,
          payload: pickedObject.id,
        });
      }
    }
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

  return handler;
}

// function to draw space
function drawSpace(cartesian, precision) {
  var newPosition = Cesium.Cartographic.fromCartesian(cartesian);
  const longitude = Cesium.Math.toDegrees(newPosition.longitude);
  const latitude = Cesium.Math.toDegrees(newPosition.latitude);
  const height = newPosition.height;
  const size = 0.1 ** precision;
  // const size = size * Math.cos((latitude / 180) * Math.PI).toPrecision(precision);
  const earth_radius = 6378137; // earth equatorial radius in meters
  const heightUnit = ((earth_radius * size) / 180) * Math.PI;

  const longitudeRounded = Math.floor(longitude / size) * size;
  const latitudeRounded = Math.floor(latitude / size) * size;

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
  const levelSign = height + 50 > 0 ? "3" : "1";
  const level = Math.round(height / heightUnit);
  const bottom = level * heightUnit - 50;
  const top = (level + 1) * heightUnit - 50;

  const levelCode = level ? Math.abs(level).toString() : "";
  const geocode = levelCode + levelSign + latitudeCode + longitudeCode + precision.toString();

  if (current_space_entity === null) {
    current_space_entity = viewer.entities.add({
      name: "selected_space",
      wall: {
        positions: Cesium.Cartesian3.fromDegreesArray(rectangleArray(longitudeRounded, latitudeRounded, size)),
        minimumHeights: [bottom, bottom, bottom, bottom, bottom],
        maximumHeights: [top, top, top, top, top],
        material: Cesium.Color.fromBytes(8, 182, 190, 100),
        outline: true,
      },
    });
  } else {
    current_space_entity.wall.minimumHeights = [bottom, bottom, bottom, bottom, bottom];
    current_space_entity.wall.maximumHeights = [top, top, top, top, top];
    current_space_entity.wall.positions = new Cesium.CallbackProperty(function () {
      return Cesium.Cartesian3.fromDegreesArray(rectangleArray(longitudeRounded, latitudeRounded, size));
    }, false); // prevent flashing
  }
  return geocode;
}

function putBox(cartesian, precision) {
  var newPosition = Cesium.Cartographic.fromCartesian(cartesian);
  const longitude = Cesium.Math.toDegrees(newPosition.longitude);
  const latitude = Cesium.Math.toDegrees(newPosition.latitude);
  const height = newPosition.height;
  const size = 0.1 ** precision;
  const sizeY = size * Math.cos((latitude / 180) * Math.PI);
  const earth_radius = 6378137; // earth equatorial radius in meters
  const widthUnit = ((earth_radius * size) / 180) * Math.PI;
  const lengthUnit = ((earth_radius * sizeY) / 180) * Math.PI * 1.01;

  const longitudeRounded = Math.floor(longitude / size) * size;
  const latitudeRounded = Math.floor(latitude / size) * size;

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
  const levelSign = height + 50 > 0 ? "3" : "1";
  const level = Math.round(height / widthUnit);
  const bottom = level * widthUnit;
  const top = (level + 1) * widthUnit;

  const levelCode = level ? Math.abs(level).toString() : "";
  const geocode = levelCode + levelSign + latitudeCode + longitudeCode + precision.toString();

  drawBox(geocode, lengthUnit, widthUnit, longitudeRounded, latitudeRounded, size, bottom, box_color.rgb);

  // return geocode;
  return { geocode, lengthUnit, widthUnit, longitudeRounded, latitudeRounded, size, bottom, box_color };
}

function drawBox(geocode, lengthUnit, widthUnit, longitudeRounded, latitudeRounded, size, bottom, color) {
  viewer.scene.primitives.add(
    new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        id: geocode,
        geometry: Cesium.BoxGeometry.fromDimensions({
          vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
          dimensions: new Cesium.Cartesian3(lengthUnit, widthUnit, widthUnit),
        }),
        modelMatrix: Cesium.Matrix4.multiplyByTranslation(
          Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(longitudeRounded + size / 2, latitudeRounded + size / 2)
          ),
          new Cesium.Cartesian3(0.0, 0.0, bottom),
          new Cesium.Matrix4()
        ),
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.fromBytes(color.r, color.g, color.b, color.a * 255)
          ),
        },
      }),
      appearance: new Cesium.PerInstanceColorAppearance({
        closed: true,
        translucent: false,
      }),
    })
  );
}

// function to get the rectangle array
function rectangleArray(longitude, latitude, size) {
  return [
    longitude,
    latitude,
    longitude + size,
    latitude,
    longitude + size,
    latitude + size,
    longitude,
    latitude + size,
    longitude,
    latitude,
  ];
}

// function to parse the geocode
function parseGeocode(geocode) {
  const l = geocode.length;
  const precision = parseInt(geocode[l - 1]);
  const longitude = parseFloat(geocode.substring(l - precision - 4, l - 1)) * 0.1 ** precision - 180;
  const latitude = parseFloat(geocode.substring(l - 7 - 2 * precision, l - precision - 4)) * 0.1 ** precision - 90;
  const levelSign = parseInt(geocode[l - 8 - 2 * precision]);
  const levelRaw = parseInt(geocode.substring(0, l - 8 - 2 * precision)) * (levelSign - 2);
  const level = levelRaw ? levelRaw : 0; //  In case level is 0 levelRaw is NaN
  const size = 0.1 ** precision; // uint size in degree

  // console.log(longitude, latitude, levelSign, level);

  const earth_radius = 6378137; // earth equatorial radius in meters
  const heightUnit = ((earth_radius * size) / 180) * Math.PI;

  const bottom = level * heightUnit - 50; // -50 to make the land below the earth ellipsoid within the level 0
  const top = (level + 1) * heightUnit - 50;

  return {
    precision: precision,
    longitude: longitude,
    latitude: latitude,
    levelSign: levelSign,
    level: level,
    size: size,
    bottom: bottom, // bottom height relative to the earth ellipsoid - 50 meters
    top: top, // bottom height relative to the earth ellipsoid - 50 meters
    heightUnit: heightUnit,
  };
}

function decodeGeocode(geocode) {
  const p = geocode % 10;

  const longitude = parseFloat((((geocode / 10 ** (p + 1)) % 1000) - 180).toFixed(p));

  const latitude = parseFloat((((geocode / 10 ** (2 * p + 4)) % 1000) - 90).toFixed(p));

  const levelSign = parseInt((geocode / 10 ** (2 * p + 7)) % 10);

  const level = parseInt(geocode / 10 ** (2 * p + 8)) * (levelSign - 2);

  const size = 0.1 ** p; // uint size in degree

  const earth_radius = 6378137; // earth equatorial radius in meters

  const heightUnit = ((earth_radius * size) / 180) * Math.PI;

  const bottom = level * heightUnit - 50; // -50 to make the land below the earth ellipsoid within the level 0

  const top = (level + 1) * heightUnit - 50;

  return {
    precision: p,
    longitude: longitude,
    latitude: latitude,
    levelSign: levelSign,
    level: level,
    size: size,
    bottom: bottom, // bottom height relative to the earth ellipsoid - 50 meters
    top: top, // bottom height relative to the earth ellipsoid - 50 meters
    heightUnit: heightUnit,
  };
}

function encodeGeocode(longitude, latitude, height, precision) {
  const size = 0.1 ** precision;

  // const size = size * Math.cos((latitude / 180) * Math.PI).toPrecision(precision);
  const earth_radius = 6378137; // earth equatorial radius in meters
  const heightUnit = ((earth_radius * size) / 180) * Math.PI;

  const longitudeRounded = Math.floor(longitude / size) * size;
  const latitudeRounded = Math.floor(latitude / size) * size;

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
  const levelSign = height + 50 > 0 ? "3" : "1";
  const level = Math.round(height / heightUnit);
  const bottom = level * heightUnit - 50;
  const top = (level + 1) * heightUnit - 50;

  const levelCode = level ? Math.abs(level).toString() : "";
  const geocode = levelCode + levelSign + latitudeCode + longitudeCode + precision.toString();

  return geocode;
}
