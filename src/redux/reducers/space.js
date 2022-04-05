import {
  ADD_OWNED_SPACE,
  CLEAN_OWNED_SPACE,
  LOADING_SPACE,
  LOAD_OWNED_SPACE,
  UPDATE_OWNED_SPACE,
  SHOW_SPACE,
  LOAD_USER_BIDS,
  UPDATE_USER_BIDS,
  ADD_USER_BID,
  LOAD_ALL_SPACES,
} from "../types";

const initialState = {
  show_space: null,
  owned: [],
  auction: [],
  userBids: [],
  all: [],
  loading: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_ALL_SPACES:
      return {
        ...state,
        all: action.payload,
      };

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
        owned: state.owned.map((space) => (space.geocode === action.payload.geocode ? action.payload : space)),
      };
    case LOAD_USER_BIDS:
      return {
        ...state,
        userBids: action.payload,
      };
    case ADD_USER_BID:
      return {
        ...state,
        userBids: [...state.userBids, action.payload],
      };

    case UPDATE_USER_BIDS:
      return {
        ...state,
        userBids: state.userBids.map((bid) => (bid.geocode === action.payload.geocode ? action.payload : bid)),
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
