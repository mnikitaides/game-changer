import React from 'react';
import Hitting from './Hitting';
import Pitching from './Pitching';
import 'react-table/react-table.css'
// import {Tabs, Tab} from 'material-ui/Tabs';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';

class Team extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0
    };
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { value } = this.state;
    let hitting = <Hitting team={this.props.team} showExhibition={this.props.indcludeExhibition}/>;
    let pitching = <Pitching team={this.props.team} showExhibition={this.props.indcludeExhibition}/>;
    return (
      <div>
        <Tabs value={value} onChange={this.handleChange}>
          <Tab label="Hitting" />
          <Tab label="Pitching" />
        </Tabs>
        {value === 0 && hitting}
        {value === 1 && pitching}
      </div>
    );
  }
}

export default Team;
