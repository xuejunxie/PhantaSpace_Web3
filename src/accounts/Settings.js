import React, { Component } from "react";
import "./Profile.css";
import { connect } from "react-redux";
import { updateUser, changePassword, changeEmail } from "../redux/actions/auth";

export class Settings extends Component {
  state = {
    email: "",
    password: "",
  };

  constructor(props) {
    super(props);
    this.state = {
      email: this.props.user.email,
      password: this.props.user.password,
    };
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSubmit_email = (e) => {
    e.preventDefault();
    this.props.changeEmail(this.state.email);

    // this.props.updateUser(this.state.first_name, this.state.last_name);
  };

  onSubmit_password = (e) => {
    e.preventDefault();
    this.props.changePassword(this.state.password);
    // this.props.updateUser(this.state.first_name, this.state.last_name);
  };
  render() {
    return (
      <div>
        <form className="form-horizontal" onSubmit={this.onSubmit_email}>
          <div className="form-group">
            <label className="col-md-2 col-sm-3 col-xs-12 control-label">Email</label>
            <div className="col-md-10 col-sm-9 col-xs-12">
              <input
                name="email"
                type="email"
                className="form-control"
                onChange={this.onChange}
                value={this.state.email}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="col-md-10 col-sm-9 col-xs-12 col-md-push-2 col-sm-push-3 col-xs-push-0">
              <input className="btn btn-primary" type="submit" value="Update Email" />
            </div>
          </div>
        </form>

        <hr />

        <form className="form-horizontal" onSubmit={this.onSubmit_password}>
          <div className="form-group">
            <label className="col-md-2 col-sm-3 col-xs-12 control-label">New password</label>
            <div className="col-md-10 col-sm-9 col-xs-12">
              <input
                name="password"
                type="password"
                className="form-control"
                onChange={this.onChange}
                value={this.state.password}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="col-md-10 col-sm-9 col-xs-12 col-md-push-2 col-sm-push-3 col-xs-push-0">
              <input className="btn btn-primary" type="submit" value="Update Password" />
            </div>
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps, { updateUser, changePassword, changeEmail })(Settings);
