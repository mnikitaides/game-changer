import axios from "axios"; // todo replace axios calls with request-promise
import firebase from 'firebase';
import cheerio from 'cheerio';
import rp from 'request-promise';

export default class GameChangerLoaderUtil {
  constructor(user, password) {
    this.user = user;
    this.password = password;
    this.baseUrl = "https://gc.com";

    if (!firebase.apps.length) {
      firebase.initializeApp({
        databaseURL: 'https://baseball-stats-9f76f.firebaseio.com/'
      });
    }
    this.database = firebase.database();
  }

  async loadNewTeam(url, teamName) {
    let year = url.substring(url.indexOf('/t/') + 3, url.length);
    let name = year.substring(year.indexOf('/') + 1, year.lastIndexOf('-'));
    name = name.replace(/-/g, ' ');
    name = name.replace(/\b\w/g, function (l) {
      return l.toUpperCase()
    });
    year = year.substring(year.indexOf('/') - 4, year.indexOf('/'));
    let team = {
      url: url,
      name: year + ' ' + name,
      year: year
    };
    await this.run(team);

    return team;
  }

  async run(team) {
    await this.load(team);
    let success = await this.login();
    if(success) {
      await this.populateGames(team);
    } else {
      console.log("Failed to log in to GameChanger");
    }
  }

  async login() {
    // first get the CSRF token
    let response = await axios.get(this.baseUrl + '/login');
    let $ = cheerio.load(response.data);
    let csrfToken = $('input[name=csrfmiddlewaretoken]').attr('value');

    // post login form
    let options = {
      method: "post",
      url: this.baseUrl + '/do-login',
      formData: {
        "email": this.user,
        "password": this.password,
        "csrfmiddlewaretoken": csrfToken
      },
      headers: {
        "cookie": "csrftoken=" + csrfToken,
        "referer": "https://gc.com/login",
        "Accept": "text/html",
        "origin": "https://gc.com",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36",
        "content-type": "application/x-www-form-urlencoded"
      },
      followRedirect: false,
      followAllRedirects: false,
      simple: false,
      resolveWithFullResponse: true
    };
    try {
      let response = await rp(options);
      let cookies = response.headers['set-cookie'];
      this.sessionCookies = this.getCookies(cookies);
      return this.wasSuccessfulLogin(cookies);
    } catch(error) {
      console.log('Error logging into https://gc.com/do-login');
      console.log(error);
      return false;
    }
  }

  getCookies(cookies) {
    for (let i = 0; i < cookies.length; i++) {
      // We only need the cookie's value - it might have path, expiry time, etc here
      cookies[i] = cookies[i].split( ';' )[0];
    }
    return cookies;
  }

  async load(team) {
    try {
      let data = await this.database.ref().once('value');
      let teams = data.toJSON();

      Object.assign( team, teams[team.name] );
      // firebase doesn't support arrays, so lets fix up our array data
      if(team.games) {
        team.games = Object.values(team.games);
      }
    } catch(err) {
      console.log("************* load() ERROR!!!! ***************");
      console.log(err);
    }
  }

  wasSuccessfulLogin(cookies) {
    let success = false;
    cookies.forEach(function(cookie) {
      if(cookie.indexOf('gcdotcom_sessionid') !== -1) {
        success = true;
      }
    });
    return success;
  }

  setShortName(team, html) {
    let $ = cheerio.load(html);
    let teamName = $('.giganticText').text();
    team.shortName = teamName.substring(0, teamName.indexOf(' '));
  }

  async populateGames(team) {
    try {
      let html = await rp(team.url);
      let $ = cheerio.load(html);
      this.setShortName(team, html);
      if(!team.games) {
        team.games = [];
      }
      let me = this;
      $('.gameLink').each(function(i, elem) {
        if(!team.games[i]) {
          let game = {};
          game.url = me.baseUrl + $(this).attr('href') + '/stats';
          game.opponent = me.getOpponent( $(this) );
          game.type = $(this).parent().parent().children('.lightText').text().trim();
          team.games.push(game);
        }
      });
      this.save(team);

      for(let i = 0; i < team.games.length; i++) {
        let game = team.games[i];
        if (!game.batting) {
          await this.populateGame(game, team);
          this.saveGame(game, team, i);
        }
      }
    } catch(error) {
      console.log(error);
    }
  }

  async populateGame(game, team) {
    let options = {
      "url": game.url,
      "method" : "get",
      "headers": {
        "Cookie": this.sessionCookies.join(';')
      }
    };
    try {
      let html = await rp(options);
      let $ = cheerio.load(html);
      game.dateTime = $('#headerDate').attr('datetime');
      // icontains does a case insensitive search
      let stats = $('h5:icontains(' + team.shortName + ')');
      if(stats.length === 0) {
        // console.log(`Could not find team shortName "${team.shortName}" on the page for game: ${game.url}`);
        // todo figure out how to handle this.  in Google Sheets I prompted the user to enter the team name
        throw new Error(`Could not find team shortName "${team.shortName}" for game: ${game.url}`)
      }

      let me = this;
      stats.each(function(index, element) {
        if( $(this).children('a').attr('href').indexOf('batting') > -1 ) {
          me.populateBatting( $(this).parent().parent().parent(), game, $ );
        }

        if( $(this).children('a').attr('href').indexOf('pitching') > -1 ) {
          me.populatePitching( $(this).parent().parent().parent(), game, $ );
        }
      });
    } catch(error) {
      console.log("Error loading game for: " + game.url);
      console.log(error);
      throw error;
    }
  }

