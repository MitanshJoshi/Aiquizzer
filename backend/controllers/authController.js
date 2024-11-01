const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');


exports.login = async (req, res) => {
  const { username, password } = req.body;
  let user = await User.findOne({ username });

  if (!user) {
    return res.json({
      Status:400,
      message:"User not registered"
    })
  } else if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.password;

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({message:"Login successful", token, user: userWithoutPassword });
};

exports.getUser=async(req, res)=>{
  const token = req.headers.authorization?.split(" ")[1];  
  if(!token)
  {
    return res.json({
      status:400,
      message:"No token provided"
    })
  }
  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    console.log('decoded',decoded);
    const user = await User.findById(decoded.userId).select("-password");
    if(!user)
    {
      return res.json({
        status:400,
        message:"User not found",
      })
    }

    return res.json({user});
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

exports.register = async (req, res) => {
  const { username, password, email } = req.body;
  let user = await User.findOne({ username });

  if(user)
  {
    return res.json({
      status:"400",
      message:"User already registered"
    })
  }

  else{
    user = new User({
      username,
      email, 
      password: bcrypt.hashSync(password, 10), 
    });
    await user.save();
  } 
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({user, token,message:"Registration successful" });
};
