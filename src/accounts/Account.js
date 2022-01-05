import React, { Component } from "react";
import "./Profile.css";
import Profile from "./Profile";
import Settings from "./Settings";

import { uploadAvatar } from "../redux/actions/auth";
import { connect } from "react-redux";

const profile = "Profile";
const settings = "Settings";
// const billing = "Billing";

const tabs = [profile, settings];

export class Account extends Component {
  state = {
    selectedTab: profile,
    avatar: "",
    imageHash: "",
  };

  onFileChange = (event) => {
    let file = event.target.files[0];
    this.props.uploadAvatar(file, this);
  };

  content = (tab) => {
    switch (tab) {
      case profile:
        return <Profile />;
      case settings:
        return <Settings />;
      // case billing:
      //   return <Billing />;
    }
  };

  onError = () => {
    const DEFAULT_IMG = "https://miro.medium.com/max/360/1*W35QUSvGpcLuxPo3SRTH4w.png";
    this.setState({ avatar: DEFAULT_IMG });
  };

  componentDidMount() {
    let avatarURL = "/user/getavatar/" + this.props.user.id + "/?" + this.state.imageHash;
    this.setState({ avatar: avatarURL });
  }

  render() {
    return (
      <div className="container">
        <div className="view-account">
          <section className="module">
            <div className="module-inner">
              <div className="side-bar">
                <div className="user-info">
                  <label htmlFor="avatar">
                    <div className="btn btn-sm btn-default-alt pull-left">
                      <img
                        className="img-profile img-circle img-responsive center-block"
                        src={`${this.state.avatar}?${this.state.imageHash}`}
                        onError={this.onError}
                        alt="avatar"
                      />

                      <input
                        type="file"
                        onChange={this.onFileChange}
                        id="avatar"
                        style={{ display: "none" }}
                        className="file-uploader pull-left"
                      />
                    </div>
                  </label>

                  <ul className="meta list list-unstyled">
                    <li className="name">{this.props.user.first_name + " " + this.props.user.last_name}</li>
                  </ul>
                </div>
                <nav className="side-menu">
                  <ul className="nav">
                    {tabs.map((tab) => (
                      <li key={tab} className={this.state.selectedTab === tab ? "active" : ""}>
                        <a
                          onClick={() => {
                            this.setState({ selectedTab: tab });
                          }}
                        >
                          {tab}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
              <div className="content-panel">{this.content(this.state.selectedTab)}</div>
            </div>
          </section>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.auth.user,
});

export default connect(mapStateToProps, { uploadAvatar })(Account);
