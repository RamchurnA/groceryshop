import { createContext, useReducer } from "react";

export const Store = createContext();

// create a component name store provider
// its a wrap for our app to pass global props to children

const initialState = {
    userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,
    cart: {
        cartItems: localStorage.getItem('cartItems')
        ? JSON.parse(localStorage.getItem('cartItems'))
        :[],
        shippingAddress: localStorage.getItem('shippingAddress')
        ? JSON.parse(localStorage.getItem('shippingAddress')) // here The JSON.parse() static method parses a JSON string, constructing the JavaScript value or object described by the string.
        : {},
        dispatchMethod: localStorage.getItem('dispatchMethod')
        ? localStorage.getItem('dispatchMethod')
        : ''
    },
};

function reducer(state, action) {
    switch(action.type) {
        case 'CART_ADD_ITEM':
            // we are not going to add the same products multiple times
            // save the item that we're going to add in newItem
            const newItem = action.payload;
            // then get the exisiting item
            const existItem = state.cart.cartItems.find((item) => item._id === newItem._id);
            // if we already have this item in the cart we need to use the map function
            // on the cart item to update it. 
            const cartItems = existItem
            ? state.cart.cartItems.map((item) => 
                item._id === existItem._id ? newItem : item
            )
            : [...state.cart.cartItems, newItem]
            console.log(newItem);
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            return {...state, cart: {...state.cart, cartItems }};
        case 'CART_REMOVE_ITEM': {
            const cartItems = state.cart.cartItems.filter(
                (item) => item._id !== action.payload._id
            );
            console.log(cartItems);
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            return {...state, cart: {...state.cart, cartItems}};

            // here we are filtering out the item passed,
            // the filter function filters all values except the one passed.
            // basically return all values that is not the item passed 

        }
        case 'USER_SIGNIN':
            return {...state, userInfo: action.payload};
        case 'USER_SIGNOUT':
            localStorage.removeItem('dispatchMethod');
            return {...state, userInfo: null, 
                    cart: {
                        cartItems: [], dispatchMethod: ''
                    }};
        case 'CART_CLEAR':
            return {...state, cart: {cartItems: [] , dispatchMethod: ''}}
        case 'SAVE_DISPATCH_METHOD':
            return {...state, cart: {...state.cart, dispatchMethod: action.payload}};
        case 'SAVE_SHIPPING_ADDRESS':
            return {...state, cart: {...state.cart, shippingAddress: action.payload,},};
        default:
            return state;
    }
}

export function StoreProvider(props) {

    const [state, dispatch] = useReducer(reducer, initialState);
    const value = {state, dispatch};

    return <Store.Provider value={value}>{props.children}</Store.Provider>
    // Store is comiing from react context
    // get provider from the Store object
    // set the value to value, which contains the current state in the context

}
