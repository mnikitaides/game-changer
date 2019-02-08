import React from 'react';
import firebase from 'firebase';
// import SelectField from 'material-ui/SelectField';
// import MenuItem from 'material-ui/MenuItem';
// import Checkbox from 'material-ui/Checkbox';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import LinearProgress from '@material-ui/core/LinearProgress';
// import Dialog from 'material-ui/Dialog';
// import LinearProgress from 'material-ui/LinearProgress';
import LoadTeamButton from './LoadTeamButton';
import Team from './Team';

import AutoRenewIcon from '@material-ui/icons/Autorenew';
import teal500 from '@material-ui/core/colors/teal';
// import IconButton from 'material-ui/IconButton';
import IconButton from '@material-ui/core/IconButton';

const styles = {
  checkbox: {
    // marginBottom: 16,
    // display: 'inline-block'
  },
  iconButton: {
    marginTop: 25
  },
  formControl: {
    margin: '10px',
    minWidth: 120,
  }
};

export default class TeamSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      indcludeExhibition: false,
      loading: false,
      selectedTeam: ''
    };
    this.handleChange = this.handleChange.bind(this);
    this.loadTeams();
  }

  loadTeams() {
    firebase.initializeApp({
      databaseURL: 'https://baseball-stats-9f76f.firebaseio.com/'
    });
    let database = firebase.database();
    database.ref().once('value')
      .then(function(data) {
        console.log(data.toJSON());
        this.setState( {teams: data.toJSON()} );
      }.bind(this));
  }

  handleChange(event, index, team) {
    this.setState({selectedTeam: team});
  }

  handleTeamLoaded(team) {
    if(team) {
      let teams = this.state.teams;
      teams[team.name] = team;
      this.setState({
        teams: teams,
        selectedTeam: team.name,
        loading: false
      });
    }
  }

  handleReloadTeam() {
    this.setState({loading: true});
    let team = this.state.teams[this.state.selectedTeam];
    let serverUrl = "/team?url=" + team.url;
    fetch(serverUrl)
      .then(res => res.json())
      .then((response) => {
        this.handleTeamLoaded(response);
      })
      .catch(error => {
        console.error('Error:', error);
        this.setState({loading: false});
      });
  }

  handleIndcludeExhibition() {
    this.setState({indcludeExhibition: !this.state.indcludeExhibition});
  }

  render() {
    let teams = null;
    if(this.state.teams) {
      teams = (
        <div className="team-selector">
          <div className="select-field">
          <FormControl style={styles.formControl}>
            <InputLabel htmlFor="teams">Teams</InputLabel>
            <Select
              fullWidth={true}
              value={this.state.selectedTeam}
              inputProps={{
                id: 'teams',
              }}
              onChange={this.handleChange}>

              {Object.values(this.state.teams).map((team, index) =>
                <MenuItem value={team.name} key={team.name}>{team.name}</MenuItem>
              )}
            </Select>
            </FormControl>
            {/* <IconButton disabled={!this.state.selectedTeam} style={styles.iconButton} onClick={this.handleReloadTeam.bind(this)}> */}
              {/* <AutoRenewIcon style={{marginRight: "24px"}} color={teal500} /> */}
            {/* </IconButton> */}
          </div>
          <FormControlLabel
            control={
              <Checkbox
                checked={this.state.indcludeExhibition}
                onChange={this.handleIndcludeExhibition.bind(this)}
                className=".exhibition-field"
                style={styles.checkbox}
              />
            }
            label="Include Exhibition Games"
          />
          
          <LoadTeamButton teams={this.state.teams} handler={this.handleTeamLoaded.bind(this)} />
        </div>
      )
    }
    let team = this.state.selectedTeam ? this.state.teams[this.state.selectedTeam] : null;

    return (
      <div>
        {teams}
        <Team team={team} indcludeExhibition={this.state.indcludeExhibition}/>
        <Dialog
          title={"Loading..."}
          modal={true}
          open={this.state.loading}>
          <LinearProgress mode="indeterminate" />
        </Dialog>
      </div>
    );
  }
}
