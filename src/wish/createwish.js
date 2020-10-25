import 'date-fns';
import React, { Component } from 'react'
import firebase from '../firebase';
import {getDayId} from '../common/utils.js';

class CreateWish extends Component {

    // Constructeur
    constructor(props) {
        super(props);

        // Bind des méthodes
        this.handlePersonChange = this.handlePersonChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        // Déclaration firebase
        this.journeeRef = firebase.firestore().collection('wishes');
        this.wishlist = firebase.firestore().collection('wishes').doc('wishes');

        // Initialisation pour la date du jour
        var presenceDate = new Date();
        presenceDate.setHours(0);
        presenceDate.setMinutes(0);
        presenceDate.setSeconds(0);
        presenceDate.setMilliseconds(0);

        var currentDateId = getDayId(presenceDate);

        // Initialisation du state
        this.state = {
            presenceIndex : -1,
            personId : '',
            selectedDate : presenceDate,
            arrivalTime : new Date(),
            depatureTime : new Date(),
            hasMeal : false,
            peoples: [],
            presences: [],
            wishes: [],
            currentDateId : currentDateId
        }
    }

    // Chargement du composant
    componentDidMount() {
        var that = this;
        var currentPresenceList;
        var currentDateId = this.state.currentDateId;
        var presenceDate = this.state.selectedDate;
        var currentPersonId = '';

        // Chargement liste personnes
        this.setState({
            peoples : JSON.parse(localStorage.getItem("peoples"))
        });

        // Initialisation des heures

        if (this.props.match.params.id !== undefined) {
            currentPersonId = this.props.match.params.id;

            this.setState({
                personId : this.props.match.params.id
            });

        }

        if (this.props.match.params.dateRef !== undefined) {
            currentDateId = this.props.match.params.dateRef;
            presenceDate.setFullYear(currentDateId.slice(0,4));
            presenceDate.setMonth(currentDateId.slice(5,7));
            presenceDate.setDate(currentDateId.slice(8,10));

            this.setState({
                currentDateId : currentDateId,
                selectedDate : presenceDate
            });

        }

        this.journeeRef.doc(currentDateId)
        .get()
        .then(function(doc) {
            if(doc.exists)  {
                currentPresenceList = doc.data().presences;
            } else {
                currentPresenceList = [];
            }

            that.setState({
                presences : currentPresenceList
            });

            that.loadPresence(currentPersonId);

            console.log("currentPresenceList Loaded", currentPresenceList);
        });

    }

    loadPresence(paramPersonId) {

        console.log("id to find : ", this.state.personId);

        // Recherche de la personne dans la liste des journées
        var currentPresenceIndex = this.state.presences.findIndex(presence => presence.personId == paramPersonId);

        console.log("currentPersonIndex : ", currentPresenceIndex);

        // doc.data() is never undefined for query doc snapshots
        if (currentPresenceIndex !== -1) {

            this.setState({
                presenceIndex : currentPresenceIndex,
                personId : this.state.presences[currentPresenceIndex].personId,
                selectedDate : new Date(this.state.presences[currentPresenceIndex].presenceDay.seconds*1000),
                arrivalTime : new Date(this.state.presences[currentPresenceIndex].arrival.seconds*1000),
                depatureTime : new Date(this.state.presences[currentPresenceIndex].departure.seconds*1000),
                hasMeal : this.state.presences[currentPresenceIndex].hasMeal
            });

            this.state.presences[currentPresenceIndex].hasMeal ? this.refs.hasMeal.classList.add('active') : this.refs.hasMeal.classList.remove('active') ;
            this.state.presences[currentPresenceIndex].hasMeal ? this.refs.hasMeal.innerHTML = "Avec Repas" : this.refs.hasMeal.innerHTML = "Sans Repas" ;

        } else {

            this.setState({
                presenceIndex : -1
            });
        }

    }


    handlePersonChange = e => {

        console.log("targetValue : ", e.target.value);


        this.setState({
            personId : e.target.value
        });

        this.loadPresence(e.target.value);

    }

    onSubmit(e) {
        e.preventDefault();

        var presenceList = this.state.presences;

        var newPresence = {
            personId : this.state.personId,
            presenceDay : this.state.selectedDate,
            arrival : this.state.arrivalTime,
            departure : this.state.depatureTime,
            hasMeal : this.state.hasMeal
        }

        if (this.state.presenceIndex === -1) {

            presenceList.push(newPresence);

        } else {

            presenceList[this.state.presenceIndex] = newPresence;

        }

        const JourneeToSave = {
            presences : presenceList,
            day : this.state.selectedDate.getDate(),
            month : this.state.selectedDate.getMonth(),
            year : this.state.selectedDate.getFullYear()
        }

        this.journeeRef.doc(this.state.currentDateId).set(JourneeToSave)
        .then(this.props.history.push(`/wish/list`))
        .catch(error => {console.log(error);});


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
                        value={this.state.wish}
                        onChange={this.onChangeName} />
                    </div>
                    <div className="form-group">
                        <label>URL:  </label>
                        <input type="text"
                        className="form-control"
                        value={this.state.wishurl}
                        onChange={this.onChangeName} />
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