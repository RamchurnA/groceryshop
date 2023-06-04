import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useReducer } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import ListGroup from 'react-bootstrap/ListGroup';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';
import { useContext } from 'react';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

const reducer = (state, action) => {

  switch(action.type) {
    case 'FETCH_REQUEST':
        return {...state, loading: true}
    case 'FETCH_SUCCESS':
        return {...state, product: action.payload, loading: false}
    case 'FETCH_FAIL':
        return {...state,  loading: false, error: action.payload}
    case 'REFRESH_PRODUCT':
      return {...state, product: action.payload};
    
    case 'CREATE_REQUEST':
      return {...state, loadingCreateReview: true};
    
    case 'CREATE_SUCCESS':
      return {...state, loadingCreateReview: false};
    
    case 'CREATE_FAIL':
      return {...state, loadingCreateReview: false};
    default:
    return state;
  }

};



export default function ProductScreen() {
  let reviewsRef = useRef();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState('');

  



  const params = useParams();  // get the value of the slug from the url path="/product/:slug"
  const { slug } = params;

  const [{loading, error, product, loadingCreateReview}, dispatch] = useReducer(reducer, {
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
const { cart, userInfo } = state;
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
    const { data } = await axios.get(`/api/products/pid/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Product is out of stock');
      return;
    }

  



  ctxDispatch({type: 'CART_ADD_ITEM', payload: {...product, quantity}});
  navigate('/cart');

}

const submitHandler = async (e) => {

  e.preventDefault();
  if (!comment || !rating) {
    toast.error('Please enter a comment and rating');
    return;
  }
  try {
    const { data } = await axios.post(
      `/api/products/pid/${product._id}/reviews`,
      { rating, comment, name: userInfo.name },

      {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      }
    );

    dispatch({
      type: 'CREATE_SUCCESS',
    });
    toast.success('Review submitted successfully');
    product.reviews.unshift(data.review);
    product.numReviews = data.numReviews;
    product.rating = data.rating;
    dispatch({ type: 'REFRESH_PRODUCT', payload: product });
    window.scrollTo({
      behavior: 'smooth',
      top: reviewsRef.current.offsetTop,
    });

    
  } catch (error) {
    toast.error(getError(error));
    dispatch({ type: 'CREATE_FAIL' });
  }

};

  return (
    loading ? <LoadingBox></LoadingBox>
    : error ? <MessageBox variant="danger">{error}</MessageBox>
    : <div>
      <Row>
        <Col md={6}>
        <img
            className="img-large"
            src={selectedImage || product.image}
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
              Price: £{product.price.toFixed(2)}
            </ListGroup.Item>

            <ListGroup.Item>
              <Row xs={1} md={2} className="g-2">
                {
                  [product.image, ...product.images].map((x)=> (
                    <Col key={x}>
                      <Card>
                        <Button
                          className="thumbnail"
                          type="button"
                          variant="light"
                          onClick={() => setSelectedImage(x)}
                        >
                          <Card.Img
                            variant="top"
                            src={x}
                            alt="product"
                          />
                        </Button>

                      </Card>
                    </Col>
                  ))
                }

              </Row>

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
      <div className="my-3">
        <h2 ref={reviewsRef}>Reviews</h2>
        <div className="mb-3">
          {product.reviews.length === 0 && (
            <MessageBox>There is no review</MessageBox>
          )}
        </div>
        <ListGroup>
          {product.reviews.map((review) => (
            <ListGroup.Item key={review._id}>
              <strong>{review.name}</strong>
              <Rating rating={review.rating} caption=" "></Rating>
              <p>{review.createdAt.substring(0,10)}</p>
              <p>{review.comment}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <div className="my-3">
          {userInfo ? (
            <form onSubmit={submitHandler}>
              <h2>Write a customer review</h2>
              <Form.Group className="mb-3" controlId="rating">
                <Form.Label>Rating</Form.Label>
                <Form.Select
                  aria-label="Rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="1">1- Poor</option>
                  <option value="2">2- Fair</option>
                  <option value="3">3- Good</option>
                  <option value="4">4- Very good</option>
                  <option value="5">5- Excellent</option>
                </Form.Select>

              </Form.Group>

              <FloatingLabel
                control="floatingTextarea"
                label="Comments"
                className="mb-3"
              >
                <Form.Control
                  as="textarea"
                  placeholder="Leave a comment here"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                >
                </Form.Control>

              </FloatingLabel>

              <div className="mb-3">
                <Button disabled={loadingCreateReview} type="submit">
                  Submit
                </Button>
                {loadingCreateReview && <LoadingBox></LoadingBox>}

              </div>
              
            </form>
          ): (
            <MessageBox>
              Please <Link to={`/signin?redirect=/product/${product.slug}`}>Sign In</Link> to write a review
            </MessageBox>
          )}
        </div>
      </div>
    </div>
  )
}
