import { CLEAN_OWNED_SPACE, LOADING_SPACE, LOAD_OWNED_SPACE, SHOW_SPACE } from "../types";

const initialState = {
  show_space: null,
  owned: [],
  loading: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
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
