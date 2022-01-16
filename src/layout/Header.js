import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { logout } from "../redux/actions/auth";
import Account from "../components/Account/Account";

export class Header extends Component {
  static propTypes = {
    auth: PropTypes.object.isRequired,
    logout: PropTypes.func.isRequired,
  };

  tag(name, link) {
    return (
      <ul className="navbar-nav ml-auto mt-2 mt-lg-0">
        <li className="nav-item">
          <Link to={link} className="nav-link">
            {name}
          </Link>
        </li>
      </ul>
    );
  }

  render() {
    const { isAuthenticated, user } = this.props.auth;

    const Explore = this.tag("Explore", "/");
    const Create = this.tag("Create", "/create");

    return (
      <nav className="navbar navbar-expand-sm navbar-dark bg-dark" style={{ height: this.props.headerHeight }}>
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarTogglerDemo01"
            aria-controls="navbarTogglerDemo01"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
            <a className="navbar-brand" href="/">
              Phanta.Space
            </a>
          </div>
          {Explore}
          {Create}
          <Account />
        </div>
      </nav>
    );
  }
}

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logout })(Header);
