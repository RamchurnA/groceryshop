import bcrypt from 'bcryptjs';
const data = {
    users:[
        {
            name: 'Bean',
            email: 'bean@email.com',
            password: bcrypt.hashSync('Testing123'),
            isAdmin: true,
        },
        {
            name: 'user1',
            email: 'user1@email.com',
            password: bcrypt.hashSync('123'),
            isAdmin: false,
        },

    ],

    products: [

        {
            //_id: '1',
            name: 'Gala Apples',
            slug: 'gala-apples', //what you will see in the url
            category: 'fruits',
            image: '/images/apples.jpeg',
            price: 3.60,
            countInStock: 50,
            rating: 4.5,
            numReviews: 10,
            description: '10 Gala Apples apples per pack',
        },

        {
            //_id: '2',
            name: 'Longan',
            slug: 'longan', //what you will see in the url
            category: 'fruits',
            image: '/images/longan.JPG',
            price: 5,
            countInStock: 10,
            rating: 4.5,
            numReviews: 10,
            description: '1kg Longan per pack',
        },

        {
            //_id: '3',
            name: 'Dragon Fruit',
            slug: 'dragon-fruit',
            category: 'fruits',
            image: '/images/dragon-fruit.JPG',
            price: 10,
            countInStock: 2,
            rating: 4.5,
            numReviews: 10,
            description: '3 Dragon Fruits per pack',
        },

        {
            //_id: '4',
            name: 'Chayotes',
            slug: 'chayotes',
            category: 'vegetables',
            image: '/images/chayotes.JPG',
            price: 5,
            countInStock: 0,
            rating: 4.5,
            numReviews: 10,
            description: '10 Chayotes per pack',
        },


    ],
};

export default data;