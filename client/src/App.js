import React, { useEffect, useState } from "react";
import Navbar from "./components/navbar";
import PrepaymentContainer from "./components/prePaymentContainer/";
import GraphContainer from "./components/GraphsContainer/";
import HomeContainer from "./components/HomeContainer/";
import DataCreditContainer from "./components/DataCreditContainer";
import ProfileContainer from "./components/ProfileContainer/";
import constants from "./constants";
import Amplify, { Auth, API } from 'aws-amplify';
import awsconfig from './aws-exports';
import { withAuthenticator } from '@aws-amplify/ui-react';
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


const App = () => {
  const [user, setUser] = useState({ categories: [] })
  const [banks, setBanks] = useState([])
  const [prepayments, setPrepayments] = useState([])
  const [navbarActive, setNavbarActive] = useState('profile')


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
      <Navbar
        updateNav={(evt, nav) => {
          evt.preventDefault();
          setNavbarActive(nav)
        }}
      />
      <div className="full-container">
        {navbarActive === "prepayment" && (
          <PrepaymentContainer
            categories={user.categories || []}
            onSavePrepayment={onSavePrepayment}
            payments={prepayments}
          />
        )}
        {navbarActive === "graph" && <GraphContainer />}
        {navbarActive === "home" && <HomeContainer user={user} />}
        {navbarActive === "datacredit" && <DataCreditContainer />}
        {navbarActive === "profile" && (
          <ProfileContainer getUserInformation={getUserInformation} user={user} banks={banks} saveCategory={addCategoryToState} />
        )}
      </div>
    </React.Fragment>
  );
}

export default withAuthenticator(App);
