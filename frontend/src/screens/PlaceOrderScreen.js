import React, { useContext, useReducer } from 'react'
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import ListGroup from 'react-bootstrap/ListGroup';
import { Helmet } from 'react-helmet-async'
import { Store } from '../Store';
import { Link, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';
import LoadingBox from '../components/LoadingBox';
import { useEffect } from 'react';

const reducer = (state, action) => {
    switch (action.type) {
        case 'CREATE_REQUEST':
            return {...state, loading: true};
        case 'CREATE_SUCCESS':
            return {...state, loading: false};
        case 'CREATE_FAIL':
            return {...state, loading: false}
        default:
            return state;
    }
};

export default function PlaceOrderScreen() {

    const navigate = useNavigate();
    const [{ loading }, dispatch] = useReducer(reducer, {
        loading: false, 
    });
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart, userInfo } = state;
    const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; //123.2345 => 123.23
    console.log(cart.cartItems);

    cart.itemsPrice = round2(
        cart.cartItems.reduce((a,c) => a + c.quantity * c.price, 0) // cart.cartItems is an array
    );
    cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(5);
    cart.taxPrice = round2(0.15 * cart.itemsPrice);
    cart.totalPrice = cart.itemsPrice + cart.shippingPrice + cart.taxPrice;

    const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

    // lets load the paypal scripts

    useEffect(() => {

        const loadPaypalScript = async () => {
            const { data: clientId } = await axios.get('/api/keys/paypal', {
                headers: { authorization: `Bearer ${userInfo.token}` },
            }); // send an Ajax request to the BE to get the paypal client ID
            // after getting the ID we need to use paypal dispatch
            paypalDispatch({
                type: 'resetOptions',
                value: {
                  'client-id': clientId,
                  currency: 'GBP',
                },
            });
            paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
    
        };
        loadPaypalScript();


    }, [paypalDispatch, userInfo]) 

    const createOrder = async (data, actions) => {
        return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: cart.totalPrice.toFixed(2) },
          },
        ],
        application_context: {
            shipping_preference: 'NO_SHIPPING', // this will remove the the shipping address from the debit/credit card option
        },
      })
      .then((order) => {
        return order;
      });

        
    }

    const onApprove = async (data, actions) => {
        try {
            dispatch({ type: 'CREATE_REQUEST'});
            const { data } = await axios.post('/api/orders', 
                {
                    orderItems: cart.cartItems,
                    dispatchMethod: cart.dispatchMethod,
                    shippingAddress: cart.shippingAddress,
                    itemsPrice: cart.itemsPrice,
                    shippingPrice: cart.shippingPrice,
                    taxPrice: cart.taxPrice,
                    totalPrice: cart.totalPrice,
                }, 
                {
                    headers: {
                        authorization: `Bearer ${userInfo.token}`,
                    }
                }
            );
            ctxDispatch({ type: 'CART_CLEAR' });
            dispatch({ type: 'CREATE_SUCCESS'});
            localStorage.removeItem('cartItems');
            navigate(`/order/${data.order._id}`);
            
        } catch (err) {
            toast.error(getError(err));
            
        }
        

    };

    function onError(err) {
        toast.error(getError(err));
    }

    // const placeOrderHandler = async () => {

    //     try {
    //         dispatch({ type: 'CREATE_REQUEST'});
    //         const { data } = await axios.post('/api/orders', 
    //             {
    //                 orderItems: cart.cartItems,
    //                 dispatchMethod: cart.dispatchMethod,
    //                 shippingAddress: cart.shippingAddress,
    //                 paymentMethod: cart.paymentMethod,
    //                 itemsPrice: cart.itemsPrice,
    //                 shippingPrice: cart.shippingPrice,
    //                 taxPrice: cart.taxPrice,
    //                 totalPrice: cart.totalPrice,
    //             }, 
    //             {
    //                 headers: {
    //                     authorization: `Bearer ${userInfo.token}`,
    //                 }
    //             }
    //         );
    //         ctxDispatch({ type: 'CART_CLEAR' });
    //         dispatch({ type: 'CREATE_SUCCESS'});
    //         localStorage.removeItem('cartItems');
    //         navigate(`/order/${data.order._id}`);
            
    //     } catch (err) {
    //         toast.error(getError(err));
            
    //     }


    // }
  return (
    <div>
        <Helmet>
            <title>Preview Order</title>
        </Helmet>
        <h1 className="my-3">Preview Order</h1>
        <Row>
            <Col md={8}>
                <Card className="mb-3">
                    <Card.Body>
                    <Card.Body>
                        <Card.Title>{cart.dispatchMethod === 'Delivery' ? 'Shipping' : 'Collection'}</Card.Title>
                        <Card.Text>
                            <strong>Name:</strong> {cart.dispatchMethod === 'Delivery' ? cart.shippingAddress.fullName : userInfo.name} <br />
                            <strong>Address:</strong> {cart.dispatchMethod === 'Delivery' ? cart.shippingAddress.address : 'Address of Beanery'} <br />
                            <strong>City:</strong> {cart.dispatchMethod === 'Delivery' ? cart.shippingAddress.city : 'City of Beanery'} <br />
                            <strong>Postcode:</strong> {cart.dispatchMethod === 'Delivery' ? cart.shippingAddress.postalCode : 'Postal code of Beanery'} <br />
                            {cart.dispatchMethod === 'Delivery' ? <strong>Country:</strong> : ''} {cart.dispatchMethod === 'Delivery' ? cart.shippingAddress.country : ''}
                        </Card.Text>
                        {cart.dispatchMethod === 'Delivery' ? <Link to="/shipping">Edit</Link> : ''} 
                    </Card.Body>
                    </Card.Body>

                </Card>

                <Card className="mb-3">
                    <Card.Body>
                        <Card.Title>Items</Card.Title>
                        <ListGroup variant="flush">
                            {cart.cartItems.map((item) => (
                                <ListGroup.Item key={item._id}>
                                    <Row className="align-items-center">
                                        <Col md={6}>
                                            <img src={item.image} alt={item.name}
                                                className="img-fluid rounded img-thumbnail"
                                            ></img>{' '}
                                            <Link to={`/product/${item.slug}`}>{item.name}</Link>
                                        </Col>
                                        <Col md={3}><span>{item.quantity}</span></Col>
                                        <Col md={3}>£{item.price.toFixed(2)}</Col>
                                    </Row>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                        <Link to="/cart">Edit</Link>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={4}>
                <Card>
                    <Card.Body>
                        <Card.Title>Order Summary</Card.Title>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <Row>
                                    <Col>Items</Col>
                                    <Col>£{cart.itemsPrice.toFixed(2)}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Shipping</Col>
                                    <Col>£{cart.shippingPrice.toFixed(2)}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Tax</Col>
                                    <Col>£{cart.taxPrice.toFixed(2)}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Order Total</Col>
                                    <Col>
                                        <strong>£{cart.totalPrice.toFixed(2)}</strong>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <div className="d-grid">
                                <PayPalButtons
                                    createOrder={createOrder}
                                    onApprove={onApprove}
                                    onError={onError}
                                  ></PayPalButtons>
                                </div>
                                {loading && <LoadingBox></LoadingBox>}
                            </ListGroup.Item>
                        </ListGroup>
                    </Card.Body>
                </Card>
            </Col>


        </Row>

    </div>
  )
}
