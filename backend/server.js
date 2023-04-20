import express from "express";
import path from 'path';
import mongoose from "mongoose";
import dotenv from "dotenv";
import seedRouter from "./routes/seedRoutes.js";
import productRouter from "./routes/productRoutes.js";
import newproductRouter from "./routes/newProductRoute.js";
import userRouter from "./routes/userRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import uploadRouter from "./routes/uploadRoutes.js";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log('connected to db')
}).catch(err => {
    console.log(err.message);
});

const app = express();
// express() is a function that returns an object which is the express app. 
// this object has a method get and this method has two parameters
// the first parameter is the url we are exposing,
// and the second parameter is the function that responds to the api
// when the user goes to '/api/products' we need to send the products to the frontend
// the second paramenter accepts two parameters request and response object
// we then use res.send() to send data to the FE. 

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
// form data in the request, will be converted to a JSON object inside req.body

app.get('/api/keys/paypal', (req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

app.use('/api/seed', seedRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/products', productRouter);
app.use('/api/product', newproductRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);



// app.get('/api/products/:slug', (req, res) => {
//     const product = data.products.find(x => x.slug === req.params.slug);
//     if(product) {
//         res.send(product);
//     } else {
//         res.status(404).send({message: 'Product not found'});

//     }

// });

// app.get('/api/product/:id', (req, res) => {
//     const product = data.products.find(x => x._id === req.params.id);
//     if(product) {
//         res.send(product);
//     } else {
//         res.status(404).send({message: 'Product not found'});

//     }

// });

// now we need to define the port where the BE will run
// This process.env.PORT, looks for any free ports, if not, just run the server on port 5000

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '/frontend/build'))); // serve all files inside the FE build folder as static files all of these files will be served via the server running on port 5000
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
);

app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message});
});

const port = process.env.PORT || 5000;

// next we have listen to anything trying to communicate with the server,
// using app.listen()
// the first parameter is the port number
// the second parameter is a callback function that will run when the server is ready

app.listen(port, ()=>{
    console.log(`server running on http://localhost:${port}`);
});



