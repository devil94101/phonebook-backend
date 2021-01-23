var express=require("express")
var app=express();
var mongoose=require("mongoose")
var bodyParser=require('body-parser')
var dotenv=require('dotenv').config()

var ContactRouter=require('./routes/contact')

var PORT=process.env.PORT||5000;
var cors =require('cors')

const uri = process.env.URI;
mongoose.connect(uri, {
    useNewUrlParser: true,
    useFindAndModify:false,
   useUnifiedTopology: true  }).then(()=>{
       console.log("database connected..")
   }).catch(err=>console.log(err))

   
app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({extended:false}))


app.use("/api",ContactRouter)

app.get('/',(req,res)=>{
    res.send("hello")
})
app.use((req,res)=>{
    res.send("page not found");
})

app.listen(PORT,(err=>{
    if(err) console.log("server err")
    else console.log("listening on port",PORT);
}))