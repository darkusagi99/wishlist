import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';

import People from './people/peoplelist';
import UpdatePeople from './people/updatepeople';
import Presence from './presence/presencelist';
import CreateFastPresence from './presence/createpresencefast';
import ReportPresence from './report/monthreport';
import InitDay from './admin/initday';
import './App.css';

import withFirebaseAuth from 'react-with-firebase-auth'
import * as firebase from 'firebase/app';
import 'firebase/auth';


const firebaseAppAuth = firebase.auth();

const providers = {
  googleProvider: new firebase.auth.GoogleAuthProvider(),
};

const IfUnAuthed = () => {
  return (
      <div className="text-center">
          <button className="btn btn-secondary"
            onClick={() => {
              const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
              firebase.auth().signInWithRedirect(googleAuthProvider);
            }}
          >Sign in with Google
          </button>
      </div>
  );
};

class App extends Component {

      // Constructeur
      constructor(props) {

          super(props);

          this.peopleListRef = firebase.firestore().collection('peoplesList').doc("eleves");
          this.paramRef = firebase.firestore().collection('params');
          this.state = { peoples: [] };
      }

      // Méthodes pour le chargement des présences
      componentDidMount() {

          var newPeople = [];
          var that = this;

          // Chargement des personnes
          this.peopleListRef.get()
          .then(function(doc) {
                  // doc.data() is never undefined for query doc snapshots
                  var currentData = doc.data();

                  newPeople.push(currentData);

                  console.log("Personne App", doc.id, " => ", doc.data());


              // MAJ de l'etat
              that.setState({
                  peoples: doc.data().peoples
              });
              localStorage.setItem("peoples", JSON.stringify(doc.data().peoples));
              that.forceUpdate();
          });

          // Chargement des personnes
          var localParams = JSON.parse(localStorage.getItem("param"));
          if (!localParams) {
                this.paramRef.get()
                .then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                    // doc.data() is never undefined for query doc snapshots
                        localParams = doc.data();
                        console.log("Params => ", localParams);
                    });

                    localStorage.setItem("param", JSON.stringify(localParams));

                });
          }

          global.baseMorningHour = localParams.baseMorningHour;
          global.baseMorningMinute = localParams.baseMorningMinute;
          global.baseEveningHour = localParams.baseEveningHour;
          global.baseEveningMinute = localParams.baseEveningMinute;
          global.minMorningHour = localParams.minMorningHour;
          global.minMorningMinute = localParams.minMorningMinute;
          global.maxEveningHour = localParams.maxEveningHour;
          global.maxEveningMinute = localParams.maxEveningMinute;

      }

      render() {

          const {
            user,
            signOut
          } = this.props;

        return (

        <div>

        {
          user
            ? <div>
                    <Router>
                          <div className="container">
                            <Navbar collapseOnSelect bg="light" expand="lg">
                              <Nav.Link eventKey="0" as={Link} to="/" className="navbar-brand">Wishlist</Nav.Link>
                              <Navbar.Toggle aria-controls="basic-navbar-nav" />
                              <Navbar.Collapse id="basic-navbar-nav">
                                <Nav className="mr-auto">

                                  <Nav.Link eventKey="1" as={Link} to="/people/list">Elèves</Nav.Link>
                                  <Nav.Link eventKey="2" as={Link} to="/presence/list">Présences</Nav.Link>
                                  <Nav.Link eventKey="3" as={Link} to="/report/month">Rapport mensuel</Nav.Link>
                                  <Nav.Link eventKey="4" as={Link} to="/admin/initday">Initialiser journée</Nav.Link>
                                </Nav>
                                <Nav>
                                  <Button className="btn btn-secondary" onClick={signOut}>Deconnecter</Button>
                                </Nav>
                              </Navbar.Collapse>
                            </Navbar> <br/>
                            <Switch>
                                <Route path='/people/create' component={ UpdatePeople } />
                                <Route path='/people/list' component={ People } />
                                <Route path='/people/refresh' component={ People } />
                                <Route path='/people/update/:id' component={ UpdatePeople } />
                                <Route path='/presence/create' component={ CreateFastPresence } />
                                <Route path='/presence/list' component={ Presence } />
                                <Route path='/presence/update/:dateRef/:id' component={ CreateFastPresence } />
                                <Route path='/report/month' component={ ReportPresence } />
                                <Route path='/admin/initday' component={ InitDay } />
                                <Route path='/' component={ CreateFastPresence } />
                            </Switch>
                          </div>
                    </Router>
                </div>
            :
             IfUnAuthed()
        }
        </div>
        );
      }
}

export default withFirebaseAuth({
  providers,
  firebaseAppAuth,
})(App);


