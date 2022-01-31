import { combineReducers } from "redux";
import map from "./map";
import sidebar from "./sidebar";
import land from "./land";

export default combineReducers({
  map,
  sidebar,
  land,
});
