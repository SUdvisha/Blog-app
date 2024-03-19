//create express app
const exp=require('express');
const app=exp()
require('dotenv').config()//process.env.PORT
const mongoClient=require('mongodb').MongoClient;
const path=require('path')
//deploy react build in this server
app.use(exp.static(path.join(__dirname,"../client/my-app/build")))

//to parse the body
app.use(exp.json())
mongoClient.connect(process.env.DB_URL)
.then(client=>{
    const blogdb=client.db('blogdb')
    const userscollection=blogdb.collection('userscollection');
    const articlescollection=blogdb.collection('articlescollection');
    const authorscollection=blogdb.collection('authorscollection');
    const adminscollection=blogdb.collection('adminscollection');
    app.set('userscollection',userscollection)
    app.set('articlescollection',articlescollection)
    app.set('authorscollection',authorscollection)
    app.set('adminscollection',adminscollection)
    

    //confirm connection
    console.log("Db connection success");

})
.catch(err=>console.log("err in DB connection",err))

//if path start with user-api 
const userApp=require('./APIs/user-api');
const authorApp=require('./APIs/author-api');
const adminApp=require('./APIs/admin-api');

app.use('/user-api',userApp)
app.use('/author-api',authorApp)
app.use('/admin-api',adminApp)
//deals with page refresh 
app.use((req,res,next)=>
    {
        res.sendFile(path.join(__dirname,'../client/my-app/build/index.html'))

    })


//express error handler
app.use((err,req,res,next)=>{
    res.send({message:"error",payload:err.message})
})



const port=process.env.PORT || 5000;
//assign port number
app.listen(port,()=>console.log(`web server on port ${port}`))