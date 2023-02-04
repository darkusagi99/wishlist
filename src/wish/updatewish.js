import 'date-fns';
import React, { Component } from 'react'
import firebase from 'firebase/app';

class UpdateWish extends Component {

    // Constructeur
    constructor(props) {
        super(props);

        // Bind des méthodes
        this.handlePersonChange = this.handlePersonChange.bind(this);
        this.onChangeUrl = this.onChangeUrl.bind(this);
        this.onChangeText = this.onChangeText.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        // Déclaration firebase
        this.wishlist = firebase.firestore().collection('wishes').doc('wishes');

        // Initialisation du state
        this.state = {
            personId : '',
            peoples: [],
            wishes: [],
            wishurl: '',
            wishtext: '',
            currentWish: ''
        }
    }

    // Chargement du composant
    componentDidMount() {
        var that = this;
        var currentId = this.props.match.params.id;

        console.log("Wish to update - id", this.props.match.params.id);

        // Chargement liste personnes
        this.setState({
            peoples : JSON.parse(localStorage.getItem("peoples")),
            currentWish : currentId
        });

        // Chargement des souhaits
        this.wishlist.get()
            .then(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                console.log("Wishes App", doc.id, " => ", doc.data());

                console.log("Wish to update - id", currentId);
                console.log("Wish to update - id", doc.data().wishlist);
                console.log("Wish to update - id", doc.data().wishlist.filter((wish) => (currentId == wish.id)));

                var tempWish = doc.data().wishlist.filter((wish) => (currentId == wish.id))

                // Chargement des souhaits
                that.setState({
                    wishes: doc.data().wishlist,
                    currentWish : tempWish[0],
                    currentIndex : doc.data().wishlist.findIndex((wish) => (currentId == wish.id))
                });
                that.forceUpdate();
            });


    }

    handlePersonChange = e => {

        console.log("targetValue : ", e.target.value);


        this.setState({
            personId : e.target.value
        });

    }

    onSubmit(e) {
        e.preventDefault();

        var wishList = this.state.wishes;

        console.log(firebase.auth().currentUser.email);
        console.log(this.state.wishes);
        console.log(this.state.currentIndex);

        if (wishList !== undefined && wishList !== null) {
            wishList[this.state.currentIndex].supplier = firebase.auth().currentUser.email;

            const wishesToSave = {
                wishlist: wishList
            }

            console.log(wishList);

            this.wishlist.set(wishesToSave)
            .then(this.props.history.push(`/wish/list`))
            .catch(error => {console.log(error);});

        }

    }

    // Gestion changements nom
    onChangeUrl(e) {
        this.setState({
            wishurl : e.target.value
        });
    }

    // Gestion changements nom
    onChangeText(e) {
        this.setState({
            wishtext : e.target.value
        });
    }

    render() {
        return (
            <div style={{marginTop: 10}}>
                <h3>Souhait</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <label className="input-group-text" htmlFor="inputGroupPerson">Personne</label>
                        </div>

                        <div className="form-group input-group-text">
                            <label>{this.state.currentWish.fullname} </label>
                        </div>

                    </div>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <label className="input-group-text" htmlFor="inputGroupPerson">Souhait</label>
                        </div>
                        <div className="form-group input-group-text">
                            <label>{this.state.currentWish.wish} </label>
                        </div>
                    </div>
                    <div className="form-group">
                        <input type="submit" value="Reserver" className="btn btn-primary"/>
                    </div>
                </form>
            </div>
        )
    }

};


export default UpdateWish