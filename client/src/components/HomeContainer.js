import React from "react";
import Table from "./TableComponent";
import moment from "moment";
import formatCash from '../utils/formatCash';
import ModalShowCategories from './ModalShowCategories/ModalShowCategories'
import ModalAddIncome from './ModalAddIncome/ModalAddIncome'
import ModalAddPayment from './ModalAddPayment/ModalAddPayment'
import SelectorTimming from './SelectorTiming'
import { Label, Progressbar } from 'emerald-ui/lib'
import { API } from 'aws-amplify'

class HomeComponent extends React.Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      timeAgo: "",
      latestPayments: [],
      expensivePayments: [],
      totalByCategory: [],
      prepayments: [],
      categories: [],
      latestIncomes: [],
      showSpinningCategoryModal: false,
      showAddIncomeModal: false,
      showSpinningIncomeModal: false,
      showAddPaymentModal: false,
      showSpinningPaymentModal: false
    };
  }
  isRenderd = false;

  getHomeStatistics = async (timeAgo) => {
    API.get('finances', '/boxflow/stats', { queryStringParameters: { metricType: 'home', date: timeAgo } })
      .then(response => {
        const data = JSON.parse(response.body)
        const categories = [];
        const { latestPayments, expensivePayments, prepayments, totalByCategory, latestIncomes } = data;

        Object.keys(totalByCategory).forEach((key) => {
          const catName = key
          const total = totalByCategory[key].reduce((prev, curr) => prev + curr.amount, 0)
          categories.push({
            name: catName,
            total
          })
        });

        const totalTotales = categories.reduce((prev, curr) => prev + curr.total, 0)

        categories.push({
          name: 'Total',
          total: totalTotales
        })

        if (this._isMounted) {
          this.setState({
            latestIncomes,
            latestPayments,
            expensivePayments,
            prepayments,
            categories,
            totalByCategory
          });
        }
      })
  };

  onChangeDate = (evt, date) => {
    if (evt) evt.preventDefault();
    const timeAgo = moment().subtract(1, date).toISOString();
    this.getHomeStatistics(timeAgo);
    if (this._isMounted) {
      this.setState({ timeAgo: date });
    }

  };

  componentDidMount() {
    this._isMounted = true;
    this.onChangeDate(null, "month");
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  showCategoriesContainer(evt, category) {
    if (evt) evt.preventDefault();
    this.setState({ showCategoriesModal: true, choosedCategoryModal: category });

  }


  onSaveIncome = (income) => {
    this.setState({
      showSpinningIncomeModal: true
    })
    API.post('finances', '/incomes', {
      body: {
        ...income
      }
    }).then(result => {
      this.setState((state, props) => {
        return {
          showAddIncomeModal: false,
          showSpinningIncomeModal: false,
          latestIncomes: [{ description: income.description, amount: income.amount, category: income.category }, ...state.latestIncomes]
        }
      })
    }).catch(err => console.error(err))
  }

  onSavePayment = (payment) => {
    this.setState({
      showSpinningPaymentModal: true
    })
    API.post('finances', '/payments', {
      body: {
        ...payment
      }
    }).then(result => {
      this.setState((state, props) => {
        return {
          showAddPaymentModal: false,
          showSpinningPaymentModal: false,
          latestPayments: [{ description: payment.description, amount: payment.amount, category: payment.category }, ...state.latestPayments]
        }
      })
    }).catch(err => console.error(err))
  }

  onCreateIncomeClick = (evt) => {
    this.setState({
      showAddIncomeModal: true
    })
  }

  onCreatePaymentClick = (evt) => {
    this.setState({
      showAddPaymentModal: true
    })
  }

  onCloseIncomesModal = (evt) => this.setState({ showAddIncomeModal: false })

  onClosePaymentModal = (evt) => this.setState({ showAddPaymentModal: false })

  render() {
    const {
      timeAgo,
      latestPayments,
      expensivePayments,
      categories,
      choosedCategoryModal,
      totalByCategory,
      latestIncomes,
    } = this.state;

    const { user } = this.props

    return (
      <div className="home-container">
        <ModalShowCategories
          show={this.state.showCategoriesModal}
          category={this.state.choosedCategoryModal}
          data={choosedCategoryModal ? totalByCategory[choosedCategoryModal] : []}
          close={() => this.setState({ showCategoriesModal: null, choosedCategoryModal: null })}
        />

        <ModalAddIncome
          save={this.onSaveIncome}
          loading={this.state.showSpinningIncomeModal}
          show={this.state.showAddIncomeModal}
          close={this.onCloseIncomesModal}
          categories={user.categories} />

        <ModalAddPayment
          save={this.onSavePayment}
          loading={this.state.showSpinningPaymentModal}
          show={this.state.showAddPaymentModal}
          close={this.onClosePaymentModal}
          categories={user.categories} />


        <SelectorTimming
          onChangeDate={this.onChangeDate}
          timeAgo={timeAgo}
        />
        <div className="categories-container">
          {
            categories.map((item, index) => {
              const [category] = user && user.categories && user.categories.filter(category => category.label === item.name)
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
                <div style={{ paddingRight: '5px' }}>
                  <button onClick={(evt) => this.showCategoriesContainer(evt, item.name)} className="category-item" key={`item-${index}`}>
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
              <Label onClick={this.onCreatePaymentClick} className="add-new-payment" color="info">
                ➕ Add
              </Label>
            </>
          } content={latestPayments} />
          <Table title="Expensive payments:" content={expensivePayments} />
          <Table title={
            <>
              Last Incomes {' '}
              <Label onClick={this.onCreateIncomeClick} className="add-new-income" color="info">
                ➕ Add
              </Label>
            </>
          } content={latestIncomes} />
        </div>
      </div>
    );
  }
}
export default HomeComponent;
