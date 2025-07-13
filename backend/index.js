const express = require('express');
const app = express();
const {DBConnection} = require("./database/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

DBConnection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/", (req, res) => {
    res.send("Hello World is commming from backend!!");
});

app.post("/register", async (req, res) => {
    try {
        //get all the data from frontend
        console.log('BODY:', req.body);
        const {firstName, lastName, email, password} = req.body;
        
        //Validate the data
        if(!(firstName && lastName && email && password)){
            res.status(400).send("Please enter all the information");
        }

        //check if the user already exists
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).send("User Already Exists with the same email!!!");
        }

        //Hashing/encrypt the password
        var hashedPassword = await bcrypt.hash(password, 3);

        //save the user to DB
        const user = await User.create({
            firstName,
            lastName,
            email,
            password : hashedPassword
        });

        //generate the token for the user and send it
        //_id is the format how id is created in MONGO DB
        const token = jwt.sign({id:user._id, email}, process.env.SECRET_KEY, {
            expiresIn : '1h'
        });
        user.token = token;
        user.password = undefined;
        res.status(200).json({message: "You have successfully Registered!!!", user});
    
    } catch (error) {
        console.log("Exception in creating the user", error);
    }
});
app.get("/anything", (req, res) => {
    res.send("Hey anytings how are you....");
});

app.listen(5000, () => {
    console.log(`Server is listening on port 5000`);
});

//Mongdp cluster 27017