import React, { useContext } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ListGroup from 'react-bootstrap/ListGroup';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card'


export default function CartScreen() {
    // lets first get access to the store
    const { state, dispatch: ctxDispatch} = useContext(Store);
    // from the state we deconstruct the cart and from cart we deconstruct the cartItems

    const { 
        cart: {cartItems},
    } = state


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
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="roundedCircle img-thumbnail"
                                ></img>{' '}
                                <Link to={`/product/${item.slug}`}>{item.name}</Link>
                                <Col md={3}>
                                    <Button variant="light" disabled={item.quantity === 1}>
                                        <i className="fas fa-minus-circle"></i>
                                    </Button>{' '}
                                    <span>{item.quantity}</span>
                                    <Button variant="light" disabled={item.quantity === item.countInStock}>
                                        <i className="fas fa-plus-circle"></i>
                                    </Button>
                                </Col>
                                <Col md={3}>£{item.price}</Col>
                                <Col md={2}>
                                    <Button variant="light">
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
                                items): {cartItems.reduce((a,c)=> a + c.quantity * c.price, 0)}
                            </h3>
                            <ListGroup.Item>
                                <div className="d-grid">
                                    <Button
                                    type="button"
                                    variant="primary"
                                    disabled={cartItems.length === 0}
                                    >Proceed to Checkout</Button>
                                </div>
                            </ListGroup.Item>


                        </ListGroup>

                    </Card.Body>
                </Card>

            </Col>
        </Row>
    </div>
  )
}
