import React from "react";
import { Navbar, Nav, DropdownButton, DropdownItem, Icon } from "emerald-ui/lib";
import { AmplifySignOut } from '@aws-amplify/ui-react';

const navbar = ({ updateNav }) => {
  return (
    <Navbar breakAt="md" theme="dark" className="navbar-custom">
      <Navbar.Brand>
        <a>
          <img
            className="brand-logo-img"
            src="./imgs/logo.png"
            onClick={(evt) => updateNav(evt, "home")}
            alt="Finances Site"
          />
        </a>
      </Navbar.Brand>
      <Nav>
        <DropdownButton title="Options">
          <DropdownItem onClick={(evt) => updateNav(evt, "prepayment")} eventKey="2">Pending Purchases</DropdownItem>
          <DropdownItem separator />
          <DropdownItem onClick={null} eventKey="1">Budget Dashboard</DropdownItem>
          <DropdownItem onClick={(evt) => updateNav(evt, "graph")} eventKey="3">Statistics Dashboard</DropdownItem>
          <DropdownItem separator ></DropdownItem>
          <DropdownItem > <AmplifySignOut/> </DropdownItem>
        </DropdownButton>
        <a onClick={(evt) => updateNav(evt, "profile")} href="#">
          <Icon name="face" style={{ fontSize: '24px', marginRight: '10px'}}/>  Me
        </a>
      </Nav>
    </Navbar>
  );
};

export default navbar;
