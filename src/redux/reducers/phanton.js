import { PHANTON_TAB, UPDATE_FUND } from "../types";

const initialState = {
  fund: 1,
  phanton_tab: "buy",
};

export default function (state = initialState, action) {
  switch (action.type) {
    case UPDATE_FUND:
      return {
        ...state,
        fund: action.payload,
      };
    case PHANTON_TAB:
      return {
        ...state,
        phanton_tab: action.payload,
      };

    default:
      return state;
  }
}
