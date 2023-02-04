import 'date-fns';
import React, { Component } from 'react'
import firebase from 'firebase/app';

class CreateWish extends Component {

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
            wishtext: ''
        }
    }

    // Chargement du composant
    componentDidMount() {
        var that = this;

        // Chargement liste personnes
        this.setState({
            peoples : JSON.parse(localStorage.getItem("peoples"))
        });

        // Chargement des souhaits
        this.wishlist.get()
            .then(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                console.log("Wishes App", doc.id, " => ", doc.data());

                // Chargement des souhaits
                that.setState({
                    wishes: doc.data().wishlist
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

        var newWish = {
            fullname : this.state.peoples[this.state.personId].fullname,
            id : wishList.length + 1,
            personId : this.state.personId,
            supplier : '',
            url : this.state.wishurl,
            wish : this.state.wishtext
        }

        wishList.push(newWish);

        const wishesToSave = {
            wishlist : wishList
        }

        this.wishlist.set(wishesToSave)
        .then(this.props.history.push(`/wish/list`))
        .catch(error => {console.log(error);});

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

                        <select className="custom-select" id="inputGroupPerson" value={this.state.personId} onChange={this.handlePersonChange}>

                            <option value=''>Choix...</option>
                            {this.state.peoples.map((people) => (
                                <option value={people.id} key={people.id}>{people.fullname}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Souhait:  </label>
                        <input type="text"
                        className="form-control"
                        value={this.state.wishtext}
                        onChange={this.onChangeText} />
                    </div>
                    <div className="form-group">
                        <label>URL:  </label>
                        <input type="text"
                        className="form-control"
                        value={this.state.wishurl}
                        onChange={this.onChangeUrl} />
                    </div>
                    <div className="form-group">
                        <input type="submit" value="Enregistrer" className="btn btn-primary"/>
                    </div>
                </form>
            </div>
        )
    }

};


export default CreateWish