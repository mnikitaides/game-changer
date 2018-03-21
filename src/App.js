import React from 'react';
import './App.css';
import TeamSelector from './js/components/TeamSelector';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';

class App extends React.Component {

  render() {
    return (
      <div className="App">
        <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
          <TeamSelector/>
        </MuiThemeProvider>
      </div>
    );
  }

  responseGoogle = (response) => {
    console.log(response);
  }
}

export default App;
