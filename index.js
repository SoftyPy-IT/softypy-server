const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const http = require("http");
const { Server } = require("socket.io");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// middleware
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// const uri = `mongodb://localhost:27017/softypy`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fomplst.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173/",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("socket.id", socket.id);

  socket.on("set-user", (getReceiverId) => {
    socket.join(getReceiverId);
  });

  socket.on("send-message", async (message) => {
    io.to(message.senderId).emit("received-message", message);
    io.to(message.receiverId).emit("received-message", message); // Sender // Sender
    // socket.broadcast.emit("notification", message);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected`);
  });
});

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("softypy").collection("services");
    const ordersCollection = client.db("softypy").collection("orders");
    const aboutCollection = client.db("softypy").collection("about");
    const singleServiceCollection = client
      .db("softypy")
      .collection("singleServices");
    const reviewCollection = client.db("softypy").collection("reviews");
    const packageCollection = client.db("softypy").collection("packages");
    const portfolioCollection = client.db("softypy").collection("portfolio");
    const conversationCollection = client
      .db("softypy")
      .collection("conversation");
    const messageCollection = client.db("softypy").collection("message");
    const userCollection = client.db("softypy").collection("users");

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
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await serviceCollection.deleteOne(filter);
      res.send(result);
    });

    app.put("/services/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const newService = req.body;
      console.log(newService);
      const options = { upsert: true };
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
          description: newService.description,
        },
      };

      const services = await serviceCollection.updateOne(
        filter,
        updatedService,
        options
      );
      res.send(services);
    });
    //  signle services api
    app.get("/singleServices", async (req, res) => {
      const result = await singleServiceCollection.find().limit(5).toArray();
      res.send(result);
    });

    app.get("/singleServices/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await singleServiceCollection.findOne(filter);
      res.send(result);
    });

    app.post("/singleServices", async (req, res) => {
      const service = req.body;
      const result = await singleServiceCollection.insertOne(service);
      res.send(result);
    });
    app.get("/singleservices/:id", async (req, res) => {
      const service = req.body;
      const result = await singleServiceCollection.findOne(service);
      res.send(result);
    });
    app.put("/singleServices/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const newSingleServices = req.body;
      console.log(newSingleServices);
      const options = { upsert: true };
      const updatedSingleServices = {
        $set: {
          name: newSingleServices.name,
          category: newSingleServices.category,
          title: newSingleServices.title,
          subtitle: newSingleServices.subtitle,
          image: newSingleServices.image,
          description: newSingleServices.description,
        },
      };

      const services = await singleServiceCollection.updateOne(
        filter,
        updatedSingleServices,
        options
      );
      res.send(services);
    });
    app.delete("/singleservices/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await singleServiceCollection.deleteOne(filter);
      res.send(result);
    });

    // user order  api
    app.get("/orders", async (req, res) => {
      const result = await ordersCollection.find().toArray();
      res.send(result);
    });
    app.post("/orders", async (req, res) => {
      const user = req.body;
      const result = await ordersCollection.insertOne(user);
      res.send(result);
    });
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await ordersCollection.deleteOne(filter);
      res.send(result);
    });

    // review api
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });
    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      console.log(reviews);
      const result = await reviewCollection.insertOne(reviews);
      res.send(result);
    });
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await reviewCollection.deleteOne(filter);
      res.send(result);
    });
    // about content related api
    app.post("/about", async (req, res) => {
      const about = req.body;
      const result = await aboutCollection.insertOne(about);
      res.send(result);
    });
    app.get("/about", async (req, res) => {
      const result = await aboutCollection.find().toArray();
      res.send(result);
    });
    app.delete("/about/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await aboutCollection.deleteOne(filter);
      res.send(result);
    });

    app.get("/about/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await aboutCollection.findOne(filter);
      res.send(result);
    });

    app.put("/about/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const newAboutItem = req.body;
      console.log(newAboutItem);
      const options = { upsert: true };
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
          image: newAboutItem.image,
          description: newAboutItem.r,
          teamDescriptions: newAboutItem.teamDescriptions,
        },
      };

      const services = await aboutCollection.updateOne(
        filter,
        updateAboutItem,
        options
      );
      res.send(services);
    });

    // package api
    app.get("/packages", async (req, res) => {
      const result = await packageCollection.find().toArray();
      res.send(result);
    });
    app.post("/packages", async (req, res) => {
      const package = req.body;
      const result = await packageCollection.insertOne(package);
      res.send(result);
    });
    app.delete("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await packageCollection.deleteOne(filter);
      res.send(result);
    });
    app.put("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const newService = req.body;
      console.log(newService);
      const options = { upsert: true };
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
          description: newService.description,
        },
      };

      const services = await portfolioCollection.updateOne(
        filter,
        updatedService,
        options
      );
      res.send(services);
    });

    // portfolio api
    app.get("/portfolio", async (req, res) => {
      const result = await portfolioCollection.find().toArray();
      res.send(result);
    });
    app.post("/portfolio", async (req, res) => {
      const portfolio = req.body;
      console.log(portfolio);
      const result = await portfolioCollection.insertOne(portfolio);
      res.send(result);
    });
    app.delete("/portfolio/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await portfolioCollection.deleteOne(filter);
      res.send(result);
    });
    app.put("/portfolio/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const newService = req.body;
      console.log(newService);
      const options = { upsert: true };
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
          description: newService.description,
        },
      };

      const services = await portfolioCollection.updateOne(
        filter,
        updatedService,
        options
      );
      res.send(services);
    });



        // User Registration
        app.post("/register", async (req, res) => {
          console.log(req.body);
          const { name, email, password, role } = req.body;
    
          // Check if email already exists
          const existingUser = await userCollection.findOne({ email });
          if (existingUser) {
            return res.status(400).json({
              success: false,
              message: "User already exists",
            });
          }
    
          // Hash the password
          const hashedPassword = await bcrypt.hash(password, 10);
    
          // Insert user into the database
          await userCollection.insertOne({ name, email, password: hashedPassword, role });
    
          res.status(201).json({
            success: true,
            message: "User registered successfully",
          });
        });
        app.get("/register", async (req, res) => {
          const result = await userCollection.find().toArray();
          res.send(result);
        });
        // User Login
        app.post("/login", async (req, res) => {
          console.log(req.body);
          const { email, password } = req.body;
    
          // Find user by email
          const user = await userCollection.findOne({ email });
          if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
          }
    
          // Compare hashed password
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
          }
    
          // Generate JWT token
          const token = jwt.sign({ email: user }, process.env.JWT_SECRET, {
            expiresIn: process.env.EXPIRES_IN,
          });
    
          res.json({
            success: true,
            message: "Login successful",
            token,
            email,
          });
        });




    // conversation
    app.post("/conversation", async (req, res) => {
      const newConversation = {
        members: [req.body.senderId, req.body.receiverId],
      };

      try {
        const savedConversation = await conversationCollection.insertOne(
          newConversation
        );
        res.status(200).json(savedConversation); // ops[0] contains the inserted document
      } catch (err) {
        res.status(500).json(err);
      }
    });

    //get conv of a user

    // app.get("/conversation/:userId", async (req, res) => {
    //   try {
    //     const conversation = await conversationCollection
    //       .find({
    //         members: { $in: [req.params.userId] },
    //       })
    //       .toArray();
    //     console.log(conversation);
    //     res.status(200).json(conversation);
    //   } catch (err) {
    //     res.status(500).json(err);
    //   }
    // });

    // // get conv includes two userId

    // app.get("/find/:firstUserId/:secondUserId", async (req, res) => {
    //   try {
    //     const conversation = await conversationCollection.findOne({
    //       members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    //     });
    //     res.status(200).json(conversation);
    //   } catch (err) {
    //     res.status(500).json(err);
    //   }
    // });

    // message start

    app.post("/message", async (req, res) => {
      const newMessage = req.body;

      try {
        const savedMessage = await messageCollection.insertOne(newMessage);
        res.status(200).json(savedMessage); // ops[0] contains the inserted document
      } catch (err) {
        res.status(500).json(err);
      }
    });
    app.get("/message/all", async (req, res) => {
      try {
        const uniqueSenderIds = await messageCollection
          .aggregate([
            {
              $sort: { fieldName: -1 }, // Sort messages within each group by fieldName in descending order
            },
            {
              $group: {
                _id: "$senderId",
                message: { $last: "$$ROOT" },
              },
            },
          ])
          .toArray();

        res.status(200).json(uniqueSenderIds);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get("/message", async (req, res) => {
      try {
        const { receiverId, senderId } = req.query;
        const filter = {
          $or: [
            {
              senderId: senderId,
              receiverId: receiverId,
            },
            {
              senderId: receiverId,
              receiverId: senderId,
            },
          ],
        };

        const messages = await messageCollection.find(filter).toArray();

        res.status(200).json(messages);
      } catch (err) {
        res.status(500).json(err);
      }
    });

    app.delete("/message/:senderId", async (req, res) => {
      try {
        const senderId = req.params.senderId;
        const messages = await messageCollection.deleteMany({ senderId });

        res.status(200).json(messages);
      } catch (err) {
        res.status(500).json(err);
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(" You successfully connected to MongoDB!");
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
client.on("error", console.error.bind(console, "MongoDB connection error:"));
client.once("open", () => {
  console.log("Socket io connected to MongoDB successfully");
});
