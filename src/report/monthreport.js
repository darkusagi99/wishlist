import 'date-fns';
import React, { Component } from 'react'
import DateFnsUtils from '@date-io/date-fns';
import { Link } from 'react-router-dom';
import firebase from '../firebase';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from '@material-ui/pickers';
import {getDayId} from '../common/utils.js';

class ReportPresence extends Component {

    // Constructeur
    constructor(props) {

        super(props);

        // Bind des méthodes
        this.handleDateChange = this.handleDateChange.bind(this);
        this.journeeRef = firebase.firestore().collection('journee');

        // Déclaration du state
        this.state = {
            selectedDate : new Date(),
            peoples: [],
            presences: []
        }

    }

    componentDidMount() {
        var newPresence = [];
        var that = this;

        this.setState({
            peoples : JSON.parse(localStorage.getItem("peoples"))
        });

        this.journeeRef
        .where("year", "==", this.state.selectedDate.getFullYear())
        .where("month", "==", this.state.selectedDate.getMonth())
        .get()
        .then(function(querySnapshot) {
            if(!querySnapshot.empty)  {
                querySnapshot.forEach(function(doc) {
                    // doc.data() is never undefined for query doc snapshots
                    var currentData = doc.data().presences;

                    newPresence = newPresence.concat(currentData);

                    console.log(doc.id, " => ", doc.data());
                    console.log("currentData=> ", currentData);

                    console.log("Presences => ", newPresence);

                    that.setState({
                        presences : newPresence
                    });

                });
            }
        });

    }

    handleDateChange = date => {

        var that = this;
        var newPresence = [];

        console.log("SearchDate => ", Math.round((date).getTime() / 1000));

        this.journeeRef
        .where("year", "==", date.getFullYear())
        .where("month", "==", date.getMonth())
        .get()
        .then(function(querySnapshot) {
            if(!querySnapshot.empty)  {
                querySnapshot.forEach(function(doc) {
                    // doc.data() is never undefined for query doc snapshots
                    var currentData = doc.data().presences;

                    newPresence.concat(currentData);

                    console.log(doc.id, " => ", doc.data());

                    console.log("Presences => ", newPresence);

                    that.setState({
                        presences : newPresence
                    });

                });
            }
        });

        this.setState({
            selectedDate : date,
            presences : newPresence
        });
    }


    getDaysInMonth(refDate) {
        return (new Array(31)).fill('')
            .map((v,i)=>new Date(refDate.getFullYear(),refDate.getMonth(),i+1))
            .filter(v=>v.getMonth()===refDate.getMonth())
    }


    displayFormatedTime(date) {
        var dateToFormat = new Date(date.seconds*1000)
        return dateToFormat.getHours() + ":" + dateToFormat.getMinutes().toString().padStart(2,0);
    }


    displayTotal(totalResult) {
        return <p>Repas&nbsp;:&nbsp;{totalResult.totalRepas}<br />
               Matin&nbsp;:&nbsp;{totalResult.totalMatin}&nbsp;min.<br />
               Soir&nbsp;:&nbsp;{totalResult.totalSoir}&nbsp;min.<br /></p>;
    }

    isUnworkedDay(date) {
        switch (date.getDay()) {
          case 0:
          case 3:
          case 6:
            return "table-secondary";
          default:
            break;
        }
    }

