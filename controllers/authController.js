const User = require('../model/User');
const CryptoJs = require('crypto-js');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { use } = require('../routes/job');

module.exports = {
    createUser: async (req, res) => {
        const user = req.body;

        try {
            await admin.auth().getUserByEmail(user.email);
            return res.status(400).json({ message: 'Email already exists' });
        } catch (error) {
            if (error.code === 'auth/user_not_found') {
                try {
                    const userResponse = await admin.auth().createUser({
                        email: user.email,
                        emailVerified: false,
                        disabled: false,
                        password: user.password
                    })
                    console.log(userResponse.uid);

                    const newUser = await new User({
                        uid: userResponse.uid,
                        username: user.username,
                        email: user.email,
                        password: CryptoJs.AES.encrypt(user.password, process.env.SECRET).toString(),
                    })

                    await newUser.save();
                    return res.status(201).json({ status: true });
                } catch (error) {
                    res.status(500).json({ error: 'An arror occured while creating an account' })
                }
            }
        }
    },

    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email }, { _v: 0, createdAt: 0, updatedAt: 0, skills: 0, email: 0 });
    
            if (!user) {
                return res.status(400).json({
                    message: 'User not found'
                });
            }
    
            const decryptedPassword = CryptoJs.AES.decrypt(user.password, process.env.SECRET);
            const depassword = decryptedPassword.toString(CryptoJs.enc.Utf8);
    
            if (depassword !== req.body.password) {
                return res.status(400).json({ message: 'Invalid password' });
            }
    
            const userToken = jwt.sign({
                id: user._id,
                isAdmin: user.isAdmin,
                isAgent: user.isAgent,
                uid: user._id,
            }, process.env.JWT_SEC, { expiresIn: '21d' });
    
            const { password, isAdmin, ...others } = user._doc;
    
            res.status(200).json({ ...others, userToken });
    
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while logging in' });
        }
    }
    
}
