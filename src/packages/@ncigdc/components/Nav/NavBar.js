import React, { Component } from 'react';
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Container,
} from 'reactstrap';
import { compose } from "recompose";
import { connect } from "react-redux";
import withRouter from '@ncigdc/utils/withRouter';
import { default as ReactGA4 } from 'react-ga4';


class NavBar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    }
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    })
  };

  render() {
    return (
      <React.Fragment>
        <Container fluid={true}>
          <Navbar id="navbar" className="fixed-top px-1 py-1 mb-3 container-fluid navbar navbar-expand-md navbar-light" expand="md" light>
            <NavbarBrand href="/" id="logo-contianer" className="pr-5 mr-auto ml-2 text-dark d-flex align-items-center">
              <img src="img/logo.png" alt="Kidney Tissue Atlas" className="logo" />
              <span id="title-text" className="ml-2">Kidney Tissue Atlas</span>
            </NavbarBrand>
            <NavbarToggler onClick={this.toggle} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="mr-auto" navbar>
                <NavItem className="px-1">
                  <NavLink href="/"><span className="nav-text px-1">Dashboard (Home)</span></NavLink>
                </NavItem>
                <NavItem id="explorer-link" className="px-3">
                  <NavLink href="/explorer"><span className="nav-text px-1">Explorer</span></NavLink>
                </NavItem>
                <NavItem className="active px-1">
                  <NavLink href="/repository"><span className="nav-text px-1">Repository</span></NavLink>
                </NavItem>
                <NavItem className="px-1">
                  <NavLink href="/spatial-viewer"><span className="nav-text px-1">Spatial Viewer</span></NavLink>
                </NavItem>
              </Nav>
              <Nav>
                <NavItem id="question-icon" className="px-1">
                  <NavLink onClick={() => {
                      ReactGA4.event({
                        category: 'Repository',
                        action: 'Navigation',
                        label: 'Help'
                      });
                    }} rel="noreferrer" target="_blank" href="https://www.kpmp.org/help">
                    Help
                  </NavLink>
                </NavItem>
              </Nav>
            </Collapse>
          </Navbar>
        </Container>
      </React.Fragment>
    );
  }
}

export default compose(
  withRouter
)(NavBar);