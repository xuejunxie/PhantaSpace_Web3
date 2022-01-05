import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { resetPassword } from "../redux/actions/auth";

export class ResetPassword extends Component {
  state = {
    email: "",
  };

  static propTypes = {
    resetpassword: PropTypes.func.isRequired,
    isAuthenticated: PropTypes.bool,
  };

  onSubmit = (e) => {
    e.preventDefault();
    this.props.resetPassword(this.state.email, this.state.password);
    this.props.history.push("/resetpasswordsent");
  };

  onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  render() {
    if (this.props.isAuthenticated) {
      return <Navigate to="/" />;
    }
    const email = this.state.email;
    return (
      <div className="col-md-6 m-auto">
        <div className="card card-body mt-5">
          <h2 className="text-center">Reset Password</h2>
          <form onSubmit={this.onSubmit}>
            <div className="form-group">
              <label>email</label>
              <input type="text" className="form-control" name="email" onChange={this.onChange} value={email} />
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-primary">
                Send Email
              </button>
            </div>
            <p>
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </form>
        </div>
      </div>
    );
  }
}

export default connect(null, { resetPassword })(ResetPassword);
