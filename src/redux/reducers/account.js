import { SET_CONNECTOR_ID, REMOVE_CONNECTOR_ID } from "../types";

const initialState = {
  connectorId: "injected",
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

    default:
      return state;
  }
}
