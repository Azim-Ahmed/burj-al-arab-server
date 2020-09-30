const express = require('express')
const bodyParser = require('body-parser')
var admin = require("firebase-admin"); 
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

// console.log(process.env.DB_PASS);

const cors = require('cors')

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.02jxk.mongodb.net/burjAlArab?retryWrites=true&w=majority`;

const app = express()
app.use(cors())
app.use(bodyParser.json())

//firebase cod from services settings

var serviceAccount = require("./config/burj-al-arab-react-auth-firebase-adminsdk-odnm0-fc0709d086.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB
});




const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true });
client.connect(err => { 
  const bookingsCollection = client.db("burjAlArab").collection("bookings");
  app.post('/addBooking', (req,res) => {
      const newBooking = req.body;
      bookingsCollection.insertOne(newBooking)
      .then(result => {
          res.send(result.insertedCount > 0)
          //console.log(result);
      })
      //console.log(newBooking);
  })
  app.get('/bookings', (req,res) => {
const bearer = req.headers.authorization;
    if(bearer){
    const idToken = bearer.split(' ')[1]
    admin.auth().verifyIdToken(idToken)
    .then(function(decodedToken) {
    const tokenEmail = decodedToken.email;
    const userEmail = req.query.email;
    //console.log(tokenEmail, userEmail);
    if(tokenEmail === userEmail) {
        bookingsCollection.find({email : userEmail})
    .toArray((err, documents) => {
        res.send(documents)
    })
        
    }
    else{
        res.status(401).send('Unauthorized Response')
    }
    
    }).catch(function(error) {
        res.status(401).send('Unauthorized Response')
    });
}
else{
    res.status(401).send('Unauthorized Response')
}

  })


  // perform actions on the collection object
//   console.log("data base Connected Successfully");
//   client.close();
});



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(4000)