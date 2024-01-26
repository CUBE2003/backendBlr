const User = require('../model/User');
const CryptoJs = require('crypto-js');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

module.exports = {
    // createUser: async (req, res) => {
    //     const user = req.body;

    //     try {
    //         await admin.auth().getUserByEmail(user.email);
    //         return res.status(400).json({ message: 'Email already exists' });
    //     } catch (error) {
    //         if (error.code === 'auth/user_not_found') {
    //             try {
    //                 const userResponse = await admin.auth().createUser({
    //                     email: user.email,
    //                     emailVerified: false,
    //                     disabled: false,
    //                     password: user.password
    //                 })
    //                 console.log(userResponse.uid);

    //                 const newUser = await new User({
    //                     uid: userResponse.uid,
    //                     username: user.username,
    //                     email: user.email,
    //                     password: CryptoJs.AES.encrypt(user.password, process.env.SECRET).toString(),
    //                 })

    //                 await newUser.save();
    //                 res.status(201).json({ status: true });
    //             } catch (error) {
    //                 res.status(500).json({ error: 'An arror occured while creating an account' })
    //             }
    //         }
    //     }
    // },

    // createUser: async (req, res) => {
    //     const user = req.body;
    
    //     try {
    //         const existingUser = await admin.auth().getUserByEmail(user.email);
    //         return res.status(400).json({ message: 'Email already exists' });
    //     } catch (error) {
    //         if (error.code === 'auth/user-not-found') {
    //             try {
    //                 const userResponse = await admin.auth().createUser({
    //                     email: user.email,
    //                     emailVerified: false,
    //                     disabled: false,
    //                     password: user.password
    //                 });
    //                 console.log('Firebase user created, UID:', userResponse.uid);
    
    //                 const newUser = await new User({
    //                     uid: userResponse.uid,
    //                     username: user.username,
    //                     email: user.email,
    //                     password: CryptoJs.AES.encrypt(user.password, process.env.SECRET).toString(),
    //                 });
    
    //                 console.log('Saving user data to MongoDB:', newUser);
    //                 await newUser.save();
    //                 console.log('User data saved to MongoDB');
    //                 res.status(201).json({ status: true });
    //             } catch (error) {
    //                 console.error('Error creating account:', error);
    //                 res.status(500).json({ error: 'An error occurred while creating an account' });
    //             }
    //         } else {
    //             console.error('Unexpected error:', error);
    //             res.status(500).json({ error: 'An unexpected error occurred' });
    //         }
    //     }
    // },
    createUser: async (req, res) => {
        const user = req.body;

        try {
            // Check if the email already exists in Firebase Authentication
            const existingUser = await admin.auth().getUserByEmail(user.email);
            return res.status(400).json({ message: 'Email already exists' });
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                try {
                    // Create the user in Firebase Authentication
                    const userResponse = await admin.auth().createUser({
                        email: user.email,
                        emailVerified: false,
                        disabled: false,
                        password: user.password
                    });

                    console.log('Firebase user created, UID:', userResponse.uid);

                    // Create a new User document in MongoDB
                    const newUser = new User({
                        uid: userResponse.uid,
                        username: user.username,
                        email: user.email,
                        password: CryptoJs.AES.encrypt(user.password, process.env.SECRET).toString(),
                    });

                    try {
                        // Attempt to save the new user in MongoDB
                        await newUser.save();
                        console.log('User data saved to MongoDB');
                        res.status(201).json({ status: true });
                    } catch (saveError) {
                        // Handle duplicate key error for username
                        if (saveError.code === 11000 && saveError.keyPattern && saveError.keyPattern.username === 1) {
                            console.error('Duplicate username:', user.username);
                            res.status(400).json({ error: 'Username already taken' });
                        } else {
                            // Handle other save errors
                            console.error('Error saving user data to MongoDB:', saveError);
                            res.status(500).json({ error: 'An error occurred while creating an account' });
                        }
                    }
                } catch (createError) {
                    // Handle errors during user creation in Firebase
                    console.error('Error creating account:', createError);
                    res.status(500).json({ error: 'An error occurred while creating an account' });
                }
            } else {
                // Handle unexpected errors
                console.error('Unexpected error:', error);
                res.status(500).json({ error: 'An unexpected error occurred' });
            }
        }
    },

    loginUser: async (req, res) => {
        try {
            console.log('Login attempt for email:', req.body.email);
    
            // Look up user in MongoDB
            const user = await User.findOne({ email: req.body.email },
                { _v: 0, createdAt: 0, updatedAt: 0, skills: 0, email: 0 });

                
    
            if (!user) {
                console.log('User not found for email:', req.body.email);
                return res.status(400).json({
                    message: 'User not found'
                });
            }
    
            // Decrypt the stored password and compare with the provided password
            const decryptedPassword = CryptoJs.AES.decrypt(user.password, process.env.SECRET);
            const depassword = decryptedPassword.toString(CryptoJs.enc.Utf8);
    
            if (depassword !== req.body.password) {
                console.log('Invalid password for email:', req.body.email);
                return res.status(400).json({ message: 'Invalid password' });
            }
    
            // Create a JWT token for the user
            const userToken = jwt.sign({
                id: user._id,
                isAdmin: user.isAdmin,
                isAgent: user.isAgent,
                uid: user._id,
            }, process.env.JWT_SEC, { expiresIn: '21d' });
    
            console.log('Login successful for email:', req.body.email);
            
            // Return user data (excluding sensitive information) and the token
            const { password, isAdmin, ...others } = user._doc;
            res.status(200).json({ ...others, userToken });
        } catch (error) {
            console.error('Error during login:', error);
            res.status(500).json({ error: 'An error occurred while logging in' });
        }
    }
    

}


