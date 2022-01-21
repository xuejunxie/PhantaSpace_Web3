import { SELECT, PLACE, UPDATE, LOAD_OWNED, REMOVE, DONE, LOAD_ALL, CLICK } from "../types";

const initialState = {
  owned: [],
  all: [],
  click: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SELECT:
      return {
        ...state,
        // set flag to selected
        owned: state.owned.map((nft) => {
          if (nft.NFTid === action.payload.NFTid) {
            return {
              ...nft,
              selected: true,
            };
          }
          return {
            ...nft,
            selected: false,
          };
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
          if (nft.NFTid === action.payload.NFTid) {
            return {
              ...nft,
              editing: true,
              placed: true,
            };
          }
          return nft;
        }),
      };
    case UPDATE:
      return {
        ...state,
        owned: state.owned.map((nft) => {
          if (nft.NFTid === action.payload.NFTid) {
            return {
              ...nft,
              ...action.payload,
            };
          }
          return nft;
        }),
      };

    case DONE:
      return {
        ...state,
        //  set flag to editing false
        owned: state.owned.map((nft) => {
          if (nft.NFTid === action.payload.NFTid) {
            return {
              ...nft,
              editing: false,
            };
          }
          return nft;
        }),
      };
    case REMOVE:
      return {
        ...state,
        //  set flag to placed false
        owned: state.owned.map((nft) => {
          if (nft.NFTid === action.payload.NFTid) {
            return {
              ...nft,
              editing: false,
              placed: false,
            };
          }
          return nft;
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
    default:
      return state;
  }
}