  getOpponent(a) {
    let opponent = a.text();
    if(opponent.indexOf('@') === 0) {
      opponent = opponent.substring(2, opponent.length);
    }
    if(opponent.indexOf('vs') === 0) {
      opponent = opponent.substring(3, opponent.length);
    }

    return opponent;
  }

  save(team) {
    try {
      this.database.ref(team.name).set(team);
    } catch(err) {
      console.log(err);
    }
  }

  saveGame(game, team, index) {
    try {
      this.database.ref(team.name + "/games/" + index).set(game);
    } catch(err) {
      console.log(err);
    }
  }

  populateBatting(div, game, $) {
    // 1. populate lineup section
    let batting = [];
    let lineupOrder = 0;
    let table = div.children().first().next();

    table.find('.playerRow').each(function(index, tr) {
      if( !$(tr).hasClass('fielderOnly') ) {
        let tds = $(this).children();
        let batter = {};
        if(!tds.first().hasClass('pll')) {
          lineupOrder += 1;
        }
        batter.lineupOrder = lineupOrder;
        batter.name = tds.first().text().trim();
        batter.AB = parseInt( tds.first().next().text().trim() );
        batter.R = parseInt( tds.first().next().next().text().trim() );
        batter.H = parseInt( tds.first().next().next().next().text().trim() );
        batter.RBI = parseInt( tds.first().next().next().next().next().text().trim() );
        batter.BB = parseInt( tds.first().next().next().next().next().next().text().trim() );
        batter.K = parseInt( tds.first().next().next().next().next().next().next().text().trim() );

        batting.push(batter);
      }
    });

    // 2. populate batting section
    let fieldset = div.children().first().next().next();
    let statistics = this.getAdditionalStatistics(fieldset, $);
    statistics.forEach(function(statistic) {
      statistic.players.forEach(function(player) {
        let name = player.name;
        batting.forEach(function(batter) {
          if(batter.name === name) {
            batter[statistic.stat] = player.value;
          }
        });
      });
    });

    game.batting = batting;
  }

  populatePitching(div, game, $) {
    // 1. populate main pitching stats
    let pitching = [];
    let table = div.children().first().next();

    table.find('.playerRow').each(function(index, tr) {
      let tds = $(this).children();
      let pitcher = {};
      pitcher.name = tds.first().text().trim();
      pitcher.IP = tds.first().next().text().trim();
      pitcher.Pitches = parseInt( tds.first().next().next().text().trim() );
      pitcher.KPercent = tds.first().next().next().next().text().trim();
      pitcher.H = parseInt( tds.first().next().next().next().next().text().trim() );
      pitcher.R = parseInt( tds.first().next().next().next().next().next().text().trim() );
      pitcher.ER = parseInt( tds.first().next().next().next().next().next().next().text().trim() );
      pitcher.K = parseInt( tds.first().next().next().next().next().next().next().next().text().trim() );
      pitcher.BB = parseInt( tds.first().next().next().next().next().next().next().next().next().text().trim() );
      pitcher.HR = parseInt( tds.first().next().next().next().next().next().next().next().next().next().text().trim() );

      pitching.push(pitcher);
    });

    // 2. populate additional pitching stats
    let fieldset = div.children().first().next().next();
    let statistics = this.getAdditionalStatistics(fieldset, $);
    statistics.forEach(function(statistic) {
      statistic.players.forEach(function(player) {
        let name = player.name;
        pitching.forEach(function(pitcher) {
          if(pitcher.name === name) {
            pitcher[statistic.stat] = player.value;
          }
        });
      });
    });

    game.pitching = pitching;
  }

  getAdditionalStatistics(fieldset, $) {
    // elements and text nodes are children of the fieldset,
    // so have to use a different method to parse it
    let statistics = [];
    let currentStat;

    fieldset.contents().each(function(index, element) {
      // start of a stat
      if( $(this).is('strong') ) {
        let stat = $(this).contents().text();
        currentStat = {
          stat: stat.substring(0, stat.length - 1),
          players: []
        };
      }

      // comma separated list of players as text
      if( !$(this).is('legend') && !$(this).is('strong') && !$(this).is('br') && !$(this).is('span') && $(this).text().trim().length > 0 ) {
        let players = $(this).text().split(',');
        players.forEach(function(player) {
          if( player.trim().length > 0 ) {
            let newPlayer = {
              name: player.trim(),
              value: 1
            };
            currentStat.players.push( newPlayer );
          }
        });
      }

      // the last player had the number in the span for the current stat
      if( $(this).is('span') ) {
        let player = currentStat.players[currentStat.players.length - 1];
        let value = $(this).contents().text();
        player.value = value.indexOf("-") > -1 ? value : parseInt( value );
      }

      // we are done with this stat
      if( $(this).is('br') ) {
        statistics.push(currentStat);
      }
    });

    return statistics;
  }
}