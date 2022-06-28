import { SET_CONNECTOR_ID, REMOVE_CONNECTOR_ID, SET_ACCOUNT } from "../types";

const initialState = {
  connectorId: "injected",
  account: "",
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_CONNECTOR_ID:
      return {
        ...state,
        connectorId: action.payload,
      };
    case REMOVE_CONNECTOR_ID:
      return {
        ...state,
        connectorId: "injected",
      };
    case SET_ACCOUNT:
      return {
        ...state,
        account: action.payload,
      };

    default:
      return state;
  }
}
