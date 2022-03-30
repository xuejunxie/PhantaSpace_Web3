import { CLEAN_OWNED_SPACE, LOADING_SPACE, LOAD_OWNED_SPACE, SELECT_SPACE, SHOW_SPACE } from "../types";

const initialState = {
  selected_space: null,
  show_space: null,
  owned: [],
  loading: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SELECT_SPACE:
      return {
        ...state,
        selected_space: action.payload,
      };
    case SHOW_SPACE:
      return {
        ...state,
        show_space: action.payload,
      };
    case LOAD_OWNED_SPACE:
      return {
        ...state,
        owned: [...state.owned, ...action.payload],
      };
    case LOADING_SPACE:
      return {
        ...state,
        loading: action.payload,
      };
    case CLEAN_OWNED_SPACE:
      return {
        ...state,
        owned: [],
      };

    default:
      return state;
  }
}
