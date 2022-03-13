import { combineReducers } from "redux";
import map from "./map";
import sidebar from "./sidebar";
import space from "./space";

export default combineReducers({
  map,
  sidebar,
  space,
});
