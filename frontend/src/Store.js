import { createContext, useReducer } from "react";

export const Store = createContext();

// create a component name store provider
// its a wrap for our app to pass global props to children

const initialState = {
    cart: {
        cartItems: [],
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
            return {...state, cart: {...state.cart, cartItems }}
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
