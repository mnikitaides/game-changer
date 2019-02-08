import React from 'react';
import './App.css';
import TeamSelector from './js/components/TeamSelector';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
// import getMuiTheme from 'material-ui/styles/getMuiTheme';
// import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
  },
});

class App extends React.Component {

  render() {
    return (
      <div className="App">
        <MuiThemeProvider theme={theme}>
          <TeamSelector/>
        </MuiThemeProvider>
      </div>
    );
  }
}

export default App;
