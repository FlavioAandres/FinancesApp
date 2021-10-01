import React, { useEffect, useState } from "react";
import ModalAddAccount from "./ModalAddAccount/ModalAddAccount";
import ModalAddTransaction from "./ModalAddTransaction/ModalAddTransaction";
import AccountItem from "./AccountItem";
import { Label, CardGrid } from 'emerald-ui/lib'
import { API } from 'aws-amplify'
import TransactionsContainer from "./Transactions";
import Graph from '../commons/graphs'
import Card from "emerald-ui/lib/Card";



const AccountContainer = () => {
    const [accounts, setAccounts] = useState([]);
    const [showAddAccountModal, setShowAddAccountModal] = useState(false)
    const [showSpinningAccountModal, setShowSpinningAccountModal] = useState(false)
    const [showAddTransactionModal, setShowAddTransactionModal] = useState(false)
    const [showSpinningTransactionModal, setShowSpinningTransactionModal] = useState(false)
    const [transactions, setTransactions] = useState([]);
    const [transactionSeries, setTransactionSeries] = useState([]);
    const [transactionOptions, setTransactionOptions] = useState({})
    const [feesSeries, setFeesSeries] = useState([]);
    const [feesOptions, setFeesOptions] = useState({})
    const [selected, setSelected] = useState('')
    const [selectedAccountID, setSelectedAccountID] = useState()


    const sortTransactions = (transactionOne, transactionTwo) => {
        const dateOne = new Date(transactionOne.createdAt), dateTwo = new Date(transactionTwo.createdAt)
        return dateOne - dateTwo
    }

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
                const transactionSorted = data.transactions.sort(sortTransactions)
                setTransactions(transactionSorted);
                setSelected(name);
                const transactionsValues = data.transactions.map(({ difference, createdAt }) => {
                    return {
                        x: createdAt.substring(0, 10),
                        y: difference
                    }
                })

                const feeValues = data.transactions.map(({ fee, createdAt }) => {
                    return {
                        x: createdAt.substring(0, 10),
                        y: fee
                    }
                })

                setTransactionSeries([
                    {
                        name: 'Transactions',
                        data: transactionsValues
                    }
                ])

                setFeesSeries([
                    {

                        name: 'bak fees',
                        data: feeValues

                    }
                ])

                setTransactionOptions({
                    dataLabels: {
                        enabled: false
                    },
                    title: {
                        text: 'Transactions over the time',
                        align: 'left',
                        style: {
                            fontSize: '14px'
                        }
                    },
                    xaxis: {
                        type: 'datetime',
                        axisBorder: {
                            show: false
                        },
                        axisTicks: {
                            show: false
                        }
                    },
                    yaxis: {
                        tickAmount: 4,
                        floating: false,

                        labels: {
                            style: {
                                colors: '#8e8da4',
                            },
                            offsetY: -7,
                            offsetX: 0,
                        },
                        axisBorder: {
                            show: false,
                        },
                        axisTicks: {
                            show: false
                        }
                    },
                    fill: {
                        opacity: 0.5
                    },
                    tooltip: {
                        x: {
                            format: "yyyy",
                        },
                        fixed: {
                            enabled: false,
                            position: 'topRight'
                        }
                    },
                    grid: {
                        yaxis: {
                            lines: {
                                offsetX: -30
                            }
                        },
                        padding: {
                            left: 20
                        }
                    }
                })

                setFeesOptions({
                    dataLabels: {
                        enabled: false
                    },
                    title: {
                        text: 'Bank fees over the time',
                        align: 'left',
                        style: {
                            fontSize: '14px'
                        }
                    },
                    xaxis: {
                        type: 'datetime',
                        axisBorder: {
                            show: false
                        },
                        axisTicks: {
                            show: false
                        }
                    },
                    yaxis: {
                        tickAmount: 4,
                        floating: false,
                        labels: {
                            style: {
                                colors: '#8e8da4',
                            },
                            offsetY: -7,
                            offsetX: 0,
                        },
                        axisBorder: {
                            show: false,
                        },
                        axisTicks: {
                            show: false
                        }
                    },
                    fill: {
                        opacity: 0.5
                    },
                    tooltip: {
                        x: {
                            format: "yyyy",
                        },
                        fixed: {
                            enabled: false,
                            position: 'topRight'
                        }
                    },
                    grid: {
                        yaxis: {
                            lines: {
                                offsetX: -30
                            }
                        },
                        padding: {
                            left: 20
                        }
                    }
                })
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


    const onDeleteAccount = (account) => {
        API.del('finances', `/accounts/${account}`)
            .then(res => {
                const data = JSON.parse(res.body);

                if (data.success) {
                    const newAccounts = accounts.filter(_account => _account._id !== account);
                    setAccounts(newAccounts)
                }
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
                        key={account._id}
                        account={account}
                        getTransactions={getTransactions}
                        handleCreateTransaction={onCreateTransactionClick}
                        handleSelectedAccount={setSelectedAccountID}
                        handleDeleteAccount={onDeleteAccount}
                    />)}
            </CardGrid>

            <br />

            {

                transactions && transactions.length > 0 ? (<CardGrid >
                    <Card className="flex-basis-31">
                        <TransactionsContainer transactions={transactions} name={selected} />
                    </Card>
                    <Card className="flex-basis-31">
                        <Graph series={transactionSeries} options={transactionOptions} type='area' />
                    </Card>
                    <Card className="flex-basis-31">
                        <Graph series={feesSeries} options={feesOptions} type='area' />
                    </Card>
                </CardGrid>) : null
            }
        </div>
    )

}

export default AccountContainer;