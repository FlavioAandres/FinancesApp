import React from "react";
import { Table } from "emerald-ui/lib";

export default (props) => {
  const { content = [], title = 'Table title' } = props;
  return (
    <div className="table-container-emerald">
        <h2>{title}</h2>
      <Table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Categoría</th>
            <th>Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {content.map(({ description, amount, category }) => (
            <tr>
              <td>{description}</td>
              <td>{amount}</td>
              <td>{category}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};
