import React from "react";
import formatCash from "../../../utils/formatCash";
import Table from "emerald-ui/lib/Table";


const getColor = (type) => {
    let color = ''
    switch (type) {
        case 'ADDITION': {
            color = '#00a950'
            break;
        }
        case 'SUBTRACTION': {
            color = '#de350b'
            break;
        }
        default:
            break;
    }

    return color;
}

const TransactionsContainer = ({ transactions, name }) => {
    return (
        <div className="table-container-emerald">
            <h2>Ultimas 10 transacciones para {name} </h2>
            <Table>
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Descripcion</th>
                        <th>Valor</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(({ difference, createdAt, description, _id, type }) => {
                        const color =  getColor(type)
                        const textStyle = {
                            color
                        }

                        console.log(textStyle);

                        return (<tr key={`transaction-key-${_id}`}>
                            <td>{createdAt}</td>
                            <td>{description}</td>
                            <td><p style={textStyle}>{formatCash(difference)}</p></td>
                        </tr>)
                    })}
                </tbody>
            </Table>
        </div>
    )
}

export default TransactionsContainer;