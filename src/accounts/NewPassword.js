import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { newPassword } from "../redux/actions/auth";
import { createMessage } from "../redux/actions/messages";

export class NewPassWord extends Component {
  constructor(props) {
    super(props);
    this.code = props.match.params.code;
  }

  state = {
    password: "",
    password2: "",
  };

  static propTypes = {
    newPassword: PropTypes.func,
    isAuthenticated: PropTypes.bool,
  };

  onSubmit = (e) => {
    e.preventDefault();
    const code = this.code;
    const { password, password2 } = this.state;
    if (password !== password2) {
      this.props.createMessage({ passwordNotMatch: "Passwords do not match" });
    } else {
      this.props.newPassword(code, password);
    }
    this.props.history.push("/login");
  };

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  render() {
    if (this.props.isAuthenticated) {
      return <Navigate to="/" />;
    }
    const { password, password2 } = this.state;
    return (
      <div className="col-md-6 m-auto">
        <div className="card card-body mt-5">
          <h2 className="text-center">New Password</h2>
          <form onSubmit={this.onSubmit}>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                onChange={this.onChange}
                value={password}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                className="form-control"
                name="password2"
                onChange={this.onChange}
                value={password2}
              />
            </div>
            <div className="form-group">
              <button type="submit" className="btn btn-primary">
                Update
              </button>
            </div>
            <p>
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, { newPassword, createMessage })(NewPassWord);
