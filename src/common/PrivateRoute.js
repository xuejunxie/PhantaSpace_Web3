import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { connect } from "react-redux";

const PrivateRoute = ({ component: Component, auth, ...rest }) => {
  if (auth.isLoading) {
    return <h2> Loading...</h2>;
  } else if (auth.isAuthenticated) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(PrivateRoute);
