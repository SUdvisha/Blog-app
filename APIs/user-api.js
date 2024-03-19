//create user api app
const exp=require('express');
const userApp=exp.Router();
const bcryptjs=require('bcryptjs')
const expressAsyncHandler=require('express-async-handler')
const jwt=require('jsonwebtoken')
const verifyToken=require('../Middlewares/verifyToken')
require('dotenv').config()
let usercollection;
//get usercollection App 
let articlescollection;
userApp.use((req,res,next)=>{
    usercollection=req.app.get('userscollection');
    articlescollection = req.app.get("articlescollection");
    next()
});

//user registration router

userApp.post('/user',expressAsyncHandler(async(req,res)=>{
    //get user resource from client
    const newUser=req.body;
    //checking duplicate user with username
    const dbuser=await usercollection.findOne({username:newUser.username})
    if(dbuser!==null){
        res.send({message:"user existed"})
    }else{
        //hash password
        //replace with plain password
        //create user
        const hashedPassword=await bcryptjs.hash(newUser.password,6)
        newUser.password=hashedPassword;
        await usercollection.insertOne(newUser)
        res.send({message:"user created"})
    }
}))

//user login
userApp.post('/login',expressAsyncHandler(async(req,res)=>{
    const userCred=req.body;
    //check for user
    //check for password
    //create jwt
    //send res
    const dbuser=await usercollection.findOne({username:userCred.username})
    if(dbuser===null){
        res.send({message:"Invalid username"})
    }else{
        const status=await bcryptjs.compare(userCred.password,dbuser.password)
        if(status===false){
            res.send({message:"Invalid password"})
        }else{
            const signedToken=jwt.sign({username:dbuser.username},process.env.SECRET_KEY,{expiresIn:20})
            res.send({message:"Login success",token:signedToken,user:dbuser})


        }

    }
}))
//get all articles
userApp.get('/articles',verifyToken,expressAsyncHandler(async(req,res)=>{
    const articlescollection=req.app.get('articlescollection')
    //get all articles
    let articlesList=await articlescollection.find({status:true}).toArray()
    res.send({message:"articles",payload:articlesList})

}))
//write comments
userApp.post(
    "/comment/:articleId",verifyToken,
    expressAsyncHandler(async (req, res) => {
      //get user comment obj
      const userComment = req.body;
      const articleIdFromUrl=req.params.articleId;
      //insert userComment object to comments array of article by id
      let result = await articlescollection.updateOne(
        { articleId: articleIdFromUrl},
        { $addToSet: { comments: userComment } }
      );
      console.log(result);
      res.send({ message: "Comment posted" });
    })
  );




module.exports=userApp