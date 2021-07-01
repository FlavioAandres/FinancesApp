import React from "react";
import Navbar from "./components/navbar";
import PrepaymentContainer from "./components/prePaymentContainer";
import GraphContainer from "./components/GraphsContainer";
import HomeContainer from "./components/HomeContainer";
import DataCreditContainer from "./components/DataCreditContainer";
import ProfileContainer from "./components/ProfileContainer/";
import constants from "./constants";
import Amplify, { Auth, API } from 'aws-amplify';
import awsconfig from './aws-exports';
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import "emerald-ui/lib/styles.css";
import "./App.css";
Amplify.configure({
  ...awsconfig,
  API: {
    endpoints: [
      {
        name: "finances",
        endpoint: constants.apiGateway.URL,
        region: constants.apiGateway.REGION,
        custom_header: async () => {
          return { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` }
        },
      }
    ]
  }
});
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      banks: [],
      prepayments: [],
      incomes: [],
      navbarActive: "home",
      token: null
    };
  }

  getPrePayments = () => {
    const self = this;
    API.get("finances", "/prepayments").then(response => {
      const data = JSON.parse(response.body)
      self.setState({
        prepayments: data,
      });
    })
  };

  getIncomes = () => {
    const self = this;
    API.get("finances", "/incomes").then(response => {
      const data = JSON.parse(response.body)
      self.setState({
        incomes: data,
      })
    })
  }

  componentDidMount = async () => {
    this.loadInitialData()
  };

  loadInitialData() {
    this.getPrePayments();
    this.getUserInformation();
    this.getIncomes();
  }

  onLoginClick = (secret) => {
    API.post("finances", "/secretKey", { body: { secretKey: secret } }).then(response => {
      this.setState({ secret: true })
    })
  };

  getUserInformation = () => {
    API.get("finances", "/user").then(response => {
      const data = JSON.parse(response.body)
      if (!data) return;
      this.setState({
        user: {
          ...data,
          banks: undefined,
        },
        banks: data.banks,
      });
    })
  };

  onSavePrepayment = (data) => {
    const self = this;

    API.put("finances", "/prepayments", { body: data })
      .then(() => {
        const { id } = data;
        self.setState({
          prepayments: self.state.prepayments.filter((item) => item._id !== id),
        });
      })

  };
  addCategoryToState = (category) => {
    const newCategories = this.state.user.categories || []
    newCategories.push(category)
    this.setState({
      user: {
        ...this.state.user,
        categories: newCategories
      }
    })
  }

  render() {

    const { prepayments, user } = this.state;
    return (
      <React.Fragment>
        <Navbar
          updateNav={(evt, nav) => {
            evt.preventDefault();
            this.setState({ navbarActive: nav });
          }}
        />
        <AmplifySignOut />
        <div className="full-container">
          {this.state.navbarActive === "prepayment" && (
            <PrepaymentContainer
              categories={user.categories || []}
              onSavePrepayment={this.onSavePrepayment}
              payments={prepayments}
            />
          )}
          {this.state.navbarActive === "graph" && <GraphContainer />}
          {this.state.navbarActive === "home" && <HomeContainer user={this.state.user} />}
          {this.state.navbarActive === "datacredit" && <DataCreditContainer />}
          {this.state.navbarActive === "profile" && (
            <ProfileContainer getUserInformation={this.getUserInformation} user={this.state.user} banks={this.state.banks} saveCategory={this.addCategoryToState} />
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default withAuthenticator(App);
