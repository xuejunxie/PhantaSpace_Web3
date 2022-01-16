import axios from "axios";
import { returnErrors, createMessage } from "./messages";

import {
  USER_LOADED,
  USER_LOADING,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT_SUCCESS,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_UPDATE,
} from "../types";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

// CHECK TOKEN & LOAD USER
export const loadUser = () => (dispatch, getState) => {
  // User Loading
  dispatch({ type: USER_LOADING });
  axios
    .get("/user/me/", tokenConfig(getState))
    .then((res) => {
      dispatch({
        type: USER_LOADED,
        payload: res.data,
      });
    })
    .catch((err) => {
      // dispatch(returnErrors(err.response.data, err.response.status));
      dispatch({
        type: AUTH_ERROR,
      });
    });
};

// LOGIN USER
export const login = (email, password) => (dispatch) => {
  // Headers
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Request Body
  const body = JSON.stringify({ email, password });

  axios
    .post("/auth/login/", body, config)
    .then((res) => {
      dispatch({
        type: LOGIN_SUCCESS,
        payload: res.data,
      });
      dispatch(loadUser());
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
      dispatch({
        type: LOGIN_FAIL,
      });
    });
};

// RESET PASSWORD
export const resetPassword = (email) => (dispatch) => {
  // Headers
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Request Body
  const body = JSON.stringify({ email });

  axios
    .post("/auth/password/reset/", body, config)
    .then((res) => {})
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
    });
};

// New PASSWORD
export const newPassword = (code, password) => (dispatch) => {
  // Headers
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Request Body
  const body = JSON.stringify({ code, password });

  axios
    .post("/auth/password/reset/verified/", body, config)
    .then((res) => {
      dispatch(createMessage(res.data));
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
    });
};

// New Email verified
export const newEmailVerify = (code) => (dispatch) => {
  // Headers
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Request Body

  axios
    .get("/auth/email/change/verify/?code=" + code, config)
    .then((res) => {
      dispatch(createMessage(res.data));
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
    });
};

// New PASSWORD
export const signupVerify = (code) => (dispatch) => {
  // Headers
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Request Body

  axios
    .get("/auth/signup/verify/?code=" + code, config)
    .then((res) => {
      dispatch(createMessage(res.data));
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
    });
};

// Change PASSWORD
export const changePassword = (password) => (dispatch, getState) => {
  // Request Body
  const body = JSON.stringify({ password });

  axios
    .post("/auth/password/change/", body, tokenConfig(getState))
    .then((res) => {
      dispatch(createMessage(res.data));
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
    });
};

// New Email
export const changeEmail = (email) => (dispatch, getState) => {
  // Request Body
  const body = JSON.stringify({ email });

  axios
    .post("/auth/email/change/", body, tokenConfig(getState))
    .then((res) => {
      dispatch(createMessage(res.data));
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
    });
};

// REGISTER USER
export const register =
  ({ email, password }) =>
  (dispatch) => {
    // Headers
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Request Body
    const body = JSON.stringify({ email, password });

    axios
      .post("/auth/signup/", body, config)
      .then((res) => {
        dispatch({
          type: REGISTER_SUCCESS,
          payload: res.data,
        });
      })
      .catch((err) => {
        dispatch(returnErrors(err.response.data, err.response.status));
        dispatch({
          type: REGISTER_FAIL,
        });
      });
  };

export const updateUser = (first_name, last_name, linkedin, personal_website, about) => (dispatch, getState) => {
  // Request Body
  const body = JSON.stringify({ first_name, last_name, linkedin, personal_website, about });

  axios
    .post("/user/me/change/", body, tokenConfig(getState))
    .then((res) => {
      dispatch(createMessage(res.data));
      dispatch({
        type: USER_UPDATE,
        payload: { first_name, last_name, linkedin, personal_website, about },
      });
    })
    .catch((err) => {
      // dispatch(returnErrors(err.response.data, err.response.status));
    });
};

// LOGOUT USER
export const logout = () => (dispatch, getState) => {
  axios
    .get("/auth/logout/", tokenConfig(getState))
    .then((res) => {
      dispatch({
        type: LOGOUT_SUCCESS,
      });
    })
    .catch((err) => {
      dispatch(returnErrors(err.response.data, err.response.status));
    });
};

export const uploadAvatar = (file, component) => (dispatch, getState) => {
  let formData = new FormData();
  formData.set("avatar", file);

  axios
    .post("/user/avatar/", formData, tokenConfig(getState))
    .then((res) => {
      // to refresh the avatar
      component.setState({ imageHash: Date.now() });
      let avatarURL = "/user/getavatar/" + component.props.user.id + "/?" + component.state.imageHash;
      component.setState({ avatar: avatarURL });
    })
    .catch((err) => {
      // dispatch(returnErrors(err.response.data, err.response.status));
    });
};

// Setup config with token - helper function
export const tokenConfig = (getState) => {
  // Get token from state
  const token = getState().auth.token;

  // Headers
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  // If token, add to headers config
  if (token) {
    config.headers["Authorization"] = `Token ${token}`;
  }

  return config;
};
