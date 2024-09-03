const dotenv = require('dotenv'); 
const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const path = require('path');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/carts');
const { Server } = require('socket.io');
const http = require('http');
const methodOverride = require('method-override'); 


dotenv.config(); 

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const hbs = exphbs.create({
    helpers: {
        eq: (a, b) => a === b
    },
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    }   
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method')); 


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Conexión a MongoDB Atlas exitosa');
    })
    .catch((err) => {
        console.error('Error al conectar con MongoDB Atlas:', err);
    });

app.use('/products', productRoutes);
app.use('/carts', cartRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: 'Agregar Productos' });
});

io.on('connection', async (socket) => {
    console.log('Usuario conectado');

    const Product = require('./models/Product');
    
    const products = await Product.find();
    socket.emit('products', products);

    socket.on('newProduct', async (productData) => {
        const newProduct = new Product(productData);
        await newProduct.save();
        const updatedProducts = await Product.find();
        io.emit('products', updatedProducts);
    });

    socket.on('deleteProduct', async (productId) => {
        await Product.findByIdAndDelete(productId);
        const updatedProducts = await Product.find();
        io.emit('products', updatedProducts);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

server.listen(8080, () => {
    console.log('Servidor escuchando en el puerto 8080');
});
