require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const {MongoClient} = require('mongodb');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlparser = require('url')


const client = new MongoClient(process.env.MONGO_URI)
const db = client.db('url_shortner');
const urls = db.collection('urls');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Your first API endpoint


/*
let urlShema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
    },
  short_url: Number

})

let Url = mongoose.model('Url', urlShema);

app.post('/api/shorturl', (req,res) => {
  const original_url = req.body.url;
   short_url = Math.floor(Math.random() * 1000000); // Generate a random short URL
      console.log(req.body)

  res.json(
    {
      original_url: original_url,

      short_url: short_url
    }
    
    
  );
})

*/

  app.post('/api/shorturl', async (req, res) => {
    
    console.log(req.body);
    const url = req.body.url
    const parsedUrl = urlparser.parse(url);

     dns.lookup(parsedUrl.hostname, async (err, address) => {
      if (err || !address) {
        return res.json({ error: 'invalid url' });
      } else{
         const urlCount = await urls.countDocuments({})
         const urlDoc = {url, short_url: urlCount }

         const result = await urls.insertOne(urlDoc);
         console.log(result);
          res.json({
            original_url: url,
            short_url: urlCount
          });
      } 
    });
  })

  app.get('/api/shorturl/:short_url', async (req, res) => {
    const shortUrl = parseInt(req.params.short_url);
    const urlDoc = await urls.findOne({ short_url: shortUrl });
    res.redirect(urlDoc.url)  
  })

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
