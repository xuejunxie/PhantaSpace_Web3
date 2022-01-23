import { LOOK, EXPLORE, CREATE, LOADING, LAND, LOADING_ALL } from "../types";

const initialState = {
  look: null,
  explore: false,
  create: false,
  loading: false,
  land: true,
  loadingAll: true,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case EXPLORE:
      return {
        ...state,
        explore: true,
        create: false,
        land: false,
      };
    case CREATE:
      return {
        ...state,
        create: true,
        explore: false,
        land: false,
      };
    case LOADING_ALL:
      return {
        ...state,
        loadingAll: action.payload,
      };

    case LAND:
      return {
        ...state,
        land: true,
        explore: false,
        create: false,
      };

    case LOOK:
      return {
        ...state,
        look: action.payload,
      };

    case LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
}
