import { combineReducers } from "redux";
import map from "./map";
import sidebar from "./sidebar";
import space from "./space";
import account from "./account";
import jumpIn from "./jumpIn";
import phanton from "./phanton";

export default combineReducers({
  map,
  sidebar,
  space,
  account,
  jumpIn,
  phanton,
});
