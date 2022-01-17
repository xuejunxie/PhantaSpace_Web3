import { SELECT, PLACE, UPDATE, LOAD_OWNED, REMOVE, REMOVED, DONE } from "../types";

const initialState = {
  owned: [],
  all: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SELECT:
      return {
        ...state,
        // set flag to selected
        owned: state.owned.map((nft) => {
          if (nft.id === action.payload.id) {
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
    case PLACE:
      return {
        ...state,
        // set flag to placed
        owned: state.owned.map((nft) => {
          if (nft.id === action.payload.id) {
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
          if (nft.id === action.payload.id) {
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
          if (nft.id === action.payload.id) {
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
          if (nft.id === action.payload.id) {
            return {
              ...nft,
              editing: false,
              placed: false,
            };
          }
          return nft;
        }),
      };

    case LOAD_OWNED:
      return {
        ...state,
        owned: action.payload,
      };
    default:
      return state;
  }
}
