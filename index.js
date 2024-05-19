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
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("socket.id", socket.id);

  socket.on("set-user", (getReceiverId) => {
    console.log("getReceiverId", getReceiverId);
    socket.join(getReceiverId);
  });

  socket.on("send-message", async (message) => {
    console.log(message);
    io.to(message.senderId).emit("received-message", message);
    io.to(message.receiverId).emit("received-message", message);
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


    app.get("/singleServices", async (req, res) => {
      try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        // Calculate the number of documents to skip
        const skip = (page - 1) * limit;

        // Fetch the results with pagination
        const result = await singleServiceCollection
          .find()
          .skip(skip)
          .limit(limit)
          .toArray();

        // Convert priority from string to number
        const servicesWithNumericPriority = result.map((service) => ({
          ...service,
          priority: Number(service.priority),
        }));

        // Get the total count of documents
        const total = await singleServiceCollection.countDocuments();

        // Calculate the total number of pages
        const totalPages = Math.ceil(total / limit);

        // Send the paginated result along with metadata
        res.send({
          total,
          page,
          totalPages,
          limit,
          services: servicesWithNumericPriority,
        });
      } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.get("/singleServices/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await singleServiceCollection.findOne(filter);
      res.send(result);
    });

    app.post("/singleServices", async (req, res) => {
      const service = req.body;
      console.log(service);
      const result = await singleServiceCollection.insertOne(service);
      res.send(result);
    });
    app.get("/singleservices/:id", async (req, res) => {
      const service = req.body;
      const result = await singleServiceCollection.findOne(service);
      res.send(result);
    });

    app.put("/singleServices/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const newSingleServices = req.body;

        const updatedSingleServices = {
          $set: {
            name: newSingleServices.name,
            category: newSingleServices.category,
            title: newSingleServices.title,
            subtitle: newSingleServices.subtitle,
            image: newSingleServices.image,
            description: newSingleServices.description,
            priority: newSingleServices.priority, // Include priority if it's part of the update
          },
        };

        const result = await singleServiceCollection.updateOne(
          filter,
          updatedSingleServices,
          { upsert: true }
        );

        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Service not found" });
        }

        res.send({ message: "Service updated successfully", result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    //   const id = req.params.id;
    //   const filter = { _id: new ObjectId(id) };
    //   const newSingleServices = req.body;
    //   console.log(newSingleServices);
    //   const options = { upsert: true };
    //   const updatedSingleServices = {
    //     $set: {
    //       name: newSingleServices.name,
    //       category: newSingleServices.category,
    //       title: newSingleServices.title,
    //       subtitle: newSingleServices.subtitle,
    //       image: newSingleServices.image,
    //       description: newSingleServices.description,
    //     },
    //   };

    //   const services = await singleServiceCollection.updateOne(
    //     filter,
    //     updatedSingleServices,
    //     options
    //   );
    //   res.send(services);
    // });
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
// Assuming you have the necessary imports and setup for Express and MongoDB

app.get("/reviews", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5 ;
  const skip = (page - 1 ) * limit;
  const result = await reviewCollection.find().skip(skip).limit(limit).toArray()
  const total = await reviewCollection.countDocuments();
  const totalPages = Math.ceil(total/limit);

  res.send({
    total,page,totalPages, limit, reviews: result
  })
  
});
app.get("/singleServices", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const result = await singleServiceCollection
      .find()
      .skip(skip)
      .limit(limit)
      .toArray();
    const servicesWithNumericPriority = result.map((service) => ({
      ...service,
      priority: Number(service.priority),
    }));

    // Get the total count of documents
    const total = await singleServiceCollection.countDocuments();

    // Calculate the total number of pages
    const totalPages = Math.ceil(total / limit);

    // Send the paginated result along with metadata
    res.send({
      total,
      page,
      totalPages,
      limit,
      services: servicesWithNumericPriority,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

    
       
    app.get("/reviews/:id", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.findOne(review);
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const reviews = req.body;
      console.log(reviews);
      const result = await reviewCollection.insertOne(reviews);
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

    app.put("/reviews/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const newReview = req.body;
    
        const updateReview = {
          $set: {
            name: newReview.name,
            title: newReview.title,
            description: newReview.description,
            image: newReview.image,
            videoUrl: newReview.videoUrl,
          },
        };
    
        const result = await reviewCollection.updateOne(filter, updateReview, {
          upsert: true,
        });
    
        if (result.matchedCount === 0) {
          return res.status(404).send({ message: "Review not found" });
        }
    
        res.send({ message: "Review updated successfully", result });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });
    

    // about content related api
    app.post("/portfolio", async (req, res) => {
      const about = req.body;
      const result = await portfolioCollection.insertOne(about);
      res.send(result);
    });
    app.get("/portfolio", async (req, res) => {
      const result = await portfolioCollection.find().toArray();
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
      await userCollection.insertOne({
        name,
        email,
        password: hashedPassword,
        role,
      });

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
              $match: {
                senderId: { $regex: /^user/i }, // Match senderIds that start with "user"
              },
            },
            {
              $sort: { _id: -1 },
            },
            {
              $group: {
                _id: "$senderId",
                text: { $first: "$$ROOT" },
              },
            },
            {
              $project: {
                _id: "$text.senderId",
                senderId: "$text.senderId",
                text: "$text.text",
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

server.listen(port, () => {
  console.log(`Softypy server is running now ${port}`);
});
client.on("error", console.error.bind(console, "MongoDB connection error:"));
client.once("open", () => {
  console.log("Socket io connected to MongoDB successfully");
});
