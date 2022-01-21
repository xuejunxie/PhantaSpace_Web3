import { SELECT, PLACE, UPDATE, LOAD_OWNED, REMOVE, DONE, LOAD_ALL, LOOK, CLICK, EXPLORE, CREATE } from "../types";

const initialState = {
  owned: [],
  look: null,
  click: null,
  explore: false,
  create: false,
  all: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case EXPLORE:
      return {
        ...state,
        explore: true,
        create: false,
      };
    case CREATE:
      return {
        ...state,
        create: true,
        explore: false,
      };
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
    case LOOK:
      return {
        ...state,
        look: action.payload,
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
