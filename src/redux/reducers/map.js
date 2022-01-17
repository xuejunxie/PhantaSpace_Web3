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
        owned: state.owned.map((map) => {
          if (map.id === action.payload.id) {
            return {
              ...map,
              selected: true,
            };
          }
          return {
            ...map,
            selected: false,
          };
        }),
      };
    case PLACE:
      return {
        ...state,
        // set flag to placed
        owned: state.owned.map((map) => {
          if (map.id === action.payload.id) {
            return {
              ...map,
              editing: true,
              placed: true,
            };
          }
          return map;
        }),
      };
    case UPDATE:
      return {
        ...state,
        owned: state.owned.map((map) => {
          if (map.id === action.payload.id) {
            return {
              ...map,
              ...action.payload,
            };
          }
          return map;
        }),
      };

    case DONE:
      return {
        ...state,
        //  set flag to editing false
        owned: state.owned.map((map) => {
          if (map.id === action.payload.id) {
            return {
              ...map,
              editing: false,
            };
          }
          return map;
        }),
      };
    case REMOVE:
      return {
        ...state,
        //  set flag to placed false
        owned: state.owned.map((map) => {
          if (map.id === action.payload.id) {
            return {
              ...map,
              editing: false,
              placed: false,
            };
          }
          return map;
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
