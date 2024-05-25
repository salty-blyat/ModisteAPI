const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(cors());

// Import routes
const usersRoutes = require('./routes/userRoutes');
const productsRoutes = require('./routes/productRoutes');
const cartsRoutes = require('./routes/cartRoutes');
const reviewsRoutes = require('./routes/reviewRoutes');
const operationsRoutes = require('./routes/operationRoutes');
app.use(bodyParser.json());


app.use('/api', usersRoutes);
app.use('/api', productsRoutes);
app.use('/api', cartsRoutes);
app.use('/api', reviewsRoutes);
app.use('/api', operationsRoutes);

// Use process.env.PORT if available, otherwise use port 3000
const port = 4000;

app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});

module.exports = app;