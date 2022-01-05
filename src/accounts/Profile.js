import React, { Component } from "react";
import "./Profile.css";
import { connect } from "react-redux";
import { updateUser } from "../redux/actions/auth";

export class Profile extends Component {
  state = {
    first_name: "",
    last_name: "",
    email: "",
    linkedin: "",
    personal_website: "",
    about: "",
  };

  constructor(props) {
    super(props);
    this.state = {
      first_name: this.props.user.first_name,
      last_name: this.props.user.last_name,
      email: this.props.user.email,
      linkedin: this.props.user.linkedin,
      personal_website: this.props.user.personal_website,
      about: this.props.user.about,
    };
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  onSubmit = (e) => {
    e.preventDefault();
    this.props.updateUser(
      this.state.first_name,
      this.state.last_name,
      this.state.linkedin,
      this.state.personal_website,
      this.state.about
    );
  };

  render() {
    return (
      <form className="form-horizontal" onSubmit={this.onSubmit}>
        <div className="form-group">
          <label className="col-md-2 col-sm-3 col-xs-12 control-label">First Name</label>
          <div className="col-md-10 col-sm-9 col-xs-12">
            <input
              name="first_name"
              type="text"
              className="form-control"
              onChange={this.onChange}
              value={this.state.first_name}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="col-md-2 col-sm-3 col-xs-12 control-label">Last Name</label>
          <div className="col-md-10 col-sm-9 col-xs-12">
            <input
              name="last_name"
              type="text"
              className="form-control"
              onChange={this.onChange}
              value={this.state.last_name}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="col-md-2 col-sm-3 col-xs-12 control-label">Linkedin</label>
          <div className="col-md-10 col-sm-9 col-xs-12">
            <input
              name="linkedin"
              type="url"
              className="form-control"
              onChange={this.onChange}
              value={this.state.linkedin}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="col-md-2 col-sm-3 col-xs-12 control-label">Personal website</label>
          <div className="col-md-10 col-sm-9 col-xs-12">
            <input
              name="personal_website"
              type="url"
              className="form-control"
              onChange={this.onChange}
              value={this.state.personal_website}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="col-md-6 col-sm-6 col-xs-12 control-label">About yourself (markdown works!) </label>
          <div className="col-md-10 col-sm-9 col-xs-12">
            <textarea
              name="about"
              rows="10"
              className="form-control"
              onChange={this.onChange}
              value={this.state.about}
            />
          </div>
        </div>
        <div className="form-group">
          <div className="col-md-10 col-sm-9 col-xs-12 col-md-push-2 col-sm-push-3 col-xs-push-0">
            <input className="btn btn-primary mr-2" type="submit" value="Update Profile" />
            <a href={"#/mentor/" + this.props.user.id}>
              <button className="btn btn-primary mr-2" type="button">
                Preview
              </button>
            </a>
          </div>
        </div>
      </form>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps, { updateUser })(Profile);
