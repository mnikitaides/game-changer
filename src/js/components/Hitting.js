import React from 'react';
import StatisticsUtil from '../utils/StatisticsUtil';
import ReactTable from 'react-table'
import _ from "lodash";
import 'react-table/react-table.css'

export default class Hitting extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getObs(hitter) {
    let pa = hitter.AB + hitter.HBP + hitter.SF + hitter.SAC + hitter.BB;
    return (hitter.H + hitter.BB + hitter.HBP) > 0 ? ((hitter.H + hitter.BB + hitter.HBP) / pa).toFixed(3) : 0;
  }

  totalObs(stats) {
    let reached = _.sum(_.map(stats, stat => stat.H + stat.BB + stat.HBP));
    let pa = _.sum(_.map(stats, stat => stat.AB + stat.HBP + stat.SF + stat.SAC + stat.BB));
    return  (reached / pa).toFixed(3);
  }

  getSlugging(hitter) {
    let totalBases = (hitter["1B"] + (2*hitter["2B"]) + (3*hitter["3B"]) + (4*hitter["HR"]));
    return totalBases > 0 ? (totalBases / hitter.AB).toFixed(3) : 0;
  }

  totalSlugging(stats) {
    let totalBases = _.sum(_.map(stats, stat => stat["1B"] + (2*stat["2B"]) + (3*stat["3B"]) + (4*stat["HR"])));
    let ab = _.sum(_.map(stats, stat => stat.AB));
    return (totalBases / ab).toFixed(3);
  }

  totalAverage(stats) {
    const hits = _.sum(_.map(stats, stat => stat.H));
    const ab = _.sum(_.map(stats, stat => stat.AB));
    return (hits / ab).toFixed(3);
  }

  totalPlateAppearances(stats) {
    return _.sum(_.map(stats, stat => stat.AB + stat.HBP + stat.SF + stat.SAC + stat.BB));
  }

  getHittingStats() {
    if(this.props.team) {
      let stats = new StatisticsUtil(this.props.team);
      let hittingStats = stats.getHittingStats(this.props.showExhibition);

      const columns = [
        {Header: 'PG', id: 'pg', accessor: 'name', width: 35,  Cell: props => <a href={"https://perfectgame.org/search.aspx?search=" + props.value} target="_blank"><img src={'./pg.png'} alt=""/></a>},
        {Header: 'Batter', id: 'batter', accessor: 'name', width: 200},
        {Header: 'PA', id: 'pa', accessor: d => d.AB + d.HBP + d.SF + d.SAC + d.BB, width: 40, Footer: this.totalPlateAppearances(hittingStats)},
        {Header: 'AB', accessor: 'AB', width: 40, Footer:_.sum(_.map(hittingStats, stat => stat.AB))},
        {Header: 'AVG', id: 'avg', accessor: d => d.H > 0 ? (d.H / d.AB).toFixed(3) : "0.000", width: 60, Footer: this.totalAverage(hittingStats)},
        {Header: 'OBS', id: 'obs', accessor: d => this.getObs(d), width: 60, Footer: this.totalObs(hittingStats)},
        {Header: 'SLG', id: 'slg', accessor: d => this.getSlugging(d), width: 60, Footer: this.totalSlugging(hittingStats)},
        {Header: 'H', accessor: 'H', width: 40, Footer:_.sum(_.map(hittingStats, stat => stat.H))},
        {Header: '1B', accessor: '1B', width: 35, Footer:_.sum(_.map(hittingStats, stat => stat['1B']))},
        {Header: '2B', accessor: '2B', width: 35, Footer:_.sum(_.map(hittingStats, stat => stat['2B']))},
        {Header: '3B', accessor: '3B', width: 35, Footer:_.sum(_.map(hittingStats, stat => stat['3B']))},
        {Header: 'HR', accessor: 'HR', width: 35, Footer:_.sum(_.map(hittingStats, stat => stat.HR))},
        {Header: 'RBI', accessor: 'RBI', width: 40, Footer:_.sum(_.map(hittingStats, stat => stat.RBI))},
        {Header: 'R', accessor: 'R', width: 40, Footer:_.sum(_.map(hittingStats, stat => stat.R))},
        {Header: 'HBP', accessor: 'HBP', width: 45, Footer:_.sum(_.map(hittingStats, stat => stat.HBP))},
        {Header: 'ROE', accessor: 'ROE', width: 47, Footer:_.sum(_.map(hittingStats, stat => stat.ROE))},
        {Header: 'BB', accessor: 'BB', width: 35, Footer:_.sum(_.map(hittingStats, stat => stat.BB))},
        {Header: 'K', accessor: 'K', width: 30, Footer:_.sum(_.map(hittingStats, stat => stat.K))},
        {Header: 'SB', accessor: 'SB', width: 35, Footer:_.sum(_.map(hittingStats, stat => stat.SB))},
        {Header: 'CS', accessor: 'CS', width: 35, Footer:_.sum(_.map(hittingStats, stat => stat.CS))},
        {Header: 'PIK', accessor: 'PIK', width: 40, Footer:_.sum(_.map(hittingStats, stat => stat.PIK))},
        {Header: 'SAC', accessor: 'SAC', width: 45, Footer:_.sum(_.map(hittingStats, stat => stat.SAC))},
        {Header: 'SF', accessor: 'SF', width: 35, Footer:_.sum(_.map(hittingStats, stat => stat.SF))}
      ];

      return (
        <div>
          <ReactTable
            data={hittingStats}
            columns={columns}
            defaultSorted={[{id: "avg", desc: true}]}
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
        {this.getHittingStats()}
      </div>
    );
  }
}
