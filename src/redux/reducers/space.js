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
} from "../types";

const initialState = {
  show_space: null,
  owned: [],
  auction: [],
  loading: false,
  userBids: [],
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
        userBids: state.userBids.map((bid) => {
          if (bid.geocode === action.payload.geocode) {
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
