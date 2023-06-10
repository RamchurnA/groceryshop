import jwt from 'jsonwebtoken';
import mg from 'mailgun-js';

export const baseUrl = () =>
  process.env.BASE_URL
    ? process.env.BASE_URL
    : process.env.NODE_ENV !== 'production'
    ? 'http://localhost:3000'
    : 'https://beanery-app.onrender.com/';

export const generateToken = (user) => {
    return jwt.sign({ 
        _id: user._id,
        name: user.name,
        email: user.email, 
        isAdmin: user.isAdmin,
        }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

export const isAuth = (req, res, next) => {

    const authorization = req.headers.authorization;

    if (authorization) {
        const token = authorization.slice(7, authorization.length); //Bearer XXXXXX getting only the token which is XXXXXX

        jwt.verify(
            token,
            process.env.JWT_SECRET,
            (err, decode) => {
                if (err) {
                    res.status(401).send({ message: 'Invalid Token' });
                } else {
                    req.user = decode;
                    //console.log(req.user);
                    next();
                }
            }
        );
    } else {
        res.status(401).send({ message: 'No Token' });
    }

};

export const mailgun = () => mg({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN,
});


export const payOrderEmailTemplate = (order, userName, userIsGuest) => {
    return `<h1>Thanks for shopping with us</h1>
    <p>
    Hi ${userName},</p>
    <p>We have finished processing your order.</p>
    <h2>[Order ${order._id}] (${order.createdAt.toString().substring(0, 10)})</h2>
    <table>
    <thead>
    <tr>
    <td><strong>Product</strong></td>
    <td><strong>Quantity</strong></td>
    <td><strong align="right">Price</strong></td>
    </thead>
    <tbody>
    ${order.orderItems
      .map(
        (item) => `
      <tr>
      <td>${item.name}</td>
      <td align="center">${item.quantity}</td>
      <td align="right"> £${item.price.toFixed(2)}</td>
      </tr>
    `
      )
      .join('\n')}
    </tbody>
    <tfoot>
    <tr>
    <td colspan="2">Items Price:</td>
    <td align="right"> £${order.itemsPrice.toFixed(2)}</td>
    </tr>
    <tr>
    <td colspan="2">Shipping Price:</td>
    <td align="right"> £${order.shippingPrice.toFixed(2)}</td>
    </tr>
    <tr>
    <td colspan="2">Tax Price:</td>
    <td align="right"> £${order.taxPrice.toFixed(2)}</td>
    </tr>
    <tr>
    <td colspan="2"><strong>Total Price:</strong></td>
    <td align="right"><strong> £${order.totalPrice.toFixed(2)}</strong></td>
    </tr>
    </table>
    <h2>${order.dispatchMethod === 'Delivery' ? 'Shipping address'  : 'Collection address'}</h2>
    <p>
    ${order.dispatchMethod === 'Delivery' ? order.shippingAddress.fullName : userName},<br/>
    ${order.dispatchMethod === 'Delivery' ? order.shippingAddress.address : 'Collection address'},<br/>
    ${order.dispatchMethod === 'Delivery' ? order.shippingAddress.city: 'Collection city'},<br/>
    ${order.dispatchMethod === 'Delivery' ? order.shippingAddress.country: 'Collection Country'},<br/>
    ${order.dispatchMethod === 'Delivery' ? order.shippingAddress.postalCode: 'Collection postcode'}<br/>
    </p>
    <hr/>
    <p>
    Thanks for shopping with us.
    </p>
    <h2>${userIsGuest === true ? 'We have created a guest account for you to see your order.'  : ''}</h2>
    <p>${userIsGuest === true ? 'Use the link below to navigate back to the site and add your password'  : ''}</p>
    ${userIsGuest === true ? `<a href=${baseUrl()}/profile>Click the following link</a>` : ''}
    `;
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(401).send({ message: 'Invalid Admin Token' });
    }
};