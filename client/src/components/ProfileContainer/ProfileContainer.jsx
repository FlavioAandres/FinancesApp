import React from "react";
import { Label, Icon, Button, IconButton, } from "emerald-ui/lib/";
import NewCategoryModal from "./NewCategoryModal";
import BanksComponent from "./BanksComponents";
import UpdateEmailCredentials from './UpdateEmailCredentials'
import NewBankModal from './AddNewBankModal'
import NewBudgetModal from './NewBudgetModal'
import { API } from 'aws-amplify'
import formatCash from "../../utils/formatCash";
class ProfileContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      banks: [],
      showConfigEmailModal: false,
      showAddBankModal: false,
    };
  }

  onBankAdded = () => {
    this.props.getUserInformation()
  }

  onCreateCategoryClick = (evt) => {
    this.setState({
      showCategoryModal: true
    })
  }

  onSaveCategory = (category) => {
    this.setState({
      showSpinningCategoryModal: true
    })
    API.post('finances', '/user/categories', {
      body: {
        ...category
      }
    }).then(result => {
      this.setState({
        showCategoryModal: false,
        showSpinningCategoryModal: false,
      })
      this.props.saveCategory(category)
    }).catch(err => console.error(err))
  }

  onCloseCategoryModal = (evt) => this.setState({ showCategoryModal: false })

  onSaveBudget = ({ category, budget }) => {
    this.setState({
      showSpinningBudgetModal: true
    })

    API.post('finances', '/user/categories/budget', {
      body: {
        category,
        budget
      }
    })
      .then(response => {
        this.setState({
          showNewBudgetModal: false,
          showSpinningBudgetModal: false,
        })
      })
      .catch(err => console.error(err))
  }

  render() {
    const { user = {}, banks } = this.props
    const { categories = [] } = user
    const categoriesWithBudgets = categories.filter(cat => {
      return cat.budget && cat.budget.value > 0
    })
    return (
      <div className="profile-container">
        <div className="user-information-container">
          <div className="user-emails">
            <h2>Source Email: </h2>
            {user.emails && user.emails.map((item) => (
              <div key={item} className="email-config-cont">
                <p className="text-muted" style={{ display: 'inline-block', marginRight: 10 }}>{item}</p>
                <IconButton onClick={() => this.setState({ showConfigEmailModal: true })} title="Configure your source email..." icon="settings"> Settings </IconButton>
              </div>
            ))}
          </div>
          <div className="user-phones">
            <h2>Registered Phones: </h2>
            {user.phones && user.phones.map((item) => (
              <p key={item} className="text-muted">{item}</p>
            ))}
          </div>
          <div className="user-categories">
            <h2>Your custom categories: </h2>
            {user.categories && user.categories.map((category) => (
              <Label key={`userCategory-${category.label}`}>{category.label}</Label>
            ))}
            <Label onClick={this.onCreateCategoryClick} className="add-new-category" color="info">
              {" "}
              ➕ Add {" "}
            </Label>
          </div>
          <div className="user-budgets-category">
            <h2>Category Budgets:</h2>
            <p>Welcome to this new functionality,
              you'll be able to set budgets to your
              categories,
              every new payment is processed,
              we'll let you know if you've exceded
              your budget to the category. Use wisely. <b>We will use the entire month to calculate the budget status, since day 1 to 31 of the month. </b>
              <Label onClick={() => this.setState({ showNewBudgetModal: true })} className="add-new-budget" color="warning">
                ➕ Create Budget
              </Label>
            </p>
            <br />
            {categoriesWithBudgets && categoriesWithBudgets.map((category) => (
              <Label color="default" className="budget-label">{category.label} - {formatCash(category.budget.value)}</Label>
            ))}
          </div>
        </div>
        <div className="banks-information">
          <div className="bank-lists-container">
            <div className="bank-list-header">
              <h2>Tracked Banks: </h2>
              <Button onClick={() => this.setState({ showAddBankModal: true })}>
                <Icon name="add" />
                <span>Add New Bank</span>
              </Button>
            </div>
            {
              banks.map(bank => (
                <BanksComponent {...bank} key={bank._id} />
              ))
            }
          </div>
        </div>
        <NewCategoryModal save={this.onSaveCategory} loading={this.state.showSpinningCategoryModal} show={this.state.showCategoryModal} close={this.onCloseCategoryModal} />
        <NewBudgetModal save={this.onSaveBudget} loading={this.state.showSpinningBudgetModal} categories={categories} close={() => this.setState({ showNewBudgetModal: false })} show={this.state.showNewBudgetModal} />
        <NewBankModal onBankAdded={this.onBankAdded} close={() => this.setState({ showAddBankModal: false })} show={this.state.showAddBankModal} />
        <UpdateEmailCredentials close={() => this.setState({ showConfigEmailModal: false })} show={this.state.showConfigEmailModal} />
      </div>
    );
  }
}

export default ProfileContainer;
