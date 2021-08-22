const express = require('express');
const md5 = require('md5');
const path = require('path');
require('dotenv').config()

const app = express();
const router = express.Router();
const PORT = process.env.SERVER_PORT || 3333;

router.get('/',async (req, res, next) => {
  const { pwd } = req.query;
  if (pwd === undefined || md5(pwd) !== md5(process.env.APP_PASSWORD)) {
    return res.status(401).send({ error: 'Invalid Password' });
  }
  return next();
});

app.use('/',  [router, express.static(path.join(__dirname + '/build'))]);
app.listen(PORT, () => {
  console.log(`Running at Port ${PORT}`);
});
