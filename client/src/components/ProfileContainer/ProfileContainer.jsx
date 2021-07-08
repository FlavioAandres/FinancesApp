import React, { useEffect, useState } from "react";
import { Label, Icon, Button, IconButton, } from "emerald-ui/lib/";
import NewCategoryModal from "./NewCategoryModal";
import BanksComponent from "./BanksComponents";
import UpdateEmailCredentials from './UpdateEmailCredentials'
import NewBankModal from './AddNewBankModal'
import NewBudgetModal from './NewBudgetModal'
import { API } from 'aws-amplify'
import formatCash from "../../utils/formatCash";


const ProfileContainer = ({ getUserInformation, saveCategory, banks, user = { categories: [] } }) => {
  const [showConfigEmailModal, setShowConfigEmailModal] = useState(false)
  const [showAddBankModal, setShowAddBankModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showSpinningCategoryModal, setShowSpinningCategoryModal] = useState(false)
  const [showNewBudgetModal, setShowNewBudgetModal] = useState(false)
  const [showSpinningBudgetModal, setShowSpinningBudgetModal] = useState(false)
  const [categoriesWithBudgets, setCategoriesWithBudgets] = useState([])

  const onBankAdded = () => {
    getUserInformation()
  }

  const onCreateCategoryClick = () => setShowCategoryModal(true)

  const onCloseCategoryModal = (evt) => setShowCategoryModal(false)

  const onSaveCategory = (category) => {
    setShowSpinningCategoryModal(true)
    API.post('finances', '/user/categories', {
      body: {
        ...category
      }
    }).then(result => {
      setShowCategoryModal(false)
      setShowSpinningCategoryModal(false)
      saveCategory(category)
    }).catch(err => console.error(err))
  }

  const onSaveBudget = ({ category, budget }) => {
    setShowSpinningBudgetModal(true)

    API.post('finances', '/user/categories/budget', {
      body: {
        category,
        budget
      }
    })
      .then(response => {
        setShowNewBudgetModal(false)
        setShowSpinningBudgetModal(false)
      })
      .catch(err => console.error(err))
  }

  useEffect(() => {
    setCategoriesWithBudgets(user.categories.filter(cat => {
      return cat.budget && cat.budget.value > 0
    }))
  }, [user])

  return (
    <div className="profile-container">
      <div className="user-information-container">
        <div className="user-emails">
          <h2>Source Email: </h2>
          {user.emails && user.emails.map((item) => (
            <div key={item} className="email-config-cont">
              <p className="text-muted" style={{ display: 'inline-block', marginRight: 10 }}>{item}</p>
              <IconButton onClick={() => setShowConfigEmailModal(true)} title="Configure your source email..." icon="settings"> Settings </IconButton>
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
          <Label onClick={onCreateCategoryClick} className="add-new-category" color="info">
            <span role="img" aria-label="add category">➕</span> Add
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
            <Label onClick={() => setShowNewBudgetModal(true)} className="add-new-budget" color="warning">
              <span role="img" aria-label="add budget">➕</span> Create Budget
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
            <Button onClick={() => setShowAddBankModal(true)}>
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
      <NewCategoryModal save={onSaveCategory} loading={showSpinningCategoryModal} show={showCategoryModal} close={onCloseCategoryModal} />
      <NewBudgetModal save={onSaveBudget} loading={showSpinningBudgetModal} categories={user.categories} close={() => setShowNewBudgetModal(false)} show={showNewBudgetModal} />
      <NewBankModal onBankAdded={onBankAdded} close={() => setShowAddBankModal(false)} show={showAddBankModal} />
      <UpdateEmailCredentials close={() => setShowConfigEmailModal(false)} show={showConfigEmailModal} />
    </div>
  );
}

export default ProfileContainer;
