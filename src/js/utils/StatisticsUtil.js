export default class StatisticsUtil {
  constructor(team) {
    this.team = team;
  }

  getHittingStats(includeExhibition) {
    let hittingStats = [];
    Object.values(this.team.games).forEach(function(game) {
      if(game.batting && this.includeGame(game, includeExhibition)) {
        Object.values(game.batting).forEach(function(batter) {
          let stat = this.findStatByName(hittingStats, batter);
          if(!stat) {
            stat = this.createNewBatterStat(batter);
            hittingStats.push(stat);
          }
          stat.AB = batter.AB ? stat.AB + batter.AB : stat.AB;
          stat.H = batter.H ? stat.H + batter.H : stat.H;
          stat["1B"] = this.getSingles(batter) ? stat["1B"] + this.getSingles(batter) : stat["1B"];
          stat["2B"] = batter["2B"] ? stat["2B"] + batter["2B"] : stat["2B"];
          stat["3B"] = batter["3B"] ? stat["3B"] + batter["3B"] : stat["3B"];
          stat.HR = batter.HR ? stat.HR + batter.HR : stat.HR;
          stat.RBI = batter.RBI ? stat.RBI + batter.RBI : stat.RBI;
          stat.R = batter.R ? stat.R + batter.R : stat.R;
          stat.HBP = batter.HBP ? stat.HBP + batter.HBP : stat.HBP;
          stat.SF = batter.SF ? stat.SF + batter.SF : stat.SF;
          stat.SAC = batter.SAC ? stat.SAC + batter.SAC : stat.SAC;
          stat.BB = batter.BB ? stat.BB + batter.BB : stat.BB;
          stat.K = batter.K ? stat.K + batter.K : stat.K;
          stat.ROE = batter.ROE ? stat.ROE + batter.ROE : stat.ROE;
          stat.PIK = batter.PIK ? stat.PIK + batter.PIK : stat.PIK;
          stat.SB = batter.SB ? stat.SB + batter.SB : stat.SB;
          stat.CS = batter.CS ? stat.CS + batter.CS : stat.CS;
        }.bind(this));
      }
    }.bind(this));
    return hittingStats;
  }

  includeGame(game, includeExhibition) {
    return game.type !== 'Exhibition Game' || includeExhibition;
  }

  findStatByName(stats, player) {
    let stat = null;
    stats.forEach(function(aStat) {
      if(aStat.name === player.name) {
        stat = aStat;
      }
    });
    return stat;
  }

  createNewBatterStat(batter) {
    let stat = {
      name: batter.name,
      AB: 0,
      H: 0,
      HR: 0,
      RBI: 0,
      R: 0,
      HBP: 0,
      SF: 0,
      SAC: 0,
      BB: 0,
      K: 0,
      ROE: 0,
      PIK: 0,
      SB: 0,
      CS: 0
    };
    stat["1B"] = 0;
    stat["2B"] = 0;
    stat["3B"] = 0;
    return stat;
  }

  getSingles(batter) {
    let singles = batter.H;
    if(batter["2B"]) {
      singles = singles - batter["2B"];
    }
    if(batter["3B"]) {
      singles = singles - batter["3B"];
    }
    if(batter["HR"]) {
      singles = singles - batter["HR"];
    }
    return singles
  }

  getPitchingStats(includeExhibition) {
    let pitchingStats = [];
    Object.values(this.team.games).forEach(function(game) {
      if(game.pitching && this.includeGame(game, includeExhibition)) {
        Object.values(game.pitching).forEach(function(pitcher) {
          let stat = this.findStatByName(pitchingStats, pitcher);
          if(!stat) {
            stat = this.createNewPitcherStat(pitcher);
            pitchingStats.push(stat);
          }
          let pitches = parseInt(pitcher["Pitches-Strikes"].split("-")[0], 10);
          let strikes = parseInt(pitcher["Pitches-Strikes"].split("-")[1], 10);
          stat.OUTS = stat.OUTS + this.getOuts(pitcher);
          stat.BF = stat.BF + parseInt(pitcher["First pitch strikes-Batters faced"].split("-")[1], 10);
          stat.FPS = stat.FPS + parseInt(pitcher["First pitch strikes-Batters faced"].split("-")[0], 10);
          stat.H = pitcher.H ? stat.H + pitcher.H : stat.H;
          stat.R = pitcher.R ? stat.R + pitcher.R : stat.R;
          stat.ER = pitcher.ER ? stat.ER + pitcher.ER : stat.ER;
          stat.BB = pitcher.BB ? stat.BB + pitcher.BB : stat.BB;
          stat.SO = pitcher.K ? stat.SO + pitcher.K : stat.SO;
          stat.HR = pitcher.HR ? stat.HR + pitcher.HR : stat.HR;
          stat.strikes = stat.strikes + strikes;
          stat.balls = stat.balls + (pitches - strikes);
          stat.GO = stat.GO + parseInt(pitcher["Groundouts-Flyouts"].split("-")[0], 10);
          stat.FO = stat.FO + parseInt(pitcher["Groundouts-Flyouts"].split("-")[1], 10);
          stat.HBP = pitcher.HBP ? stat.HBP + pitcher.HBP : stat.HBP;
          stat.WP = pitcher.WP ? stat.WP + pitcher.WP : stat.WP;
        }.bind(this));
      }
    }.bind(this));
    return pitchingStats.filter(pitcher => pitcher.BF > 0);
  }

  createNewPitcherStat(pitcher) {
    return {
      name: pitcher.name,
      OUTS: 0,
      BF: 0,
      FPS: 0,
      H: 0,
      R: 0,
      ER: 0,
      BB: 0,
      SO: 0,
      HR: 0,
      strikes: 0,
      balls: 0,
      GO: 0,
      FO: 0,
      HBP: 0,
      WP: 0
    }
  }

  getOuts(pitcher) {
    let outs = 0;
    if(pitcher.IP) {
      outs = (Math.floor(pitcher.IP) * 3) + (Math.round( (pitcher.IP % 1) * 10 ));
    }
    return outs;
  }

}