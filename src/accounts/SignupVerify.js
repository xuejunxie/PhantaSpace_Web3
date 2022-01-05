import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { signupVerify } from "../redux/actions/auth";

export class SignupVerify extends Component {
  constructor(props) {
    super(props);
    this.code = props.match.params.code;
    props.signupVerify(this.code);
  }

  static propTypes = {
    signupVerify: PropTypes.func,
    isAuthenticated: PropTypes.bool,
  };

  render() {
    return (
      <div>
        <h2>Sign Up successful</h2>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { signupVerify })(SignupVerify);
