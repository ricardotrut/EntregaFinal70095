const { Router } = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = Router();


router.get('/', async (req, res) => {
    try {
        const carts = await Cart.find().populate('products.product');
        res.render('carts', { carts });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await Cart.findById(cartId).populate('products.product');
        if (cart) {
            res.render('cartDetails', { cart });
        } else {
            res.status(404).json({ error: 'Carrito no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


router.post('/products/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;

       
        let cart = await Cart.findOne();
        if (!cart) {
            cart = new Cart({ products: [] });
            await cart.save();
        }

     
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

      
        const productInCart = cart.products.find(p => p.product.toString() === productId);
        if (productInCart) {
            productInCart.quantity += 1;
        } else {
            cart.products.push({ product: productId, quantity: 1 });
        }

        await cart.save();

        res.status(200).json({ message: 'Producto agregado al carrito' });  
    } catch (error) {
        res.status(400).json({ error: 'Error al agregar el producto al carrito' });
    }
});


router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        const productInCart = cart.products.find(p => p.product.toString() === productId);
        if (!productInCart) {
            return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }

        
        productInCart.quantity -= 1;

        
        if (productInCart.quantity <= 0) {
            cart.products = cart.products.filter(p => p.product.toString() !== productId);
        }

        await cart.save();

        res.redirect(`/carts/${cartId}`); 
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


router.delete('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;

        const cart = await Cart.findByIdAndDelete(cartId);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        res.redirect('/carts');  
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

module.exports = router;
