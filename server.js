const express = require('express');
const NeuralNet = require('./NeuralNet');
const port = process.env.PORT || 1337;

const app = express();

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
  // start application
  NeuralNet.loadMobileNet();
});

app.get('/hi', (req, res) => {
  // console.log('yo');
  console.log(req.body.hi);
  // let user = req.body.user;
  // let password = req.body.password;

  // console.log(user, password);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))