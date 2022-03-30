import {
  SELECT,
  PLACE,
  UPDATE,
  LOAD_OWNED,
  REMOVE,
  DONE,
  LOAD_ALL,
  CLICK,
  DISCONNECT,
  MAP_LOADED,
  CLEAN_OWNED,
} from "../types";

const initialState = {
  owned: [],
  all: [],
  click: null,
  map_loading: true,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SELECT:
      return {
        ...state,
        // set flag to selected
        owned: state.owned.map((nft) => {
          return nft.NFTid === action.payload.NFTid ? { ...nft, selected: true } : { ...nft, selected: false };
        }),
      };
    case CLICK:
      return {
        ...state,
        click: action.payload,
      };
    case PLACE:
      return {
        ...state,
        // set flag to placed
        owned: state.owned.map((nft) => {
          return nft.NFTid === action.payload.NFTid ? { ...nft, placed: true, editing: true } : nft;
        }),
      };

    case UPDATE:
      return {
        ...state,
        owned: state.owned.map((nft) => {
          return nft.NFTid === action.payload.NFTid ? action.payload : nft;
        }),
      };

    case DONE:
      return {
        ...state,
        // add to all
        all: state.all.map((nft) => {
          return nft.NFTid === action.payload.NFTid ? action.payload : nft;
        }),
        //  set flag to editing false
        owned: state.owned.map((nft) => {
          return nft.NFTid === action.payload.NFTid ? { ...nft, editing: false, placed: true } : nft;
        }),
      };
    case REMOVE:
      return {
        ...state,
        //  set flag to placed false
        owned: state.owned.map((nft) => {
          return nft.NFTid === action.payload.NFTid ? { ...nft, editing: false, placed: false } : nft;
        }),
      };
    case LOAD_ALL:
      return {
        ...state,
        all: action.payload,
      };
    case LOAD_OWNED:
      return {
        ...state,
        owned: [...state.owned, ...action.payload],
      };
    case CLEAN_OWNED:
      return {
        ...state,
        owned: [],
      };
    case DISCONNECT:
      return {
        ...state,
        owned: [],
      };

    case MAP_LOADED:
      return {
        ...state,
        map_loading: false,
      };

    default:
      return state;
  }
}
