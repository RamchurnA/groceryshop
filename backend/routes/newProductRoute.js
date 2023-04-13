import express from 'express';
import Product from '../models/productModels.js';

const newproductRouter = express.Router();

newproductRouter.get('/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.send(product);
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
});

export default newproductRouter;

