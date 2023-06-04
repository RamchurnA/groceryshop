import axios from 'axios';
import React, { useContext, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import ListGroup from 'react-bootstrap/ListGroup';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';


export default function DeliverOrder() {
    const navigate = useNavigate();

    const params = useParams(); // /deliver/:id
    const { id: orderId } = params;
    //console.log(orderId);

    const { state} = useContext(Store);

    const { userInfo } = state;

    const [deliveryImages, setdeliveryImages] = useState([]);

    const submitHandler = async (e) => {
        e.preventDefault(); // will not refresh the page when you press the edit the product

        try {
            await axios.put(
                `/api/orders/${orderId}/deliver`,
                {
                    deliveryImages,
                },
                {
                    headers: { Authorization: `Bearer ${userInfo.token}`},
                }
            );
            toast.success('Product updated successfully');
            navigate(`/order/${orderId}`)

        } catch(err) {
            toast.error(getError(err));

        }

    };


    const uploadFileHandler = async (e, forDeliveryImages) => {
        const file = e.target.files[0];
        const bodyFormData = new FormData();
        bodyFormData.append('file', file);
    
        try {
            const { data } = await axios.post('/api/upload', bodyFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    authorization: `Bearer ${userInfo.token}`,
                },
            });
    
            setdeliveryImages(prevImages => {
                if (forDeliveryImages) {
                    return [...prevImages, data.secure_url];
                } else {
                    return [data.secure_url];
                }
            });
    
            toast.success('Image uploaded successfully. Click update to apply images');
        } catch (err) {
            toast.error(getError(err));
        }
    };

    const deleteFileHandler = async (fileName) => {
        setdeliveryImages(deliveryImages.filter((x) => x !== fileName));
        toast.success('Image removed successfully. click update to apply');
    }

  return (
    <div>
        <h1>Deliver Order</h1>

        <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="imageFile">
                <Form.Label>Upload image of delivery</Form.Label>
                <Form.Control type="file" onChange={(e) => uploadFileHandler(e, true)} />
            </Form.Group>

            <Form.Group className="mb-3" controlId='additionalImage'>
                <Form.Label>Uploaded Images</Form.Label>
                {deliveryImages.length === 0 && <MessageBox>No image</MessageBox>}
                <ListGroup variant="flush">
                    {deliveryImages.map((x) => (
                        <ListGroup.Item key={x}>
                            {x}
                            <Button variant="light" onClick={() => deleteFileHandler(x)}>
                                <i className="fa fa-times-circle"></i>
                            </Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Form.Group>



            <div className="mb-3">
                <Button type="submit">Submit</Button>
            </div>

        </Form>
    </div>
  )
}
