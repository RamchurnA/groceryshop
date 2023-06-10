import React, { useContext } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card'
import axios from 'axios';
import { useState } from 'react';


export default function CartScreen() {
    const navigate = useNavigate();
    // lets first get access to the store
    const { state, dispatch: ctxDispatch} = useContext(Store);
    // from the state we deconstruct the cart and from cart we deconstruct the cartItems

    

    const { 
        cart: {cartItems, dispatchMethod, shippingAddress},
    } = state;

    console.log(shippingAddress)

    const [dispatchMethodName, setDispatchMethod] = useState(
        dispatchMethod
    );

    const updateCartHandler = async (item, quantity) => {
        // send a ajax request to backend to get the current product from BE
        const { data } = await axios.get(`/api/product/${item._id}`);

        if (data.countInStock < quantity) {
            window.alert('Sorry. Product is out of stock');
            return;
        }
      
        
        ctxDispatch({type: 'CART_ADD_ITEM', payload: {...item, quantity}});

    };

    const removeItemHandler = (item) => {
        console.log(item);
        ctxDispatch({ type: 'CART_REMOVE_ITEM', payload: item });
    }

    // const checkoutHandler = () => {
    //     navigate('/signin?redirect=/shipping');
    // }

    const submitHandler = (e) => {
        e.preventDefault(); // stop people reloading the page
        ctxDispatch({type: 'SAVE_DISPATCH_METHOD', payload: dispatchMethodName});
        localStorage.setItem('dispatchMethod', dispatchMethodName);
        //navigate('/placeorder');

        if (dispatchMethodName === 'Delivery') {
            navigate('/signin?redirect=/shipping')
        } else if(dispatchMethodName === 'Collection') {
            navigate('/signin?redirect=/placeorder')
        }else {
            navigate('/placeorder')
        }

        // do a check to find out whether the dispatchMethodName.
        // if dispatchMethodName = delivery navigate('/shipping');
        // if dispatchMethodName = collection navigate('/placeorder');

    }


  return (
    <div>
        <Helmet>
            <title>Shopping Cart</title>
        </Helmet>
        <h1>Shopping Cart</h1>
        <Row>
            <Col md={8}>
                {cartItems.length === 0 ? (
                    <MessageBox>
                        Cart is empty. <Link to="/">Go Shopping</Link>
                    </MessageBox>
                ): (
                    <ListGroup>
                        {cartItems.map((item) => 
                        <ListGroup.Item key={item._id}>
                            <Row className="align-items-center">
                                <Col md={4}>
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="img-fluid rounded img-thumbnail"
                                        ></img>{' '}
                                        <Link to={`/product/${item.slug}`}>{item.name}</Link>
                                </Col>
                                <Col md={3}>
                                    <Button variant="light" 
                                            onClick={() => updateCartHandler(item, item.quantity - 1)}
                                            disabled={item.quantity === 1}>
                                        <i className="fas fa-minus-circle"></i>
                                    </Button>{' '}
                                    <span>{item.quantity}</span>
                                    <Button variant="light" 
                                            onClick={() => updateCartHandler(item, item.quantity + 1)}
                                            disabled={item.quantity === item.countInStock}>
                                        <i className="fas fa-plus-circle"></i>
                                    </Button>
                                </Col>
                                <Col md={3}>£{item.price}</Col>
                                <Col md={2}>
                                    <Button onClick={() => removeItemHandler(item)}
                                                    variant="light">
                                                    <i className="fas fa-trash"></i>
                                    </Button>
                                </Col>

                            </Row>
                        </ListGroup.Item>
                        )}

                    </ListGroup>
                ) }

            </Col>
            <Col md={4}>
                <Card>
                    <Card.Body>
                        <ListGroup variant="flush">
                            {console.log(cartItems)}
                            <h3>
                                Subtotal ({cartItems.reduce((a,c) => a + c.quantity, 0)}{' '}
                                items): £{cartItems.reduce((a,c)=> a + c.quantity * c.price, 0)}
                            </h3>
                            <Form onSubmit={submitHandler}>
                            <div className="mb-3">
                                <Form.Check 
                                type="radio"
                                id="Delivery"
                                label="Delivery"
                                value="Delivery"
                                checked={dispatchMethodName === 'Delivery'}
                                onChange={(e) => setDispatchMethod(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <Form.Check 
                                type="radio"
                                id="Collection"
                                label="Collection"
                                value="Collection"
                                checked={dispatchMethodName === 'Collection'}
                                onChange={(e) => setDispatchMethod(e.target.value)}
                                />
                            </div>
                            <div className="d-grid">
                                <Button type="submit" variant="primary" disabled={cartItems.length === 0}
                                >Continue</Button>
                            </div>
                            </Form>
                            {/* <ListGroup.Item>
                                <div className="d-grid">
                                    <Button
                                    type="button"
                                    variant="primary"
                                    onClick={checkoutHandler}
                                    disabled={cartItems.length === 0}
                                    >Proceed to Checkout</Button>
                                </div>
                            </ListGroup.Item> */}
                        </ListGroup>

                    </Card.Body>
                </Card>

            </Col>
        </Row>
    </div>
  )
}
