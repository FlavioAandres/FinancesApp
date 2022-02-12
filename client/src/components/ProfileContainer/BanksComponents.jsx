import React from "react";
import { ExpansionPanelGroup, Avatar } from "emerald-ui/lib/";

export default ({ name, subjects, filters}) => {
  return (
    <ExpansionPanelGroup id="g1">
      <ExpansionPanelGroup.Panel>
        <ExpansionPanelGroup.Panel.Summary>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar size="lg" title={name} />
            <div
              style={{
                marginLeft: "35px",
                flexGrow: 1,
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "3px" }}>
                <strong>{name}</strong>
              </h3>
              <p style={{ margin: 0 }}><b>Subjects:</b> {subjects.join(', ')}</p>
            </div>
          </div>
        </ExpansionPanelGroup.Panel.Summary>
        <ExpansionPanelGroup.Panel.Content>
          <div className="bank-information-container">
            <h2>Correos seguidos: </h2>
            <div className="bank-filters-information">
              {filters.map((item) => (
                <p className="text-muted" key={item.phrase}>{item.phrase}</p>
              ))}
            </div>
          </div>
        </ExpansionPanelGroup.Panel.Content>
      </ExpansionPanelGroup.Panel>
    </ExpansionPanelGroup>
  );
};