    render() {
        return (
            <div style={{marginTop: 10}}>
                <h3>Rapport Mensuel</h3>

                <div style={{marginTop: 10}}>
                    <h4>Filtres</h4>
                    <form onSubmit={this.onSubmit}>
                        <div className="form-group">
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                disableToolbar
                                variant="inline"
                                format="MM/yyyy"
                                margin="normal"
                                id="date-picker-inline"
                                label="Date"
                                autoOk="true"
                                value={this.state.selectedDate}
                                onChange={this.handleDateChange}
                                KeyboardButtonProps={{
                                'aria-label': 'change date',
                                }}
                                views={["year", "month"]}
                                minDate="2019-08-31"
                                />
                            </MuiPickersUtilsProvider>
                        </div>
                    </form>
                </div>

                <table className="table table-striped">
                <thead>
                     <tr>
                         <th>Elève</th>
                         {(this.getDaysInMonth(this.state.selectedDate)).map((dayInMonth) => (
                            <th className={this.isUnworkedDay(dayInMonth)} key={dayInMonth.getTime()}>{dayInMonth.getDate()}</th>
                         ))}
                         <th>Total</th>
                     </tr>
                </thead>
                <tbody>

                    {this.state.peoples.map((people) => (
                         <tr key={people.id}>
                            <td>{people.fullname}</td>
                            {(this.getDaysInMonth(this.state.selectedDate)).map((dayInMonth) => (
                                     <td className={this.isUnworkedDay(dayInMonth)} key={dayInMonth.getTime()}>{this.state.presences
                                        .filter((presence) => (people.id === presence.personId))
                                        .filter((presence) => (dayInMonth.getFullYear() === new Date(presence.presenceDay.seconds*1000).getFullYear()
                                                                && dayInMonth.getMonth() === new Date(presence.presenceDay.seconds*1000).getMonth()
                                                                && dayInMonth.getDate() === new Date(presence.presenceDay.seconds*1000).getDate()
                                                                ))
                                        .map((presence) => (
                                                <p key={people.id + presence.presenceDay.seconds}>
                                                    {presence.arrival ? (this.displayFormatedTime(presence.arrival)) : ("-")}-{presence.departure ? (this.displayFormatedTime(presence.departure)) : ("-")}
                                                    <br />{presence.hasMeal ? ("Avec Repas") : ("Sans Repas")}

                                                    <br /><Link to={'/presence/update/' + getDayId(dayInMonth) + '/' + people.id} className="nav-link">MàJ</Link>
                                                </p>
                                            )
                                        )}
                                     </td>
                            ))}
                            <td>{
                                this.displayTotal(
                                    this.state.presences
                                    .filter((presence) => (people.id === presence.personId))
                                    .filter((presence) => (this.state.selectedDate.getFullYear() === new Date(presence.presenceDay.seconds*1000).getFullYear()
                                                            && this.state.selectedDate.getMonth() === new Date(presence.presenceDay.seconds*1000).getMonth()))
                                    .reduce(function(currentSum, presence)
                                            {
                                                // Somme nombre de repas
                                                if (presence.hasMeal) {
                                                    currentSum.totalRepas = currentSum.totalRepas + 1;
                                                }

                                                // Somme heures du matin
                                                var baseMorning = new Date(presence.arrival.seconds*1000);
                                                var effectiveArrival = new Date(presence.arrival.seconds*1000);

                                                baseMorning.setHours(global.baseMorningHour);
                                                baseMorning.setMinutes(global.baseMorningMinute);
                                                baseMorning.setSeconds(0);
                                                baseMorning.setMilliseconds(0);


                                                if(effectiveArrival < baseMorning) {
                                                    currentSum.totalMatin = currentSum.totalMatin + ((baseMorning - effectiveArrival)/60000);
                                                }

                                                // Somme heures du soir
                                                var baseEvening = new Date(presence.departure.seconds*1000);
                                                var effectiveLeave = new Date(presence.departure.seconds*1000);

                                                baseEvening.setHours(global.baseEveningHour);
                                                baseEvening.setMinutes(global.baseEveningMinute);
                                                baseEvening.setSeconds(0);
                                                baseEvening.setMilliseconds(0);

                                                if(baseEvening < effectiveLeave) {
                                                    currentSum.totalSoir = currentSum.totalSoir + ((effectiveLeave - baseEvening)/60000);
                                                }

                                                return currentSum;
                                            }, {
                                                   totalRepas: 0,
                                                   totalMatin: 0,
                                                   totalSoir:  0
                                               }
                                    )
                                )
                            }</td>
                         </tr>
                    ))}

                </tbody>
                </table>

            </div>
        )
    }
 };


export default ReportPresence