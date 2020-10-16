const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('pictures'));
app.use(fileUpload());


const port = 5500;



const uri = "mongodb+srv://creativeAgencyUser:CreativeAgency11@cluster0.pf9xm.mongodb.net/creativeAgency?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const serviceCollection = client.db("creativeAgency").collection("services");
  const orders = client.db("creativeAgency").collection("orders");

  app.post('/addOrder', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const serviceName = req.body.serviceName;
    const details = req.body.details;
    const price = req.body.price;
    const icon = req.body.icon;
    const filePath = `${__dirname}/pictures/${file.name}`;
    file.mv(filePath, err => {
      if(err){
        console.log(err);
        res.status(500).send({msg: "failed to upload"});
      }
      const newImg = fs.readFileSync(filePath);
      const encodedImg = newImg.toString('base64');
      const image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer(encodedImg, 'base64')
      }
      orders.insertOne({name, email, serviceName, details, price, image, icon})
        .then(result => {
          fs.remove(filePath, error => {
            if(error) {console.log(error)}
            res.send(result.insetedCount > 0)
          })
        })
    })
  });

  app.get('/orders', (req, res) => {
    orders.find({email: req.query.email})
      .toArray((err, docs) => {
        res.send(docs)
      })
  });

  app.get('/allOrders', (req, res) => {
    orders.find({})
      .toArray((err, docs) => {
        res.send(docs)
      })
  });

  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const details = req.body.details;
    const filePath = `${__dirname}/pictures/${file.name}`;
    file.mv(filePath, err => {
      if(err){
        console.log(err);
        res.status(500).send({msg: "failed to upload"});
      }
      const newImg = fs.readFileSync(filePath);
      const encodedImg = newImg.toString('base64');
      const image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer(encodedImg, 'base64')
      }
      serviceCollection.insertOne({title, details, image})
        .then(result => {
          fs.remove(filePath, error => {
            if(error) {console.log(error)}
            res.send(result.insetedCount > 0)
          })
        })
    })
  });

  app.get('/services', (req, res) => {
    serviceCollection.find({})
      .toArray((err, docs) => res.send(docs));
  })

  console.log('DB connected');
});





app.get('/', (req, res) => {
  res.send('Hello Ema-John')
});

app.listen(port, () => {
  console.log('connected');
});
