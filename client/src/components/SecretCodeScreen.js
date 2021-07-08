import React from "react";
import { TextField, Icon, Button } from "emerald-ui/lib";

const SecretCodeScreen = ({ onLoginClick }) => {
  const [secretPassword, setSecret] = React.useState("");
  return (
    <div className="full-screen-secret-container">
      <div className="login-container">
        <img src="" alt="" />
        <div className="secret-key-input-container">
          <TextField
            clearable
            onClear={() => setSecret("")}
            value={secretPassword}
            onKeyPress={(evt) => {
              if (evt.key === "Enter") onLoginClick(secretPassword);
            }}
            onChange={(evt) => setSecret(evt.target.value)}
            label="Ingrese su Llave de acceso: "
            type="password"
            style={{ width: "250px" }}
          />
          <Button
            onClick={() => onLoginClick(secretPassword)}
            color="danger"
            clearable="true"
            className="sign-in-button"
          >
            <Icon name="thumb_up" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecretCodeScreen;
