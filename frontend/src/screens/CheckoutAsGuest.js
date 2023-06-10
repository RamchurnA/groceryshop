import React, { useContext, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Store } from '../Store';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import axios from 'axios';
import { getError } from '../utils';
import { useNavigate } from 'react-router-dom';

export default function CheckoutAsGuest() {

    const navigate = useNavigate();

    const { state, dispatch: ctxDispatch } = useContext(Store);

    const { cart } = state;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');

    const submitHandler = async (e) => {
        e.preventDefault(); // prevents refreshing the page
        if (email !== confirmEmail) {
          toast.error('Emails do not match');
          return;
        }
        try {
          const { data } = await axios.post('/api/users/guestsignup', {
            name,
            email,
          });
          ctxDispatch({type: 'USER_SIGNIN', payload: data})
          localStorage.setItem('userInfo', JSON.stringify(data));
          navigate(cart.dispatchMethod === 'Delivery' ? '/shipping' : '/placeorder');
          console.log(data);
        } catch (err) {
    
          //alert('Invalid email or password');
          toast.error(getError(err));
          
        }
    
      }

  return (
    <div>
        <Helmet>
            <title>Guest Information</title>
        </Helmet>

        <h1 className="my-3">Guest Information</h1>
        <Form onSubmit={submitHandler}>

            <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control onChange={(e) => setName(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" required onChange={(e) => setEmail(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="confirmEmail">
                <Form.Label>Confirm Email</Form.Label>
                <Form.Control type="confirmEmail" required onChange={(e) => setConfirmEmail(e.target.value)} />
            </Form.Group>

            <div className="mb-3">
                <Button variant="primary" type="submit">
                        Continue
                </Button>
            </div>

        </Form>



    </div>
  )
}
