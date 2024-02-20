const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fomplst.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("softypy").collection("services");
    const ordersCollection = client.db("softypy").collection("orders");
    const aboutCollection = client.db("softypy").collection("about");
    const singleServiceCollection = client.db("softypy").collection("singleServices");
    const reviewCollection = client.db("softypy").collection("reviews");

    // services related api
    app.get("/services", async (req, res) => {
      const service = await serviceCollection.find().limit(5).toArray();
      res.send(service);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await serviceCollection.findOne(filter);
      res.send(result);
    });
    app.post('/services', async(req, res)=>{
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result)
    })
    app.delete('/services/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const result = await serviceCollection.deleteOne(filter)
      res.send(result)
    })

    app.put('/services/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const newService = req.body;
      console.log(newService)
      const options = {upsert: true};
          const updatedService = {
            $set: {
              name: newService.name,
              title: newService.title,
              subtitle: newService.subtitle,
              topservicetitle: newService.topservicetitle,
              topserviceDescription: newService.topserviceDescription,
              whatWedoDescription: newService.whatWedoDescription,
              productsDescription: newService.productsDescription,
              image: newService.image,
              description: newService.description
        }
      }

      const services = await serviceCollection.updateOne(filter, updatedService, options)
      res.send(services)
    })
//  signle services api 
    app.get('/singleServices', async(req, res)=>{
      const result = await singleServiceCollection.find().limit(5).toArray();
      res.send(result)
    })

    app.get('/singleServices/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const result = await singleServiceCollection.findOne(filter);
      res.send(result)
    })

    app.post('/singleServices', async(req, res)=>{
      const service = req.body;
      const result = await singleServiceCollection.insertOne(service);
      res.send(result)
    })
    app.get('/singleservices/:id', async(req, res)=>{
      const service = req.body;
      const result = await singleServiceCollection.findOne(service);
      res.send(result)
    })
    app.put('/singleServices/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const newSingleServices = req.body;
      console.log(newSingleServices)
      const options = {upsert: true};
          const updatedSingleServices = {
            $set: {
              name: newSingleServices.name,
              category: newSingleServices.category,
              title: newSingleServices.title,
              subtitle: newSingleServices.subtitle,
              image: newSingleServices.image,
              description: newSingleServices.description
        }
      }

      const services = await singleServiceCollection.updateOne(filter, updatedSingleServices, options)
      res.send(services)
    
    })
    app.delete('/singleservices/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const result = await singleServiceCollection.deleteOne(filter);
      res.send(result)

    })

    // user order  api 
    app.get('/orders', async(req, res)=>{
      const result = await ordersCollection.find().toArray();
      res.send(result);
    })
    app.post('/orders', async(req, res)=>{
      const user = req.body;
      const result = await ordersCollection.insertOne(user);
      res.send(result)
    })
    // review
    app.get('/reviews', async(req, res)=>{
      const result = await reviewCollection.find().toArray();
      res.send(result);
    })
    app.post('/reviews', async(req, res)=>{
      const reviews = req.body;
      console.log(reviews)
      const result = await reviewCollection.insertOne(reviews);
      res.send(result)
    })
    app.delete('/reviews/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const result = await reviewCollection.deleteOne(filter);
      res.send(result)

    })
    // about content related api
    app.post('/about', async(req, res)=>{
      const about = req.body;
      const result = await aboutCollection.insertOne(about);
      res.send(result);
    })
    app.get('/about', async(req, res)=>{
      const result = await aboutCollection.find().toArray();
      res.send(result)
    })
    app.delete('/about/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const result = await aboutCollection.deleteOne(filter);
      res.send(result);
    })

    app.get('/about/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const result = await aboutCollection.findOne(filter);
      res.send(result)
    })

    app.put('/about/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const newAboutItem = req.body;
      console.log(newAboutItem)
      const options = {upsert: true};
          const updateAboutItem = {
            $set: {
              title: newAboutItem.title,
              subtitle: newAboutItem.subtitle,
              managementName: newAboutItem.managementName,
              position: newAboutItem.position,
              managmentdescription: newAboutItem.managmentdescription,
              missionDescription: newAboutItem.missionDescription,
              vissionDescription: newAboutItem.vissionDescription,
              teamName: newAboutItem.teamName,
              teamPosition: newAboutItem.teamPosition,
              image:newAboutItem.image,
              description: newAboutItem.r,
              teamDescriptions: newAboutItem.teamDescriptions
        }
      }

      const services = await aboutCollection.updateOne(filter, updateAboutItem, options)
      res.send(services)
    })















    await client.db("admin").command({ ping: 1 });
    console.log(
      " You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Softypy server is running now ");
});

app.listen(port, () => {
  console.log("Softypy server is running now ");
});
