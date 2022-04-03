import {
  ADD_OWNED_SPACE,
  CLEAN_OWNED_SPACE,
  LOADING_SPACE,
  LOAD_OWNED_SPACE,
  UPDATE_OWNED_SPACE,
  SHOW_SPACE,
} from "../types";

const initialState = {
  show_space: null,
  owned: [],
  auction: [],
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
        owned: action.payload,
      };
    case ADD_OWNED_SPACE:
      return {
        ...state,
        owned: [...state.owned, ...action.payload],
      };
    case UPDATE_OWNED_SPACE:
      return {
        ...state,
        owned: state.owned.map((space) => {
          if (space.geocode === action.payload.geocode) {
            return action.payload;
          }
        }),
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
