import React from "react";
import { Navbar, Nav, DropdownButton, DropdownItem } from "emerald-ui/lib";
import { NavLink } from "react-router-dom";

const navbar = () => {
  return (
    <Navbar breakAt="md" theme="dark" className="navbar-custom">
      <Navbar.Brand>
        <NavLink to="/">
          <img
            className="brand-logo-img"
            src="./imgs/logo.png"
            alt="Finances Site"
          />
        </NavLink>
      </Navbar.Brand>
      <Nav>

        <DropdownButton title="Sitios">
          <NavLink aria-hidden="false" className="eui-dropdown-item" eventKey="1" to="/accounts">Cuentas</NavLink>
          <NavLink aria-hidden="false" className="eui-dropdown-item" eventKey="2" to="/prepayment">Pagos pre-procesados</NavLink>
          <NavLink aria-hidden="false" className="eui-dropdown-item" eventKey="3" to="/graphs">Graficas</NavLink>
          <DropdownItem separator />
        </DropdownButton>
        <NavLink to="/profile">Perfil</NavLink>
      </Nav>
    </Navbar>
  );
};

export default navbar;
