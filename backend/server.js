import express from "express";
import data from "./data.js";

const app = express();
// express() is a function that returns an object which is the express app. 
// this object has a method get and this method has two parameters
// the first parameter is the url we are exposing,
// and the second parameter is the function that responds to the api
// when the user goes to '/api/products' we need to send the products to the frontend
// the second paramenter accepts two parameters request and response object
// we then use res.send() to send data to the FE. 

app.get('/api/products', (req, res) => {
    res.send(data.products);

});

app.get('/api/products/:slug', (req, res) => {
    const product = data.products.find(x => x.slug === req.params.slug);
    if(product) {
        res.send(product);
    } else {
        res.status(404).send({message: 'Product not found'});

    }

});

app.get('/api/product/:id', (req, res) => {
    const product = data.products.find(x => x._id === req.params.id);
    if(product) {
        res.send(product);
    } else {
        res.status(404).send({message: 'Product not found'});

    }

});

// now we need to define the port where the BE will run
// This process.env.PORT, looks for any free ports, if not, just run the server on port 5000

const port = process.env.PORT || 5000;

// next we have listen to anything trying to communicate with the server,
// using app.listen()
// the first parameter is the port number
// the second parameter is a callback function that will run when the server is ready

app.listen(port, ()=>{
    console.log(`server running on http://localhost:${port}`);
});



