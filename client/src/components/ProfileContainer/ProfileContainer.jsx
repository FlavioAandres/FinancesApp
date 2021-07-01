import React from "react";
import { Label, Icon, Button, IconButton } from "emerald-ui/lib/";
import NewCategoryModal from "./NewCategoryModal";
import BanksComponent from "./BanksComponents";
import UpdateEmailCredentials from './UpdateEmailCredentials'
import NewBankModal from './AddNewBankModal'

import { API } from 'aws-amplify'
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

  onBankAdded = ()=>{
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

  render() {
    const { user, banks } = this.props
    return (
      <div className="profile-container">
        <NewCategoryModal save={this.onSaveCategory} loading={this.state.showSpinningCategoryModal} show={this.state.showCategoryModal}
          close={this.onCloseCategoryModal} />
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
              <Label>{category.label}</Label>
            ))}
            <Label onClick={this.onCreateCategoryClick} className="add-new-category" color="info">
              {" "}
              ➕ Add {" "}
            </Label>
          </div>
        </div>
        <div className="banks-information">
          <div className="bank-lists-container">
            <div className="bank-list-header">
              <h2>Tracked Banks: </h2>
              <Button onClick={()=>this.setState({showAddBankModal: true})}>
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
        <NewBankModal onBankAdded={this.onBankAdded} close={() => this.setState({ showAddBankModal: false })} show={this.state.showAddBankModal}/>
        <UpdateEmailCredentials close={() => this.setState({ showConfigEmailModal: false })} show={this.state.showConfigEmailModal} />
      </div>
    );
  }
}

export default ProfileContainer;
