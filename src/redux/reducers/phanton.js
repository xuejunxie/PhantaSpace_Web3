import { UPDATE_FUND } from "../types";

const initialState = {
  fund: 1,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case UPDATE_FUND:
      return {
        ...state,
        fund: action.payload,
      };

    default:
      return state;
  }
}
