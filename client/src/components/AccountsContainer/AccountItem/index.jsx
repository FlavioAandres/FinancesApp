import React from 'react'
import { Card, Button } from 'emerald-ui/lib'
import formatCash from '../../../utils/formatCash';

const AccountItem = ({ account, getTransactions, handleCreateTransaction, handleSelectedAccount }) => {

    return (
        <Card key={account._id}>
            <Card.Header color="success">
                <div>
                    <h3 className="eui-card-header-title">{account.name}</h3>
                </div>
            </Card.Header>
            <div className="eui-card-body">
                <div className="eui-card-content">
                    <table className="eui-card-table">
                        <tbody>
                            <tr>
                                <td>Numero de Cuenta</td>
                                <td>{account.number}</td>
                            </tr>
                            <tr>
                                <td>Monto:</td>
                                <td>
                                    {formatCash(account.value)}
                                </td>
                            </tr>
                            <tr>
                                <td>Tipo:</td>
                                <td>
                                    {account.type}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="eui-card-btn-group">
                <Button color="info" onClick={() => getTransactions({ account: account._id, name: account.name })}>Ver Transacciones</Button>
                <Button onClick={() => {
                    handleSelectedAccount(account._id);
                    handleCreateTransaction();
                }}>Aggregar Movimiento</Button>
                <Button color="danger" onClick={() => { alert('Delete') }}>Eliminar</Button>
            </div>
        </Card >
    )
}

export default AccountItem;