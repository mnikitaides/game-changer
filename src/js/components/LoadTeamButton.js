import React from 'react';
import Dialog from 'material-ui/Dialog';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import LinearProgress from 'material-ui/LinearProgress';

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
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
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
        <RaisedButton label="Load Team" primary={true} onClick={this.handleOpen}/>
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
