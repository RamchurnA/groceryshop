import React, { useEffect, useReducer, useState } from 'react';
//import data from '../data';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

// ...state refers to keep the previous state values the same
// action.payload = contains all products from the BE

const reducer = (state, action) => {
    switch(action.type) {
        case 'FETCH_REQUEST':
            return {...state, loading: true}
        case 'FETCH_SUCCESS':
            return {...state, products: action.payload, loading: false}
        case 'FETCH_FAIL':
            return {...state,  loading: false, error: action.payload}
        default:
        return state;
    }
}

export default function HomeScreen() {

    // we need to define a start to save the product from the BE

    //const [products, setProducts] = useState([]); // empty array as products in data.js is in an array
    // useEffect is a fucntion that accepts two parameters
    // the first parameter is a function 
    // second parameter is an empty array as we are going to run this function only once

    const[{loading, error, products}, dispatch] = useReducer(reducer,{
        products: [],
        loading: true,
        error: '',

    } )


    useEffect(()=>{
        const fetchData = async() => {
            dispatch({type: 'FETCH_REQUEST'})
            try {
                const result = await axios.get('/api/products'); // we are sending an ajax request to this end point and put the data in const result
                dispatch({type: 'FETCH_SUCCESS', payload: result.data})

            } catch(err) {
                dispatch({type:'FETCH_FAIL', payload: err.message})

            }
            //setProducts(result.data);
        };
        fetchData();

    }, []);
    
  return (
    <div>
        <Helmet><title>The Beanery</title></Helmet>
        <main>
            <h1>Featured Products</h1>
            <div className="products">
            {loading ? (
              <LoadingBox></LoadingBox>
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={3} className="mb-3">
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        )}
                
                
            </div>
        </main>
    </div>

)
}
