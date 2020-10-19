import 'date-fns';
import React, { Component } from 'react'
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import firebase from '../firebase';
import {getDayId} from '../common/utils.js';

class CreateFastPresence extends Component {

    // Constructeur
    constructor(props) {
        super(props);

        // Bind des méthodes
        this.handlePersonChange = this.handlePersonChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.handleArrivalChange = this.handleArrivalChange.bind(this);
        this.handleDepartureChange = this.handleDepartureChange.bind(this);
        this.handleMealChange = this.handleMealChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.resetHours = this.resetHours.bind(this);

        // Déclaration firebase
        this.journeeRef = firebase.firestore().collection('journee');

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
        this.resetHours();

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

            this.resetHours();

            this.setState({
                presenceIndex : -1
            });
        }

    }

    resetHours() {
        // RAZ des heures
        var arrivalDate = new Date();
        var departureDate = new Date();

        arrivalDate.setHours(global.baseMorningHour);
        arrivalDate.setMinutes(global.baseMorningMinute);
        arrivalDate.setSeconds(0);
        arrivalDate.setMilliseconds(0);
        departureDate.setHours(global.baseEveningHour);
        departureDate.setMinutes(global.baseEveningMinute);
        departureDate.setSeconds(0);
        departureDate.setMilliseconds(0);

        this.setState({
            arrivalTime : arrivalDate,
            depatureTime : departureDate
        });

    }

    handlePersonChange = e => {

        console.log("targetValue : ", e.target.value);

        // RAZ des heures
        this.resetHours();

        this.setState({
            personId : e.target.value
        });

        this.loadPresence(e.target.value);

    }

    handleDateChange = date => {

        var that = this;
        var currentDateId = getDayId(date);
        var currentPresenceList;

        // RAZ des heures
        this.resetHours();

        this.journeeRef.doc(currentDateId)
        .get()
        .then(function(doc) {
            if(doc.exists)  {
                currentPresenceList = doc.data().presences;
            } else {
                currentPresenceList = [];
            }

            that.setState({
                selectedDate : date,
                currentDateId : currentDateId,
                presences : currentPresenceList
            });


            that.loadPresence(that.state.personId);

        });

        this.setState({
            selectedDate : date,
            currentDateId : currentDateId,
            presences : currentPresenceList
        });


        console.log("DateId : ", currentDateId);

    }

    handleArrivalChange = date => {
        this.setState({
            arrivalTime : date
        });
    }

    handleDepartureChange = date => {
        this.setState({
            depatureTime : date
        });
    }

    handleMealChange(e) {
        e.target.classList.toggle('active');
        const active = e.target.classList.contains('active');
        this.setState({
            hasMeal: active
        });

        if (active) {
            e.target.innerHTML = "Avec Repas";
        }  else {
            e.target.innerHTML = "Sans Repas";
        }
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
        .then(this.props.history.push(`/presence/list`))
        .catch(error => {console.log(error);});


    }

    render() {
        return (
            <div style={{marginTop: 10}}>
                <h3>Présence</h3>
                <form onSubmit={this.onSubmit}>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <label className="input-group-text" htmlFor="inputGroupPerson">Eleve</label>
                        </div>

                        <select className="custom-select" id="inputGroupPerson" value={this.state.personId} onChange={this.handlePersonChange}>

                            <option value=''>Choix...</option>
                            {this.state.peoples.map((people) => (
                                <option value={people.id} key={people.id}>{people.fullname}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardDatePicker
                            disableToolbar
                            variant="inline"
                            format="dd/MM/yyyy"
                            margin="normal"
                            id="date-picker-inline"
                            label="Date"
                            autoOk="true"
                            value={this.state.selectedDate}
                            onChange={this.handleDateChange}
                            KeyboardButtonProps={{
                            'aria-label': 'change date',
                            }}
                            />
                        </MuiPickersUtilsProvider>
                    </div>
                    <div className="form-group">
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardTimePicker
                            margin="normal"
                            id="time-picker"
                            label="Arrive"
                            ampm={false}
                            value={this.state.arrivalTime}
                            onChange={this.handleArrivalChange}
                            KeyboardButtonProps={{
                            'aria-label': 'change time',
                            }}
                            />
                        </MuiPickersUtilsProvider>
                    </div>
                    <div className="form-group">
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <KeyboardTimePicker
                            margin="normal"
                            id="time-picker"
                            label="Depart"
                            ampm={false}
                            value={this.state.depatureTime}
                            onChange={this.handleDepartureChange}
                            KeyboardButtonProps={{
                            'aria-label': 'change time',
                            }}
                            />
                        </MuiPickersUtilsProvider>
                    </div>
                    <div className="form-group">
                        <div className="btn-group btn-group-toggle" data-toggle="buttons">
                            <button type="button" className="btn btn-secondary" onClick={this.handleMealChange} ref="hasMeal">Sans Repas</button>
                        </div>
                    </div>
                    <div className="form-group">
                        <input type="submit" value="Enregistrer" className="btn btn-primary"/>
                    </div>
                </form>
            </div>
        )
    }

};


export default CreateFastPresence