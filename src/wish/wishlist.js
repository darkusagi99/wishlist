import 'date-fns';
import React, { Component } from 'react'
import { Link } from 'react-router-dom';
import firebase from 'firebase/app';
import db from "../firebase";

class ListWish extends Component {

    // Constructeur
    constructor(props) {
        super(props);

        // Bind des méthodes
        this.handlePersonChange = this.handlePersonChange.bind(this);
        this.addBooking = this.addBooking.bind(this);
        this.removeBooking = this.removeBooking.bind(this);

        // Initialisations firebase
        this.wishlist = firebase.firestore().collection('wishes');
        this.peopleListRef = db.collection('peopleList').doc("peoples");

        // Initialisation state
        this.state = {
            peoples: [],
            wishes: [],
            displayedwishes: [],
            selectedPersonId: ''
        };
    }

    // Méthodes pour le chargement des présences
    loadWishInfo() {

        var that = this;
        var peopleList = [];
        var currentUser = firebase.auth().currentUser.email;
		
		// Chargement des personnes
		if(localStorage.getItem("peoples") === null) {
			this.peopleListRef.get()
			  .then(function(doc) {
					  // doc.data() is never undefined for query doc snapshots
					  var currentData = doc.data();

					  peopleList = currentData.peoples;

					  console.log("Personne App", doc.id, " => ", doc.data());


				  // MAJ de l'etat
				  that.setState({
					  peoples: doc.data().peoples
				  });
				  localStorage.setItem("peoples", JSON.stringify(doc.data().peoples));
				  that.forceUpdate();
			});
		} else {
			// Chargement liste personnes
			this.setState({
				peoples : JSON.parse(localStorage.getItem("peoples"))
			});
			peopleList = JSON.parse(localStorage.getItem("peoples"));
		}
		

        // Chargement des souhaits
		var loadedwishes = [];
		var wishListLoad;
		if (currentUser === 'darkusagi99@gmail.com') {
			wishListLoad = this.wishlist;
		} else {
			wishListLoad = this.wishlist.where('supplier', 'in', ['', currentUser]);
		}
        wishListLoad.get()
			.then((docList) => {
				docList.forEach((doc) => {
					// doc.data() is never undefined for query doc snapshots
					console.log("Wishes App", doc.id, " => ", doc.data());
					
					console.log("peopleList", peopleList);

					// Chargement des souhaits
					var tempWish = doc.data();
					tempWish.id = doc.id;
					var tempPeople = peopleList.filter(people => people.id === Number(tempWish.personId));
					tempWish.fullname = tempPeople[0].fullname;
					
					
					console.log("Added Wishes", doc.id, " => ", tempWish);
					
					loadedwishes.push(tempWish);
					
				});
				that.setState({
					wishes : loadedwishes,
					displayedwishes : loadedwishes
				});
				that.forceUpdate();
			})

        console.log(firebase.auth().currentUser.email);

    }
	
	 // Chargement du composant
    componentDidMount() {
		this.loadWishInfo();
	}

    handlePersonChange = e => {

        var selectedwishes = [];

        if (e.target.value !== "") {
            selectedwishes = this.state.wishes.filter((wish) => (e.target.value === wish.personId));
        } else {
            selectedwishes = this.state.wishes;
        }

        console.log("selected ", e.target.value);

        this.setState({
            selectedPersonId : e.target.value,
            displayedwishes : selectedwishes
        });

    }
	
	addBooking = id => {
		
		var wishToUpdate = this.wishlist.doc(id);

        console.log(firebase.auth().currentUser.email);
        console.log(this.state.wishes);
        console.log(this.state.currentIndex);
		
		var setWithMerge = wishToUpdate.set({
			supplier: firebase.auth().currentUser.email
		}, { merge: true })
            .then(this.loadWishInfo())
            .catch(error => {console.log(error);});
    }
	
	removeBooking = id => {
		
		var wishToUpdate = this.wishlist.doc(id);

        console.log(firebase.auth().currentUser.email);
        console.log(this.state.wishes);
        console.log(this.state.currentIndex);

		var setWithMerge = wishToUpdate.set({
			supplier: ''
		}, { merge: true })
            .then(this.loadWishInfo())
            .catch(error => {console.log(error);});
    }

    // Rendu de la page
    render() {
        return (
            <div>
                <center><h1>Souhaits</h1></center>

        {
            firebase.auth().currentUser.email === 'darkusagi99@gmail.com' ?
                <div>
                    <Link to={'/wish/create'} className="nav-link">Création Souhait</Link>
                </div>
            : <br/>
        }

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
                                <td>
                                {
                                    wishes.supplier ? <div><span>{wishes.supplier}</span> 
                                    <button onClick={() => this.removeBooking(wishes.id)} className="nav-link">Supprimer réservation</button></div> :
                                    <button onClick={() => this.addBooking(wishes.id)} className="nav-link">Reserver cadeau</button>
                                }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        )
    }

};


export default ListWish