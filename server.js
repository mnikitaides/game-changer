const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
import GameChangerLoaderUtil from './src/js/utils/GameChangerLoaderUtil';

app.use(express.static(path.join(__dirname, 'build')));

app.get('/ping', function (req, res) {
  return res.send('pong');
});

app.get('/team', async function(req, res) {
  let url = req.query.url;
  let teamName = req.query.teamName;
  if(url) {
    console.log(url);
    // todo need to load the firebase database to check if the team already exists (or maybe we just load the team from scratch)
    let user = process.env.GAME_CHANGER_USER;
    let password = process.env.GAME_CHANGER_PASSWORD;
    let util = new GameChangerLoaderUtil(user, password);
    try {
      let team = await util.loadNewTeam(url, teamName);
      res.send(team);
    } catch(err) {
      console.log(err);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(404);
  }
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 8888);