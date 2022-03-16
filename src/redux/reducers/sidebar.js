import { LOOK, EXPLORE, CREATE, LOADING, SPACE, LOADING_ALL } from "../types";

const initialState = {
  look: null,
  explore: false,
  create: false,
  loading: false,
  space: false,
  loadingAll: true,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case EXPLORE:
      return {
        ...state,
        explore: true,
        create: false,
        space: false,
      };
    case CREATE:
      return {
        ...state,
        create: true,
        explore: false,
        space: false,
      };
    case LOADING_ALL:
      return {
        ...state,
        loadingAll: action.payload,
      };

    case SPACE:
      return {
        ...state,
        space: true,
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
