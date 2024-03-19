const exp=require('express');
const authorApp=exp.Router();
const bcryptjs=require('bcryptjs')
const expressAsyncHandler=require('express-async-handler')
const jwt=require('jsonwebtoken')
const verifyToken=require('../Middlewares/verifyToken')
require('dotenv').config()
let authorscollection;
let articlescollection;
//get authorcollection App
authorApp.use((req,res,next)=>{
    authorscollection=req.app.get('authorscollection');
    articlescollection=req.app.get('articlescollection')
    next()
})
//author registration router
authorApp.post('/author',expressAsyncHandler(async(req,res)=>{
    //get user resource from client
    const newAuthor=req.body;
    //checking duplicate user with username
    const dbauthor=await authorscollection.findOne({username:newAuthor.username})
    if(dbauthor!==null){
        res.send({message:"author existed"})
    }else{
        //hash password
        //replace with plain password
        //create user
        const hashedPassword=await bcryptjs.hash(newAuthor.password,6)
        newAuthor.password=hashedPassword;
        await authorscollection.insertOne(newAuthor)
        res.send({message:"author created"})
    }
}))
//author login
authorApp.post('/login',expressAsyncHandler(async(req,res)=>{
    const authorCred=req.body;
    //check for user
    //check for password
    //create jwt
    //send res
    const dbauthor=await authorscollection.findOne({username:authorCred.username})
    if(dbauthor===null){
        res.send({message:"invalid authorname"})
    }else{
        const status=await bcryptjs.compare(authorCred.password,dbauthor.password)
        if(status===false){
            res.send({message:"invalid password"})
        }else{
            const signedToken=jwt.sign({username:dbauthor.username},process.env.SECRET_KEY,{expiresIn:20})
            res.send({message:"Login success",token:signedToken,user:dbauthor})


        }

    }

}))


//adding new article by author
authorApp.post('/article',verifyToken,expressAsyncHandler(async(req,res)=>{
    //get new article from client
    const newArticle=req.body;
    //post to artciles collection
    console.log(newArticle)
    await articlescollection.insertOne(newArticle)
    //send res
    res.send({message:"New article created"})
}))
//modify artcile by author
authorApp.put('/article',verifyToken,expressAsyncHandler(async(req,res)=>{
    //get modified article from client
    const modifiedArticle=req.body;
    //update by article id
   let result= await articlescollection.updateOne({articleId:modifiedArticle.articleId},{$set:{...modifiedArticle}})
    res.send({message:"Article modified"})
}))
//delete an article by article ID
authorApp.put('/article/:articleId',verifyToken,expressAsyncHandler(async(req,res)=>{
    //get articleId from url
    const artileIdFromUrl=(+req.params.articleId);
    //get article 
    const articleToDelete=req.body;

    if(articleToDelete.status===true){
       let modifiedArt= await articlescollection.findOneAndUpdate({articleId:artileIdFromUrl},{$set:{...articleToDelete,status:false}},{returnDocument:"after"})
       res.send({message:"article deleted",payload:modifiedArt.status})
    }
    if(articleToDelete.status===false){
        let modifiedArt= await articlescollection.findOneAndUpdate({articleId:artileIdFromUrl},{$set:{...articleToDelete,status:true}},{returnDocument:"after"})
        res.send({message:"article restored",payload:modifiedArt.status})
    }
   
   
}))

//read articles of author
authorApp.get('/articles/:username',verifyToken,expressAsyncHandler(async(req,res)=>{
    //get author's username from url
    const username=req.params.username;
    //get atricles whose status is true
    const artclesList=await articlescollection.find({username:username}).toArray()
    res.send({message:"List of atricles",payload:artclesList})
}))

module.exports=authorApp