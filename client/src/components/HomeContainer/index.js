import React, { useEffect, useState } from "react";
import Table from "../TableComponent";
import moment from "moment";
import formatCash from '../../utils/formatCash';
import ModalShowCategories from '../ModalShowCategories/ModalShowCategories'
import ModalAddIncome from '../ModalAddIncome/ModalAddIncome'
import ModalAddPayment from '../ModalAddPayment/ModalAddPayment'
import SelectorTimming from '../SelectorTiming'
import { Label, Progressbar } from 'emerald-ui/lib'
import { API } from 'aws-amplify'


const HomeComponent = ({ user }) => {
  const [timeAgo, setTimeAgo] = useState('')
  const [latestPayments, setLatestPayments] = useState([])
  const [latestIncomes, setLatestIncomes] = useState([])
  const [expensivePayments, setExpensivePayments] = useState([])
  const [totalByCategory, setTotalByCategory] = useState([])
  const [categories, setCategories] = useState([])
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false)
  const [showSpinningIncomeModal, setShowSpinningIncomeModal] = useState(false)
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  const [showSpinningPaymentModal, setShowSpinningPaymentModal] = useState(false)
  const [showCategoriesModal, setShowCategoriesModal] = useState(false)
  const [choosedCategoryModal, setChoosedCategoryModal] = useState(null);


  const getHomeStatistics = async (timeAgo) => {
    API.get('finances', '/boxflow/stats', { queryStringParameters: { metricType: 'home', date: timeAgo } })
      .then(response => {
        const data = JSON.parse(response.body)
        const _categories = [];
        const { latestPayments, expensivePayments, totalByCategory, latestIncomes } = data;

        Object.keys(totalByCategory).forEach((key) => {
          const catName = key
          const total = totalByCategory[key].reduce((prev, curr) => prev + curr.amount, 0)
          _categories.push({
            name: catName,
            total
          })
        });

        const totalTotales = _categories.reduce((prev, curr) => prev + curr.total, 0)

        _categories.push({
          name: 'Total',
          total: totalTotales
        })

        setLatestIncomes(latestIncomes);
        setLatestPayments(latestPayments);
        setExpensivePayments(expensivePayments);
        setCategories(_categories);
        setTotalByCategory(totalByCategory)
      })
  };

  const onChangeDate = (evt, date) => {

    setTimeAgo(moment().subtract(1, date).toISOString());


  };

  useEffect(() => {
    getHomeStatistics(timeAgo)
  }, [timeAgo]);

  const onSaveIncome = (income) => {
    setShowSpinningIncomeModal(true);
    API.post('finances', '/incomes', {
      body: {
        ...income
      }
    }).then(result => {
      setShowAddIncomeModal(false);
      setShowSpinningIncomeModal(false);
      setLatestIncomes([{ description: income.description, amount: income.amount, category: income.category }, ...latestIncomes])
    }).catch(err => console.error(err))
  }

  const onSavePayment = (payment) => {
    setShowSpinningPaymentModal(true);
    API.post('finances', '/payments', {
      body: {
        ...payment
      }
    }).then(result => {
      setShowSpinningPaymentModal(false);
      setShowAddPaymentModal(false);
      setLatestPayments([{ description: payment.description, amount: payment.amount, category: payment.category }, ...latestPayments])
    }).catch(err => console.error(err))
  }

  const onCloseIncomesModal = () => setShowAddIncomeModal(false)
  const onClosePaymentModal = () => setShowAddPaymentModal(false)

  const onCreateIncomeClick = () => setShowAddIncomeModal(true)
  const onCreatePaymentClick = () => setShowAddPaymentModal(true)

  const showCategoriesContainer = (evt, category) => {
    if (evt) evt.preventDefault();
    setShowCategoriesModal(true);
    setChoosedCategoryModal(category);
  }


  return (
    <div className="home-container">
      <ModalShowCategories
        show={showCategoriesModal}
        category={choosedCategoryModal}
        data={choosedCategoryModal ? totalByCategory[choosedCategoryModal] : []}
        close={
          () => {
            setShowCategoriesModal(false);
            setChoosedCategoryModal(null);
          }
        }
      />

      <ModalAddIncome
        save={onSaveIncome}
        loading={showSpinningIncomeModal}
        show={showAddIncomeModal}
        close={onCloseIncomesModal}
        categories={user.categories} />

      <ModalAddPayment
        save={onSavePayment}
        loading={showSpinningPaymentModal}
        show={showAddPaymentModal}
        close={onClosePaymentModal}
        categories={user.categories} />


      <SelectorTimming
        onChangeDate={onChangeDate}
        timeAgo={timeAgo}
      />

      <div className="categories-container">
        {
          categories && categories.map((item, index) => {
            const [category] = user && user.categories && user.categories.filter(category => category.value === item.name)
            const progressValue = category && category.budget && category.budget.progress ? category.budget.progress : 0

            let color = 'success'
            if (progressValue >= 100) {
              color = 'danger'
            } else if (progressValue >= 70) {
              color = 'warning'
            } else if (progressValue >= 50) {
              color = 'info'
            }

            return (
              <div style={{ paddingRight: '5px' }} key={`container-item-${item.name}`}>
                <button onClick={(evt) => showCategoriesContainer(evt, item.name)} className="category-item" key={`item-${item.name}`}>
                  <p>
                    {item.name}: <span>{formatCash(item.total)}</span>
                  </p>
                </button>
                <Progressbar color={color} progress={progressValue} />
              </div>
            )
          })
        }
      </div>
      <div className="stats-container">
        <Table title={
          <>
            Last payments:  {' '}
            <Label onClick={onCreatePaymentClick} className="add-new-payment" color="info">
              <span role='img' aria-label='Add Payment'>➕</span> Add
            </Label>
          </>
        } content={latestPayments} />
        <Table title="Expensive payments:" content={expensivePayments} />
        <Table title={
          <>
            Last Incomes {' '}
            <Label onClick={onCreateIncomeClick} className="add-new-income" color="info">
              <span role='img' aria-label='Add Income'>➕</span> Add
            </Label>
          </>
        } content={latestIncomes} />
      </div>
    </div>
  )
}

export default HomeComponent;