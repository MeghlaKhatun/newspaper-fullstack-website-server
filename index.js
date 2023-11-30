const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4mctvfu.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();


    const articleCollection = client.db("NewspaperDB").collection('allArticles')
    const userCollection = client.db("NewspaperDB").collection('user')
    const publisherCollection = client.db("NewspaperDB").collection('publisher')
    const declineCollection = client.db("NewspaperDB").collection('decline')

    //article method
    app.post('/articles', async (req, res) => {
      const addArticles = req.body;
      console.log(addArticles);
      const result = await articleCollection.insertOne(addArticles);
      res.send(result)
    });

    app.get('/articles', async (req, res) => {
      const cursor = articleCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.get("/articles/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectId(id) };
      const result = await articleCollection.findOne(query);
      console.log(result)
      res.send(result)
    })

    app.patch('/articles/viewCount/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const update = { $inc: { viewCount: 1 } };
      try {
        const result = await articleCollection.updateOne(filter, update);
        res.send(result);
      } catch (error) {
        res.status(500).json({ error: 'Error' });
      }
    })

    app.patch('/articles/approve/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
          $set: {
              status: 'Approve',
          }
      };
      const result = await articleCollection.updateOne(filter, updatedDoc);
      res.send(result);
  });

    app.patch('/articles/premium/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
          $set: {
              premium: 'Premium',
          }
      };
      const result = await articleCollection.updateOne(filter, updatedDoc);
      res.send(result);
  });

  app.put("/articles/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updateArticles=req.body;

    const article = {
      $set: {
        authorName: updateArticles.authorName,
        image: updateArticles.image,
        authorEmail: updateArticles.authorEmail,
        tag: updateArticles.tag,
        title: updateArticles.title,
        authorProfile: updateArticles.authorProfile,
        description:updateArticles.description,
        date:updateArticles.date,
        publisher:updateArticles.publisher,
      }
    }

    const result =await articleCollection.updateOne(filter,article,options)
    res.send(result)

  })

  app.delete('/articles/:id', async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await articleCollection.deleteOne(query);
    res.send(result);
  })


    //users method
    app.post('/user', async (req, res) => {
      const addUser = req.body;

      const query = { email: addUser?.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null })
      }


      const result = await userCollection.insertOne(addUser);
      res.send(result)
    });

    app.patch('/user/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result);
    })

    app.get('/user/admin/:email', async (req, res) => {
      const email = req.params.email;

      const query = { email: email };
      const user = await userCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === 'admin';
      }
      res.send({ admin });
    })


    app.put("/user/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateUser=req.body;

      const user = {
        $set: {
          name: updateUser.name,
          photo: updateUser.photo,
          email: updateUser.email,
        }
      }

      const result =await userCollection.updateOne(filter,user,options)
      res.send(result)

    })

    app.get('/user', async (req, res) => {
      const cursor = userCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    app.delete('/user/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query);
      res.send(result);
    })



    //publisher
    app.post('/publisher', async (req, res) => {
      const addPublisher = req.body;
      console.log(addPublisher);
      const result = await publisherCollection.insertOne(addPublisher);
      res.send(result)
    });

    app.get('/publisher', async (req, res) => {
      const cursor = publisherCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })

    //Decline 
    app.post('/decline',async(req,res)=>{
      const decline=req.body;
      console.log(decline);
      const result = await declineCollection.insertOne(decline);
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Newspaper fullstack website is running')
})

app.listen(port, () => {
  console.log(`Newspaper fullstack website: ${port}`)
})