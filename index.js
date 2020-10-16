const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const ObjectId = require('mongodb').ObjectID;

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
  const reviews = client.db("creativeAgency").collection("reviews");
  const admins = client.db("creativeAgency").collection("admins");

  app.post('/addAdmin', (req, res) => {
    const admin = req.body;
    admins.insertOne(admin)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  });

  app.post('/addReview', (req, res) => {
    const review = req.body;
    reviews.insertOne(review)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  });

  app.get('/allReviews', (req, res) => {
    reviews.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  app.post('/addOrder', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const serviceName = req.body.serviceName;
    const details = req.body.details;
    const price = req.body.price;
    const icon = req.body.icon;
    const status = req.body.status;
    const newImg = req.files.file.data;
    const encodedImg = newImg.toString('base64');
    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encodedImg, 'base64')
    }
    orders.insertOne({ name, email, serviceName, details, price, image, icon, status })
      .then(result => {
        res.send(result.insetedCount > 0)
      })
  });

  app.get('/orders', (req, res) => {
    orders.find({ email: req.query.email })
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
    const newImg = req.files.file.data;
    const encodedImg = newImg.toString('base64');
    const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encodedImg, 'base64')
    }
    serviceCollection.insertOne({ title, details, image })
      .then(result => {
        res.send(result.insetedCount > 0)
      })
  });

  app.get('/services', (req, res) => {
    serviceCollection.find({})
      .toArray((err, docs) => res.send(docs));
  });


  app.patch('/update/:id', (req, res) => {
    orders.updateOne({_id: ObjectId(req.params.id)},
    {
      $set: { status: req.body.status }
    })
    .then(result => res.send(result.modifiedCount > 0))
});

  console.log('DB connected');
});





app.get('/', (req, res) => {
  res.send('Hello Creative Agency')
});

app.listen(process.env.PORT || port, () => {
  console.log('connected');
});
