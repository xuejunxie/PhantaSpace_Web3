import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { newEmailVerify } from "../redux/actions/auth";

export class NewEmailVerify extends Component {
  constructor(props) {
    super(props);
    this.code = props.match.params.code;
    props.newEmailVerify(this.code);
  }

  static propTypes = {
    newEmailVerify: PropTypes.func,
    isAuthenticated: PropTypes.bool,
  };

  render() {
    return (
      <div>
        <h2>Email change successful</h2>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { newEmailVerify })(NewEmailVerify);
