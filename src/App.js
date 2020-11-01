import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Presence from './wish/wishlist';
import CreateWish from './wish/createwish';
import UpdateWish from './wish/updatewish';
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

          this.peopleListRef = firebase.firestore().collection('peopleList').doc("peoples");
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

      }

      render() {

          const {
            user,
            signOut
          } = this.props;

        return (

        <div>

        {  user ?
           <div>
                    <Router>
                          <div className="container">
                            <Navbar collapseOnSelect bg="light" expand="lg">
                                <Nav.Link eventKey="0" as={Link} to="/" className="navbar-brand">Wishlist</Nav.Link>
                                <Nav>
                                  <Button className="btn btn-secondary float-right" onClick={signOut}>Deconnecter</Button>
                                </Nav>
                            </Navbar> <br/>
                            <Switch>
                                <Route path='/wish/create' component={ CreateWish } />
                                <Route path='/wish/list' component={ Presence } />
                                <Route path='/wish/update/:id' component={ UpdateWish } />
                                <Route path='/' component={ Presence } />
                            </Switch>
                          </div>
                    </Router>
                </div>
          : IfUnAuthed()
        }
        </div>
        );
      }
}

export default withFirebaseAuth({
  providers,
  firebaseAppAuth,
})(App);


