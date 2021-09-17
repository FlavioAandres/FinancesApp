import React, { useEffect, useState } from "react";
import ModalAddAccount from "./ModalAddAccount/ModalAddAccount";
import ModalAddTransaction from "./ModalAddTransaction/ModalAddTransaction";
import AccountItem from "./AccountItem";
import { Label, CardGrid } from 'emerald-ui/lib'
import { API } from 'aws-amplify'
import TransactionsContainer from "./Transactions";



const AccountContainer = () => {
    const [accounts, setAccounts] = useState([]);
    const [showAddAccountModal, setShowAddAccountModal] = useState(false)
    const [showSpinningAccountModal, setShowSpinningAccountModal] = useState(false)
    const [showAddTransactionModal, setShowAddTransactionModal] = useState(false)
    const [showSpinningTransactionModal, setShowSpinningTransactionModal] = useState(false)
    const [transactions, setTransactions] = useState([]);
    const [selected, setSelected] = useState('')
    const [selectedAccountID, setSelectedAccountID] = useState()


    const getAccount = () => {
        API.get('finances', `/accounts/${selectedAccountID}`)
            .then(response => {
                const data = JSON.parse(response.body)
                const newData = data.account

                const newAccounts = accounts.map(account => {
                    if (account._id === newData._id) {
                        return Object.assign(account, newData)
                    }
                    return account
                })

                setAccounts(newAccounts);
            }).catch(err => console.error(err))
    }

    const getTransactions = ({ account, name }) => {
        API.get('finances', `/accounts/${account}/transactions`)
            .then(response => {
                const data = JSON.parse(response.body);
                setTransactions(data.transactions);
                setSelected(name);
            })
            .then(err => console.error(err))
    }

    const onSaveTransaction = (transaction) => {
        setShowSpinningTransactionModal(true);
        API.post('finances', `/accounts/${selectedAccountID}/transactions`, {
            body: {
                ...transaction
            }
        }).then(result => {
            setShowAddTransactionModal(false);
            setShowSpinningTransactionModal(false);
            getAccount();
        }).catch(err => console.error(err))
    }



    const getAccounts = () => {
        API.get('finances', '/accounts')
            .then(response => {
                const data = JSON.parse(response.body)
                setAccounts(data.accounts);
            }).catch(err => console.error(err))
    }

    const onSaveAccount = (account) => {
        setShowSpinningAccountModal(true);
        API.post('finances', '/accounts', {
            body: {
                ...account
            }
        }).then(result => {
            setShowAddAccountModal(false);
            setShowSpinningAccountModal(false);
            setAccounts([{ name: account.name, number: account.number, type: account.type, value: account.value }, ...accounts])
        }).catch(err => console.error(err))
    }

    const onCloseAccountModal = () => setShowAddAccountModal(false)

    const onCreateAccountClick = () => setShowAddAccountModal(true)

    const onCloseTransactionModal = () => setShowAddTransactionModal(false)

    const onCreateTransactionClick = () => setShowAddTransactionModal(true)

    useEffect(() => {
        getAccounts();
    }, []);

    return (
        <div>
            <ModalAddAccount
                save={onSaveAccount}
                loading={showSpinningAccountModal}
                show={showAddAccountModal}
                close={onCloseAccountModal}
            />

            <ModalAddTransaction
                save={onSaveTransaction}
                loading={showSpinningTransactionModal}
                show={showAddTransactionModal}
                close={onCloseTransactionModal}
            />

            <h1>
                Accounts &nbsp;
                <Label onClick={onCreateAccountClick} className="add-new-account" color="info">
                    <span role='img' aria-label='Add Account'>➕</span> Add
                </Label>
            </h1>

            <CardGrid>
                {accounts && accounts.map(account =>
                    <AccountItem
                        account={account}
                        getTransactions={getTransactions}
                        handleCreateTransaction={onCreateTransactionClick}
                        handleSelectedAccount={setSelectedAccountID}
                    />)}
            </CardGrid>

            <br />

            <TransactionsContainer transactions={transactions} name={selected} />
        </div>
    )

}

export default AccountContainer;