import {
  EXPLORE,
  CREATE,
  SPACE,
  JUMP_IN,
  LOOK,
  SET_SPACE_TAB,
  LOADING,
  SELECT_SPACE,
  PICK_A_SPACE,
  SPACE_PICKED,
  LOADING_ALL,
  SHOW_ALL_SPACES,
  ASK_USER_TO_CONNECT,
  PHANTON,
} from "../types";

const initialState = {
  look: null,
  explore: false,
  create: false,
  space: false,
  jump_in: false,
  phanton: false,
  show_all_spaces: false,
  loading: false,
  pick_a_space: false,
  space_picked: false,
  selected_space: null,
  loading_all: true,
  space_tab: "mint",
  ask_user_to_connect: 0,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case EXPLORE:
      return {
        ...state,
        explore: true,
        create: false,
        jump_in: false,
        phanton: false,

        selected_space: null,
        show_all_spaces: false,
      };
    case CREATE:
      return {
        ...state,
        create: action.payload,
        explore: false,
        jump_in: false,
        phanton: false,

        selected_space: null,
        show_all_spaces: false,
      };

    case SPACE:
      return {
        ...state,
        space: true,
        create: false,
        explore: false,
        jump_in: false,
        phanton: false,
      };
    case JUMP_IN:
      return {
        ...state,
        space: false,
        create: false,
        explore: false,
        jump_in: true,
        phanton: false,

        selected_space: null,
        show_all_spaces: false,
      };
    case PHANTON:
      return {
        ...state,
        space: false,
        create: false,
        explore: false,
        jump_in: false,
        phanton: true,
        selected_space: null,
        show_all_spaces: false,
      };
    case SHOW_ALL_SPACES:
      return {
        ...state,
        show_all_spaces: action.payload,
      };
    case ASK_USER_TO_CONNECT:
      return {
        ...state,
        ask_user_to_connect: action.payload,
      };

    case SELECT_SPACE:
      return {
        ...state,
        selected_space: action.payload,
      };
    case SET_SPACE_TAB:
      return {
        ...state,
        space_tab: action.payload,
      };

    case LOADING_ALL:
      return {
        ...state,
        loading_all: action.payload,
      };

    case PICK_A_SPACE:
      return {
        ...state,
        pick_a_space: true,
        space_picked: false,
      };

    case SPACE_PICKED:
      return {
        ...state,
        pick_a_space: false,
        space_picked: true,
      };

    case LOOK:
      return {
        ...state,
        look: action.payload,
      };

    case LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
}
