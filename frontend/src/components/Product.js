import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { useContext } from 'react';
import { Store } from '../Store';
import axios from 'axios';

function Product(props) {
  const { product } = props;
  const { state, dispatch: ctxDispatch} = useContext(Store);
    // from the state we deconstruct the cart and from cart we deconstruct the cartItems

    const { 
        cart: {cartItems},
    } = state;

  const addToCartHandler = async (item) => {
    // send a ajax request to backend to get the current product from BE
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/product/${item._id}`);

    if (data.countInStock < quantity) {
        window.alert('Sorry. Product is out of stock');
        return;
    }
  
    
    ctxDispatch({type: 'CART_ADD_ITEM', payload: {...item, quantity}});

};



  return (
    <Card>
      <Link to={`/product/${product.slug}`}>
        <img src={product.image} className="card-img-top" alt={product.name} />
      </Link>
      <Card.Body>
        <Link to={`/product/${product.slug}`}>
          <Card.Title>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>£{product.price}</Card.Text>
        <Card.Text>{product.description}</Card.Text>
        {product.countInStock === 0 ? <Button variant='light' disabled>Out of Stock</Button>
        : <Button onClick={()=> {addToCartHandler(product)}}>Add to cart</Button>}
      </Card.Body>
    </Card>
  );
}
export default Product;