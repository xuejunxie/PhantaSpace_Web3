import {
  BOX_PLACED,
  SET_BOX_COLOR,
  PLACE_TAB,
  DELETE_BOX,
  LOAD_ALL_BOXES,
  BOX_PLACED_BY_OTHERS,
  BOX_DELETED_BY_OTHERS,
} from "../types";

const initialState = {
  box_placed: null,
  box_deleted: null,
  box_placed_by_others: null,
  box_deleted_by_others: null,
  boxes_placed: [],
  box_color: { rgb: { r: "255", g: "255", b: "255", a: "1" } },
  place_tab: "place",
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_ALL_BOXES:
      return {
        ...state,
        boxes_placed: action.payload,
      };

    case BOX_PLACED:
      return {
        ...state,
        box_placed: action.payload,
      };

    case SET_BOX_COLOR:
      return {
        ...state,
        box_color: action.payload,
      };
    case PLACE_TAB:
      return {
        ...state,
        place_tab: action.payload,
      };
    case DELETE_BOX:
      return {
        ...state,
        box_deleted: action.payload,
      };
    case BOX_PLACED_BY_OTHERS:
      return {
        ...state,
        box_placed_by_others: action.payload,
      };
    case BOX_DELETED_BY_OTHERS:
      return {
        ...state,
        box_deleted_by_others: action.payload,
      };
    default:
      return state;
  }
}
