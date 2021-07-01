import React from "react";
import { ExpansionPanelGroup, Avatar } from "emerald-ui/lib/";

export default (props) => {
  return (
    <ExpansionPanelGroup id="g1">
      <ExpansionPanelGroup.Panel>
        <ExpansionPanelGroup.Panel.Summary>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar size="lg" title={props.name} />
            <div
              style={{
                marginLeft: "35px",
                flexGrow: 1,
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "3px" }}>
                <strong>{props.name}</strong>
              </h3>
              <p style={{ margin: 0 }}>{props.subject}</p>
            </div>
          </div>
        </ExpansionPanelGroup.Panel.Summary>
        <ExpansionPanelGroup.Panel.Content>
          <div className="bank-information-container">
            <h2>Correos seguidos: </h2>
            <div className="bank-filters-information">
              {props.filters.map((item) => (
                <p className="text-muted" key={item.phrase}>{item.phrase}</p>
              ))}
            </div>
          </div>
        </ExpansionPanelGroup.Panel.Content>
      </ExpansionPanelGroup.Panel>
    </ExpansionPanelGroup>
  );
};
