const { Router } = require('express');
const Product = require('../models/Product');
const Cart = require('../models/Cart'); 

const router = Router();


router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, category, status } = req.query;

     
        let filter = {};
        if (category) {
            filter.category = category;
        }
        if (status !== undefined && status !== '') {
            filter.status = status === 'true';
        }

    
        let sortOption = {};
        if (sort) {
            sortOption.price = sort === 'asc' ? 1 : -1;
        }


        const products = await Product.find(filter)
            .sort(sortOption)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        
        const defaultCart = await Cart.findOne(); 
        const cartId = defaultCart ? defaultCart._id : null;

       // Objeto
        const responseObject = {
            status: 'success',
            payload: products,
            totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? parseInt(page) + 1 : null,
            page: parseInt(page),
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevLink: page > 1 ? `/products?limit=${limit}&page=${page - 1}&sort=${sort}&category=${category}&status=${status}` : null,
            nextLink: page < totalPages ? `/products?limit=${limit}&page=${parseInt(page) + 1}&sort=${sort}&category=${category}&status=${status}` : null,
        };

        // imprimer esos estatus
        console.log(responseObject);

        
       res.render('index', {
            title: 'Lista de Productos',
            products: products,
            cartId, 
            totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? parseInt(page) + 1 : null,
            page: parseInt(page),
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevLink: page > 1 ? `/products?limit=${limit}&page=${page - 1}&sort=${sort}&category=${category}&status=${status}` : null,
            nextLink: page < totalPages ? `/products?limit=${limit}&page=${parseInt(page) + 1}&sort=${sort}&category=${category}&status=${status}` : null,
            category,
            status,
            sort,
            limit,
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});


router.get('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await Product.findById(productId);
        if (product) {
            const defaultCart = await Cart.findOne(); 
            const cartId = defaultCart ? defaultCart._id : null;
            res.render('productDetails', { product: product.toObject(), cartId });
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
});

module.exports = router;
