import 'date-fns';
import React, { Component } from 'react'
import DateFnsUtils from '@date-io/date-fns';
import { Link } from 'react-router-dom';
import firebase from '../firebase';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import {getDayId} from '../common/utils.js';

class Presence extends Component {

    // Constructeur
    constructor(props) {
        super(props);

        // Bind des méthodes
        this.handlePersonChange = this.handlePersonChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.displayFormatedDate = this.displayFormatedDate.bind(this);
        this.displayFormatedTime = this.displayFormatedTime.bind(this);

        // Initialisations firebase
        this.journeeRef = firebase.firestore().collection('journee');


        // Initialisation state
        this.state = {
            presences: [],
            alldaypresences: [],
            peoples: [],
            selectedDate: '',
            selectedPersonId: '',
            currentDateId: ''
        };
    }

    // Méthodes pour le chargement des présences
    componentDidMount() {

        // Chargement liste personnes
        this.setState({
            peoples : JSON.parse(localStorage.getItem("peoples"))
        });

    }

    handlePersonChange = e => {

        var selectedpresences = this.state.alldaypresences.filter((presence) => (e.target.value === presence.personId));

        this.setState({
            selectedPersonId : e.target.value,
            presences : selectedpresences
        });

    }

    handleDateChange = date => {

        var that = this;
        var currentDateId = getDayId(date);
        var currentPresenceList = [];
        var currentPresenceToShow = [];

        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        console.log("SearchDate => ", currentDateId);

        this.journeeRef.doc(currentDateId)
        .get()
        .then(function(doc) {
            if(doc.exists)  {
                console.log("docExiste => ", currentDateId);
                currentPresenceList = doc.data().presences;
                currentPresenceToShow = currentPresenceList;
                // Filtre de la date voulue
                if (that.state.selectedPersonId !== '') {
                    currentPresenceToShow = currentPresenceList.filter((presence) => (that.state.selectedPersonId === presence.personId));
                }

                that.setState({
                    presences : currentPresenceToShow,
                    alldaypresences : currentPresenceList
                });

            } else {
                currentPresenceList = [];
            }
        });

        that.setState({
            presences : currentPresenceList,
            alldaypresences : currentPresenceList,
            selectedDate : date,
            currentDateId : currentDateId
        });

        console.log("SearchDate => presences : ", currentPresenceList);


    }

    // Affichage de la date formattée
    displayFormatedTime(date) {
        var dateToFormat = new Date(date.seconds*1000)
        return dateToFormat.getHours() + ":" + dateToFormat.getMinutes().toString().padStart(2,0);
    }

    // Affichage de l'heure formattée
    displayFormatedDate(date) {
        var dateToFormat = new Date(date.seconds*1000)
        return dateToFormat.toLocaleDateString("fr-FR");
    }

    // Rendu de la page
    render() {
        return (
            <div>
                <center><h1>Présences</h1></center>

                <div>
                    <Link to={'/presence/create'} className="nav-link">Création Présence</Link>
                </div>

                <div style={{marginTop: 10}}>
                    <h4>Filtres</h4>
                    <form onSubmit={this.onSubmit}>
                        <div className="form-group">
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                format="dd/MM/yyyy"
                                margin="normal"
                                id="date-picker-inline"
                                label=""
                                autoOk="true"
                                value={this.state.selectedDate}
                                onChange={this.handleDateChange}
                                KeyboardButtonProps={{
                                'aria-label': 'change date',
                                }}
                                />
                            </MuiPickersUtilsProvider>
                        </div>
                        <div className="input-group mb-3">
                            <div className="input-group-prepend">
                                <label className="input-group-text" htmlFor="inputGroupPerson">Eleve</label>
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
                            <th scope="col">Jour</th>
                            <th scope="col">Arrivé</th>
                            <th scope="col">Départ</th>
                            <th scope="col">Repas</th>
                            <th scope="col">&nbsp;</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.presences.map((presence) => (
                            <tr key={presence.id}>
                                <td>{this.state.peoples.filter((people) => (people.id === presence.personId)).map((people) => people.fullname)}</td>
                                <td>{presence.presenceDay ? (this.displayFormatedDate(presence.presenceDay)) : ("-")}</td>
                                <td>{presence.arrival ? (this.displayFormatedTime(presence.arrival)) : ("-")}</td>
                                <td>{presence.departure ? (this.displayFormatedTime(presence.departure)) : ("-")}</td>
                                <td>{presence.hasMeal ? ("Avec Repas") : ("Sans Repas")}</td>

                                <td><Link to={'/presence/update/' + presence.id} className="nav-link">MàJ Présence</Link></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        )
    }

};


export default Presence