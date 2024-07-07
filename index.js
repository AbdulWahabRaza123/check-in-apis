require('dotenv').config();
const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const { specs, swaggerUi } = require('./config/swagger');
var cors = require('cors')

const userRoutes = require('./routes/userRoutes');
const venueRoutes = require('./routes/venueRoutes');

const port = process.env.PORT || 3000;
const path = require('path');
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";


dotenv.config();

const app = express();
app.use(cors())
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use('/api/users', userRoutes);
app.use('/api/venues', venueRoutes);


app.use('/api-docs', express.static('node-modules/swagger-ui-dist/',
    { index: false }), swaggerUi.serve, swaggerUi.setup(specs,{ customCssUrl: CSS_URL }));
    app.use('/api-docs', express.static(path.join(__dirname, 'swagger-ui')));
  app.use('/api/v1/user', userRoutes);
  

app.get('/', (req, res) => {
    res.send("Hello, world!. This is check-in app's backend");
  });

const PORT = process.env.PORT || 5000;

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
