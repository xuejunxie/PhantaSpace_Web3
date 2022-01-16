import { SELECT, PLACE, UPDATE, LOAD_OWNED, REMOVE, REMOVED } from "../types";

const initialState = {
  selected: null,
  editing: false,
  removing: false,
  owned: [],
  all: [],
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SELECT:
      return {
        ...state,
        selected: action.payload,
        // set flag to selected
        owned: state.owned.map((map) => {
          if (map.id === action.payload.id) {
            return {
              ...map,
              selected: true,
            };
          }
          return map;
        }),
      };
    case PLACE:
      return {
        ...state,
        // set flag to placed
        editing: true,
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
        //  set flag to editing false
        editing: false,
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
        removing: true,
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

    case REMOVED:
      return {
        ...state,
        //  set flag to placed false
        removing: false,
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
