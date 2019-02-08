import React from 'react';
// import Dialog from 'material-ui/Dialog';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
// import RaisedButton from 'material-ui/RaisedButton';
// import FlatButton from 'material-ui/FlatButton';
// import TextField from 'material-ui/TextField';
import TextField from '@material-ui/core/TextField';
// import LinearProgress from 'material-ui/LinearProgress';
import LinearProgress from '@material-ui/core/LinearProgress';

export default class LoadTeamButton extends React.Component {

  state = {
    open: false,
    url: '',
    showLoading: false
  };

  handleOpen = () => {
    this.setState({open: true, showLoading: false, url: ''});
  };

  handleClose = () => {
    this.setState({open: false});
  };

  handleSubmit = () => {
    this.setState({showLoading: true});

    let serverUrl = "/team?url=" + this.state.url;
    fetch(serverUrl)
      .then(res => res.json())
      .then((response) => {
        this.props.handler(response);
        this.handleClose();
      })
      .catch(error => console.error('Error:', error));
  };

  handleTextEntered = (event, newValue) => {
    this.setState({url: newValue});
  };

  render() {
    const actions = [
      <Button
        variant="text"
        label="Cancel"
        primary="true"
        onClick={this.handleClose}
      />,
      <Button
        variant="text"
        label="Submit"
        primary="true"
        disabled={this.state.url === ''}
        onClick={this.handleSubmit}
      />,
    ];

    let loading, textField = null;
    if(this.state.showLoading) {
      loading = <LinearProgress mode="indeterminate" />
    } else {
      textField = <TextField floatingLabelText="Enter Game Changer URL for team" onChange={this.handleTextEntered}/>
    }

    return (
      <div className="load-button">
        <Button variant="contained" primary="true" onClick={this.handleOpen}>Load Team</Button>
        <Dialog
          title={this.state.showLoading ? "Loading..." : "Load Team"}
          actions={actions}
          modal={true}
          open={this.state.open}>

          {textField}
          {loading}
        </Dialog>
      </div>
    );
  }
}
