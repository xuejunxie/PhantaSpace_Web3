import { combineReducers } from "redux";
import errors from "./errors";
import messages from "./messages";
import auth from "./auth";
import map from "./map";
import sidebar from "./sidebar";

export default combineReducers({
  errors,
  messages,
  auth,
  map,
  sidebar,
});
