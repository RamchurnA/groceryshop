import axios from 'axios';
import React, { useEffect } from 'react';
import { useReducer } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import { useNavigate, useParams } from 'react-router-dom';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';
import { useContext } from 'react';
import { Store } from '../Store';

const reducer = (state, action) => {

  switch(action.type) {
    case 'FETCH_REQUEST':
        return {...state, loading: true}
    case 'FETCH_SUCCESS':
        return {...state, product: action.payload, loading: false}
    case 'FETCH_FAIL':
        return {...state,  loading: false, error: action.payload}
    default:
    return state;
  }

};



export default function ProductScreen() {
  const navigate = useNavigate();

  



  const params = useParams();  // get the value of the slug from the url path="/product/:slug"
  const { slug } = params;

  const [{loading, error, product}, dispatch] = useReducer(reducer, {
    loading: true,
    product: [],
    error: '',
  })

  useEffect(()=>{
    const fetchData = async() => {
        dispatch({type: 'FETCH_REQUEST'})
        try {
            const result = await axios.get(`/api/products/${slug}`); // we are sending an ajax request to this end point and put the data in const result
            dispatch({type: 'FETCH_SUCCESS', payload: result.data})

        } catch(err) {
            dispatch({type:'FETCH_FAIL', payload: getError(err) })

        }
        //setProducts(result.data);
    };
    fetchData();

}, [slug]); // slug is added a dependency, there run fetchdata everytime slug changes


const {state, dispatch: ctxDispatch} = useContext(Store); // we can have access to the state of the context
// we need to deconstruct the state from Store to get the cart information
const { cart } = state;
const addToCartHandler = async () => {

  // const existItem = cart.cartItems.find((x) => x._id === product._id); // this will return the product
  // const quantity = existItem ? existItem.quantity + 1 : 1;
  // const { data } = await axios.get(`/api/products/${product._id}`);

  // if (data.countInStock < quantity) {
  //   window.alert('Sorry Product is out of stock');
  //   return;
  // }

  const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/product/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }

  



  ctxDispatch({type: 'CART_ADD_ITEM', payload: {...product, quantity}});
  navigate('/cart');

}
  return (
    loading ? <LoadingBox></LoadingBox>
    : error ? <MessageBox variant="danger">{error}</MessageBox>
    : <div>
      <Row>
        <Col md={6}>
        <img
            className="img-large"
            src={product.image}
            alt={product.name}
          ></img>
        </Col>
        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Helmet>
                <title>{product.name}</title>
              </Helmet>
              <h1>{product.name}</h1>
            </ListGroup.Item>
            <ListGroup.Item>
              <Rating
              rating={product.rating}
              numReviews={product.numReviews}
              ></Rating>
            </ListGroup.Item>
            <ListGroup.Item>
              Price: £{product.price}
            </ListGroup.Item>
            <ListGroup.Item>
              Description: {product.description}
            </ListGroup.Item>


          </ListGroup>

        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Price</Col>
                    <Col>£{product.price}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Status</Col>
                    <Col>{product.countInStock>0 ?
                    <Badge bg="success">In stock</Badge>
                  : <Badge bg="danger">Out of Stock</Badge>}</Col>
                  </Row>
                </ListGroup.Item>

                {product.countInStock > 0 && (
                  <ListGroup.Item>
                    <div className="d-grid">
                      <Button onClick={addToCartHandler} variant="primary">
                        Add to Cart
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}


              </ListGroup>
            </Card.Body>

          </Card>
        </Col>

      </Row>
    </div>
  )
}
