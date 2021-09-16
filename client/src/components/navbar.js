import React from "react";
import { Navbar, Nav, DropdownButton, DropdownItem } from "emerald-ui/lib";

const navbar = ({ updateNav }) => {
  return (
    <Navbar breakAt="md" theme="dark" className="navbar-custom">
      <Navbar.Brand>
        <a href="/">
          <img
            className="brand-logo-img"
            src="./imgs/logo.png"
            onClick={(evt) => updateNav(evt, "home")}
            alt="Finances Site"
          />
        </a>
      </Navbar.Brand>
      <Nav>
        <DropdownButton title="Sitios">
          <DropdownItem href="/datacredit" eventKey="1">Data Credito</DropdownItem>
          <DropdownItem href="/prepayment" eventKey="2">Pagos pre-procesados</DropdownItem>
          <DropdownItem href="/graphs" eventKey="3">Graficas</DropdownItem>
          <DropdownItem separator />
        </DropdownButton>
        <a href="/profile">Perfil</a>
      </Nav>
    </Navbar>
  );
};

export default navbar;
