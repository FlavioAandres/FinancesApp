import React from "react";
import formatCash from '../utils/formatCash'
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
          {content.map(({ description, amount, category, createdAt }, index) => (
            <tr key={`content-key-${index}`}>
              <td>{description}</td>
              <td>{category}</td>
              <td>{formatCash(amount)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};
