import React from 'react';
import StatisticsUtil from '../utils/StatisticsUtil';
import ReactTable from 'react-table';
import _ from "lodash";
import 'react-table/react-table.css'

export default class Pitching extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  sortNumbers(a, b, desc) {
    a = parseFloat(a);
    b = parseFloat(b);
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  }

  totalInningsPitched(stats) {
    const outs = _.sum(_.map(stats, stat => stat.OUTS));
    return Math.floor(outs / 3) + "." + (outs % 3);
  }

  totalKPercentage(stats) {
    const strikes = _.sum(_.map(stats, stat => stat.strikes));
    const balls = _.sum(_.map(stats, stat => stat.balls));
    return ((parseInt(strikes, 10) / (parseInt(strikes, 10) + parseInt(balls, 10))) * 100).toFixed(2);
  }

  totalEra(stats) {
    const er = _.sum(_.map(stats, stat => stat.ER));
    const outs = _.sum(_.map(stats, stat => stat.OUTS));
    return parseFloat((er * 3 * 7) / outs).toFixed(2);
  }

  totalWhip(stats) {
    const bb = _.sum(_.map(stats, stat => stat.BB));
    const h = _.sum(_.map(stats, stat => stat.H));
    const outs = _.sum(_.map(stats, stat => stat.OUTS));
    return parseFloat((bb + h) / (outs / 3)).toFixed(2)
  }

  getPitchingStats() {
    if(this.props.team) {
      let stats = new StatisticsUtil(this.props.team);
      let pitchingStats = stats.getPitchingStats(this.props.showExhibition);

      const columns = [
        {Header: 'PG', id: 'pg', accessor: 'name', width: 35,  Cell: props => <a href={"https://perfectgame.org/search.aspx?search=" + props.value} target="_blank"><img src={'./pg.png'} alt=""/></a>},
        {Header: 'Pitcher', accessor: 'name', width: 200},
        {Header: 'IP', id: 'ip', accessor: d => Math.floor(d.OUTS / 3) + "." + (d.OUTS % 3), width: 45, sortMethod: this.sortNumbers, Footer: this.totalInningsPitched(pitchingStats)},
        {Header: 'BF', accessor: 'BF', width: 40, Footer:_.sum(_.map(pitchingStats, stat => stat.BF))},
        {Header: 'H', accessor: 'H', width: 40, Footer:_.sum(_.map(pitchingStats, stat => stat.H)) },
        {Header: 'R', accessor: 'R', width: 40, Footer:_.sum(_.map(pitchingStats, stat => stat.R))},
        {Header: 'ER', accessor: 'ER', width: 40, Footer:_.sum(_.map(pitchingStats, stat => stat.ER))},
        {Header: 'BB', accessor: 'BB', width: 40, Footer:_.sum(_.map(pitchingStats, stat => stat.BB))},
        {Header: 'SO', accessor: 'SO', width: 40, Footer:_.sum(_.map(pitchingStats, stat => stat.SO))},
        {Header: 'HR', accessor: 'HR', width: 40, Footer:_.sum(_.map(pitchingStats, stat => stat.HR))},
        {Header: 'strikes', accessor: 'strikes', width: 60, Footer:_.sum(_.map(pitchingStats, stat => stat.strikes))},
        {Header: 'balls', accessor: 'balls', width: 45, Footer:_.sum(_.map(pitchingStats, stat => stat.balls))},
        {Header: 'K%', id: 'k%', accessor: d => ((parseInt(d.strikes, 10) / (parseInt(d.strikes, 10) + parseInt(d.balls, 10))) * 100).toFixed(2), width: 55, Footer: this.totalKPercentage(pitchingStats)},
        {Header: 'ERA', id: 'era', accessor: d => parseFloat((d.ER * 3 * 7) / d.OUTS).toFixed(2), width: 55, sortMethod: this.sortNumbers, Footer: this.totalEra(pitchingStats)},
        {Header: 'WHIP', id: 'whip', accessor: d => parseFloat((d.BB + d.H) / (d.OUTS / 3)).toFixed(2), width: 55, sortMethod: this.sortNumbers, Footer: this.totalWhip(pitchingStats)},
        {Header: 'HBP', accessor: 'HBP', width: 45, Footer:_.sum(_.map(pitchingStats, stat => stat.HBP))},
        {Header: 'WP', accessor: 'WP', width: 40, Footer:_.sum(_.map(pitchingStats, stat => stat.WP))},
        {Header: 'GO', accessor: 'GO', width: 40, Footer:_.sum(_.map(pitchingStats, stat => stat.GO))},
        {Header: 'FO', accessor: 'FO', width: 40, Footer:_.sum(_.map(pitchingStats, stat => stat.FO))},
      ];

      return (
        <div>
          <ReactTable
            data={pitchingStats}
            columns={columns}
            defaultSorted={[{id: "era", desc: false}]}
            className="-striped -highlight"
            style={{color: "#6e6e6e"}}
            showPagination={false}
            minRows={0}
            defaultPageSize={100}
          />
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        {this.getPitchingStats()}
      </div>
    );
  }
}
