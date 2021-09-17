import React, { useEffect, useState, lazy, Suspense } from "react";
import Navbar from "./components/navbar";
import constants from "./constants";
import Amplify, { Auth, API } from 'aws-amplify';
import awsconfig from './aws-exports';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import "emerald-ui/lib/styles.css";
import "./App.css";

const PrepaymentContainer = lazy(() => import("./components/prePaymentContainer/"));
const GraphContainer = lazy(() => import("./components/GraphsContainer/"));
const HomeContainer = lazy(() => import("./components/HomeContainer/"));
const ProfileContainer = lazy(() => import("./components/ProfileContainer/"));
const AccountsContainer = lazy(() => import("./components/AccountsContainer/"));


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


const App = () => {
  const [user, setUser] = useState({ categories: [] })
  const [banks, setBanks] = useState([])
  const [prepayments, setPrepayments] = useState([])


  const getPrePayments = () => {
    API.get("finances", "/prepayments").then(response => {
      const data = JSON.parse(response.body)
      setPrepayments(data);
    })
  };

  const getUserInformation = () => {
    API.get("finances", "/user").then(response => {
      const data = JSON.parse(response.body)
      if (!data) return;
      setUser({
        ...data,
        banks: undefined
      })
      setBanks(data.banks);
    })
  };

  useEffect(() => {
    getPrePayments();
    getUserInformation();
  },[])


  const onSavePrepayment = (data) => {

    API.put("finances", "/prepayments", { body: data })
      .then(() => {
        const { id } = data;
        setPrepayments([...prepayments.filter((item) => item._id !== id)])
      })
  };

  const addCategoryToState = (category) => {

    setUser({
      ...this.state.user,
      categories: [category, ...user.categories]
    })
  }

  return (
    <React.Fragment>
      <Navbar />
      <AmplifySignOut />
      
      <div className="full-container">
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Switch>
            <Route exact path="/" component={() => <HomeContainer user={user} />}/>
            <Route exact path="/accounts" component={AccountsContainer}/>
            <Route exact path="/graphs" component={GraphContainer}/>
            <Route exact path="/prepayment" component={() =>  
              <PrepaymentContainer
                categories={user.categories || []}
                onSavePrepayment={onSavePrepayment}
                payments={prepayments}
              />} />
            <Route exact path="/profile" component={() => 
              <ProfileContainer 
                getUserInformation={getUserInformation} 
                user={user} 
                banks={banks} 
                saveCategory={addCategoryToState} 
              />} />
          </Switch>
        </Suspense>
      </Router>
      </div>
    </React.Fragment>
  );
}

export default withAuthenticator(App);
