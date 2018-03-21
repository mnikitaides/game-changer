import React from 'react';
import Hitting from './Hitting';
import Pitching from './Pitching';
import 'react-table/react-table.css'
import {Tabs, Tab} from 'material-ui/Tabs';

class Team extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div>
        <Tabs>
          <Tab label="Hitting" >
            <Hitting team={this.props.team} showExhibition={this.props.indcludeExhibition}/>
          </Tab>
          <Tab label="Pitching">
            <Pitching team={this.props.team} showExhibition={this.props.indcludeExhibition}/>
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default Team;
