import React, { useEffect, useState } from "react";
import { Label, Icon, Button, IconButton } from "emerald-ui/lib/";
import NewCategoryModal from "./NewCategoryModal";
import NewAutoFill from "./AddNewAutofill";
import BanksComponent from "./BanksComponents";
import UpdateEmailCredentials from "./UpdateEmailCredentials";
import NewBankModal from "./AddNewBankModal";
import NewBudgetModal from "./NewBudgetModal";
import { API } from "aws-amplify";
import formatCash from "../../utils/formatCash";
import swal from "sweetalert2";

const ProfileContainer = ({
  getUserInformation,
  saveCategory,
  banks,
  user = { categories: [] },
}) => {
  const [showConfigEmailModal, setShowConfigEmailModal] = useState(false);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSpinningCategoryModal, setShowSpinningCategoryModal] =
    useState(false);
  const [showNewBudgetModal, setShowNewBudgetModal] = useState(false);
  const [showNewAutofillModal, setShowNewAutofillModal] = useState(false);
  const [showSpinningBudgetModal, setShowSpinningBudgetModal] = useState(false);
  const [showSpiningAutofillModal, setShowSpiningAutofillModal] = useState(false);
  const [categoriesWithBudgets, setCategoriesWithBudgets] = useState([]);

  const onBankAdded = () => {
    getUserInformation();
  };

  const onCreateCategoryClick = () => setShowCategoryModal(true);
  const onCloseCategoryModal = (evt) => setShowCategoryModal(false);
  const onSaveCategory = (category) => {
    setShowSpinningCategoryModal(true);
    API.post("finances", "/user/categories", {
      body: {
        ...category,
      },
    })
      .then((result) => {
        setShowCategoryModal(false);
        setShowSpinningCategoryModal(false);
        saveCategory(category);
      })
      .catch((err) => console.error(err));
  };
  const handleRemoveBudgetButton = (category) => {
    swal
      .fire({
        title: `Are you sure of removing ${category.label} budget?`,
        text: "The history of this budget will keep in yout Budget Dashboard, but the budge wont be longer calculated.",
        icon: "warning",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Remove budget",
        denyButtonText: `Cancel`,
      })
      .then((result) => {
        if (!result.isConfirmed) return null;
        API.put("finances", `/user/categories/budget/${category.value}`, {
          body: {},
        })
          .then((item) => {
            setCategoriesWithBudgets(
              categoriesWithBudgets.filter(
                (cat) => cat.value !== category.value
              )
            );
          })
          .catch(console.error);
      });
  };

  const onSaveBudget = ({ category, budget }) => {
    setShowSpinningBudgetModal(true);

    API.post("finances", "/user/categories/budget", {
      body: {
        category,
        budget,
      },
    })
      .then((response) => {
        const newBudgetCategory = [
          ...categoriesWithBudgets,
          {
            value: category,
            label: category,
            budget: {
              value: budget,
              current: 0,
              progress: 0,
            },
          },
        ];
        setShowNewBudgetModal(false);
        setShowSpinningBudgetModal(false);
        setCategoriesWithBudgets(newBudgetCategory);
      })
      .catch((err) => console.error(err));
  };

  const onSaveAutofill = ({category, word})=>{
    console.log(category, word)
    setShowSpiningAutofillModal(false)
    setShowNewAutofillModal(false)
  }

  useEffect(() => {
    setCategoriesWithBudgets(
      user.categories.filter((cat) => {
        return cat.budget && cat.budget.value > 0;
      })
    );
  }, [user]);

  return (
    <div className="profile-container">
      <div className="user-information-container">
        <div className="user-emails">
          <h2>Source Email: </h2>
          {user.emails &&
            user.emails.map((item) => (
              <div key={item} className="email-config-cont">
                <p
                  className="text-muted"
                  style={{ display: "inline-block", marginRight: 10 }}
                >
                  {item}
                </p>
                <IconButton
                  onClick={() => setShowConfigEmailModal(true)}
                  title="Configure your source email..."
                  icon="settings"
                >
                  {" "}
                  Settings{" "}
                </IconButton>
              </div>
            ))}
        </div>
        <div className="user-phones">
          <h2>Registered Phones: </h2>
          {user.phones &&
            user.phones.map((item) => (
              <p key={item} className="text-muted">
                {item}
              </p>
            ))}
        </div>
        <div className="user-categories">
          <h2>Your custom categories: </h2>
          {user.categories &&
            user.categories.filter(item=>item.label).map((category) => (
              <Label key={`userCategory-${category.label}`}>
                {category.label}
              </Label>
            ))}
          <Label
            onClick={onCreateCategoryClick}
            className="add-new-category"
            color="info"
          >
            <span role="img" aria-label="add category">
              ➕
            </span>{" "}
            Add
          </Label>
        </div>
        <div className="user-budgets-category">
          <h2>Category Budgets:</h2>
          <p>
            Welcome to this new functionality, you'll be able to set budgets to
            your categories, every new payment is processed, we'll let you know
            if you've exceded your budget to the category. Use wisely.
            <b>
              We will use the entire month to calculate the budget status, since
              day 1 to 31 of the month.{" "}
            </b>
            <Label
              onClick={() => setShowNewBudgetModal(true)}
              className="add-new-budget"
              color="warning"
            >
              <span role="img" aria-label="add budget">
                ➕
              </span>{" "}
              Create Budget
            </Label>
          </p>
          <br />
          {categoriesWithBudgets &&
            categoriesWithBudgets.map((category, idx) => (
              <div className="budget-labels-container" key={`current-category-budget-${idx}`}>
                <Label color="default" className="budget-label">
                  {category.label} - {formatCash(category.budget.value)}
                </Label>
                <Button
                  shape="flat"
                  className="delete-budget"
                  onClick={() => handleRemoveBudgetButton(category)}
                >
                  <Icon name="remove_circle" className="text-danger" />
                </Button>
              </div>
            ))}
        </div>
      </div>
      <div className="right-side">
        <div className="banks-information">
          <div className="bank-lists-container">
            <div className="bank-list-header">
              <h2>Tracked Banks: </h2>
              <Button onClick={() => setShowAddBankModal(true)}>
                <Icon name="add" />
                <span>Add New Bank</span>
              </Button>
            </div>
            {banks.map((bank) => (
              <BanksComponent {...bank} key={bank._id} />
            ))}
          </div>
        </div>
        <div className="autofill-options">
          <div className="autofill-headers">
            <h2>Autofill categories: </h2>
            <p>
              With this feature you can set magical words to 
              clasify your payments. If those magical words 
              matchs with the content of your payment, 
              this automatically will asign a category
            </p>
          </div>
          <div className="autofill-list">
          <Label
              onClick={()=> setShowNewAutofillModal(true)}
              className="add-new-autofill"
              color="warning"
            >
              <span role="img" aria-label="add budget">
                ➕
              </span>{" "}
              New autofill Category
            </Label>
          </div>
        </div>
      </div>
      <NewCategoryModal
        save={onSaveCategory}
        loading={showSpinningCategoryModal}
        show={showCategoryModal}
        close={onCloseCategoryModal}
      />
      <NewBudgetModal
        save={onSaveBudget}
        loading={showSpinningBudgetModal}
        categoryWithBudgets={categoriesWithBudgets}
        categories={user.categories}
        close={() => setShowNewBudgetModal(false)}
        show={showNewBudgetModal}
      />
      <NewAutoFill
        save={onSaveAutofill}
        loading={showSpiningAutofillModal}
        categories={user.categories}
        close={() => setShowNewAutofillModal(false)}
        show={showNewAutofillModal}
      />
      <NewBankModal
        onBankAdded={onBankAdded}
        close={() => setShowAddBankModal(false)}
        show={showAddBankModal}
      />
      <UpdateEmailCredentials
        close={() => setShowConfigEmailModal(false)}
        show={showConfigEmailModal}
      />
    </div>
  );
};

export default ProfileContainer;
