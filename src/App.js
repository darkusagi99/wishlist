import React, { Component } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import ListWish from './wish/wishlist';
import CreateWish from './wish/createwish';
import './App.css';

import withFirebaseAuth from 'react-with-firebase-auth'
import firebase from 'firebase/app';
require('firebase/auth')

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
              //firebase.auth().signInWithRedirect(googleAuthProvider);
			  firebase.auth().signInWithPopup(googleAuthProvider)
			  .then((result) => {
				// The signed-in user info.
				var user = result.user;
			  });

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
          this.state = { peoples: [] };
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
                                <Route path='/wish/list' component={ ListWish } />
                                <Route path='/' component={ ListWish } />
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


