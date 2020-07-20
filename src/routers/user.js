const express=require('express')
const router=new express.Router()
const User=require('../models/user')
const auth=require('../middleware/auth')
const multer=require('multer')
const sharp=require('sharp')
const { sendWelcomeEmail,sendCancelationEmail }=require('../emails/account')
router.post('/users',async (req,res)=>{
    const user=new User(req.body)
    try{
        await user.save()//if it resolves
        console.log('hello')
       //if user us created generate an authentication token
       sendWelcomeEmail(user.email,user.name)
        const token=await user.getauthtoken() 
        res.status(201).send({user,token})
    }
    catch(e)
    {//if it rejects
        console.log('no')
     res.status(400).send(e)
          
    }
    
 })
 router.post('/users/login',async (req,res)=>{
     try{
         const user=await User.findByCredentials(req.body.email,req.body.password)
         const token=await user.getauthtoken()
         
        await res.send({user,token})
     }
     catch(e)
     {
          res.status(400).send()
     }
 })
 router.post('/users/logout',auth,async (req,res)=>{
     try{
      req.user.tokens=req.user.tokens.filter((token)=>{
          return token.token!==req.token
      })
      await req.user.save()

      res.send()
     }catch(e){
            res.status(500).send()
     }
 })
 router.post('/users/logoutall',auth,async (req,res)=>{
     try{
      req.user.tokens=req.user.tokens.filter((token)=>{
          return token.token===req.token
      })
      req.user.tokens.pop();
      req.user.save()
      res.send()
     }catch(e){
          res.status(500).send()
     }
 })
 
 
 router.get('/user/me',auth,async (req,res)=>{
   res.send(req.user)
 })
 router.patch('/users/me',auth,async (req,res)=>{
     const allowupdates=['name','email','password','age']
     const updates=Object.keys(req.body)
     const isvalid=updates.every((update)=> allowupdates.includes(update))
     if(!isvalid)
     {
         return res.status(400).send({error:'Invalid updates'})
     }
     try{
        updates.forEach((update)=>req.user[update]=req.body[update])
        //  const user=await User.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        await req.user.save()
         res.send(req.user)
     }
     catch(e)
     {//promise will rejectif it doesnt fit against validators or database ssue
         res.send(e)
     }
 })
 router.delete('/users/me',auth,async (req,res)=>{
   try{
     await req.user.remove()
           
     sendCancelationEmail(req.user.email,req.user.name)
       res.send(req.user)
   }  
   catch(e){
       res.status(500).send(e)
   }
 })
 
 const upload=multer({
    
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb)
    {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        {
            return cb(new Error('Please upload a valid image'))
        }
        return cb(undefined,true)
    }
})
router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{
   const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar=buffer
   req.user.save() 
   res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})
router.delete('/users/me/avatar',auth,async (req,res)=>{
req.user.avatar=undefined
await req.user.save()
res.send()
})
router.get('/users/:id/avatar',async (req,res)=>{
    try{
          const user=await User.findById(req.params.id)
          if(!user || !user.avatar)
          {
              throw new Error()
          }
          res.set('Content-type','image/png')
          res.send(user.avatar)
    }
    catch(e){
        res.status(400).send()
    }
})

module.exports=router