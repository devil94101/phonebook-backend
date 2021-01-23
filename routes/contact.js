
const  db  = require('../Schema/dbSchema')

var router=require('express').Router()

var auth=require('../middleware/auth');

const jwt=require('jsonwebtoken')


const validateEmail=(email)=>{
    const emailToValidate = 'a@a.com';
    const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return(emailRegexp.test(email))
}

router.get("/",(req,res)=>{
    res.send("router home")
})

router.post('/addMany',auth,async(req,res)=>{
    const data=req.body;
    await db.insertMany(data)
    res.send('done')
})


router.post('/getToken',async(req,res)=>{
    let {email,name}=req.body;
    if(!email||!name){
        return(res.send({err:true,message:"email and name are required to generate a token"}))
    }
    if(!validateEmail(email)){
        return(res.send({err:true,message:"invalid email"}))
    }
    try{
        const payload={
            name,email
        }
        jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn:'1d'
        },(err,token)=>{
            if(err)throw err
            res.json({
                res:"success use this token to authenticate to api",
                token
            })
        })
    }   
    catch(err){
        res.send({
            err:true,
            msg:err.message
        });
    }
})

router.post('/addContact',auth,async(req,res)=>{
    const {name,email,phone}=req.body;
    console.log(phone)
    if(!name||!email){
        res.send({err:true,
            message:"email and name are required fields"
        })
    }
    else if(phone&&(isNaN(phone)||phone.length!==10)){
        res.send({err:true,
            message:"phone number should be of 10 digit and should be number"
        })
    }
    else if(!validateEmail(email)){
        res.send({err:true,message:"invalid Email"})
    }
    else{
        const data=await db.findOne({email});
        if(data&&data._id!==req.params.id){
            res.send({err:true,message:"email already exist choose another! "})
        }
        else{
            try{
                const contact= new db({
                    name,email,phone
                })
                await contact.save()
                res.send({
                    err:false,
                    id:contact._id,
                    message:"successfully added the contact"
                })
            }
            catch(err){
                res.send({err:true,message:err.message})
            }
        }
    }
})


router.put('/updateContact/:id',auth,async(req,res)=>{

    const {name,email,phone}=req.body;
    if(!name&&!email&&!phone){
        res.send({err:true,
            message:"Nothing to update"
        })
    }
    else if(phone&&(isNaN(phone)||phone.length!==10)){
        res.send({err:true,
            message:"phone number should be of 10 digit and should be number"
        })
    }
    else if(email&&!validateEmail(email)){
        res.send({err:true,message:"Invalid email !"})
    }
    else{
        if(email){
            const data=await db.findOne({email});
            if(data&&data._id!=req.params.id){
               return res.send({err:true,message:"email already exist choose another! "})
            }
        }
        try{
            const data={}
            if(name){
                data['name']=name;
            }
            if(email){
                data['email']=email
            }
            if(phone){
                data['phone']=phone
            }
            await db.findByIdAndUpdate(req.params.id,data)
            res.send({err:false,message:"successfully updated data"})
        }
        catch(err){
            res.send({err:true,message:"invalid id or check your internet"})
        }
    }
})

router.delete('/deleteContact/:id',auth,async(req,res)=>{
    try{
        await db.findByIdAndDelete(req.params.id)
        res.send({err:true,message:"contact deleted successfully"})
    }
    catch(err){
        res.send({err:true,message:"invalid id or check your internet"})
    }
})

router.get('/allContacts/:page?',auth,async (req,res)=>{
    const pageOptions = {
        page: parseInt(req.params.page, 10) || 0,
        limit: 10
    }
    const count=await db.count({})
    db.find()
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .exec(function (err, doc) {
        if(err) { res.status(500).json(err.message); return; };
        res.status(200).json({data:doc,count});
    });
})


router.get('/search/:search_term?/:page?',auth,async function(req, res){
    console.log(req.params)
	search_term = req.params.search_term || '';
	search_term = search_term.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")
    searchregex = new RegExp(".*" + search_term + ".*", "i");

    const pageOptions = {
        page: parseInt(req.params.page, 10) || 0,
        limit: 10
    }
    const page=req.params.page
    const count=await db.count({ $or: [{name: searchregex},{email: searchregex}]})
    db.find({ $or: [{name: searchregex},{email: searchregex}]})
    .skip(pageOptions.page * pageOptions.limit)
    .limit(pageOptions.limit)
    .exec(function (err, contact) {
        if(contact.length <= 0) {
			res.json({ data: [] ,count:0});
		}
		else {
			if (err)
				res.json({ data: [] ,count:0});
			else
				res.json({data:contact,count});
		}
    });
});
router.get('/getContactDetail/:id',async(req,res)=>{
    const data=await db.findById(req.params.id)
    res.send(data)
})

module.exports=router;