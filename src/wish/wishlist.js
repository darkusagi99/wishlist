import 'date-fns';
import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import firebase from '../firebase';

class Presence extends Component {

    // Constructeur
    constructor(props) {
        super(props);

        // Bind des méthodes
        this.handlePersonChange = this.handlePersonChange.bind(this);

        // Initialisations firebase
        this.wishlist = firebase.firestore().collection('wishes').doc('wishes');


        // Initialisation state
        this.state = {
            presences: [],
            alldaypresences: [],
            peoples: [],
            wishes: [],
            displayedwishes: [],
            selectedPersonId: ''
        };
    }

    // Méthodes pour le chargement des présences
    componentDidMount() {

        var that = this;

        // Chargement liste personnes
        this.setState({
            peoples : JSON.parse(localStorage.getItem("peoples"))
        });

        // Chargement des personnes
        this.wishlist.get()
            .then(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                var currentData = doc.data();

                console.log("Wishes App", doc.id, " => ", doc.data());

                // Chargement des souhaits
                that.setState({
                    wishes: doc.data().wishlist,
                    displayedwishes: doc.data().wishlist
                });
                that.forceUpdate();
            });

    }

    handlePersonChange = e => {

        var selectedwishes = this.state.wishes.filter((wish) => (e.target.value == wish.personId));

        console.log("selected ", e.target.value);

        this.setState({
            selectedPersonId : e.target.value,
            displayedwishes : selectedwishes
        });

    }

    // Rendu de la page
    render() {
        return (
            <div>
                <center><h1>Souhaits</h1></center>

                <div>
                    <Link to={'/wish/create'} className="nav-link">Création Souhait</Link>
                </div>

                <div style={{marginTop: 10}}>
                    <h4>Filtres</h4>
                    <form onSubmit={this.onSubmit}>
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <label className="input-group-text" htmlFor="inputGroupPerson">Personne</label>
                            </div>

                            <select className="custom-select" id="inputGroupPerson" value={this.state.personId} onChange={this.handlePersonChange}>

                                <option value="">Choix...</option>
                                {this.state.peoples.map((people) => (
                                    <option value={people.id} key={people.id}>{people.fullname}</option>
                                ))}
                            </select>
                        </div>
                    </form>
                </div>

                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">Nom</th>
                            <th scope="col">Souhait</th>
                            <th scope="col">&nbsp;</th>
                            <th scope="col">&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.displayedwishes.map((wishes) => (
                            <tr key={wishes.id}>
                                <td>{wishes.fullname}</td>
                                <td>{wishes.wish}</td>
                                <td><a href={wishes.url}>lien</a></td>
                                <td><Link to={'/presence/update/' + wishes.id} className="nav-link">MàJ Présence</Link></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        )
    }

};


export default Presence