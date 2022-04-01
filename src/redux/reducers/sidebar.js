import { LOOK, EXPLORE, CREATE, LOADING, SELECT_SPACE, PICK_A_SPACE, SPACE_PICKED, LOADING_ALL, SPACE } from "../types";

const initialState = {
  look: null,
  explore: false,
  create: false,
  space: false,
  loading: false,
  pick_a_space: false,
  space_picked: false,
  selected_space: null,
  loadingAll: true,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case EXPLORE:
      return {
        ...state,
        explore: true,
        create: false,
        selected_space: null,
      };
    case CREATE:
      return {
        ...state,
        create: true,
        explore: false,
        selected_space: null,
      };

    case SPACE:
      return {
        ...state,
        space: true,
        create: false,
        explore: false,
      };
    case SELECT_SPACE:
      return {
        ...state,
        selected_space: action.payload,
      };

    case LOADING_ALL:
      return {
        ...state,
        loadingAll: action.payload,
      };

    case PICK_A_SPACE:
      return {
        ...state,
        pick_a_space: true,
        space_picked: false,
      };

    case SPACE_PICKED:
      return {
        ...state,
        pick_a_space: false,
        space_picked: true,
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
