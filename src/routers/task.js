const express=require('express')
const router=new express.Router()
const task=require('../models/task')
const auth=require('../middleware/auth')
router.post('/tasks',auth,async (req,res)=>{
    const Task=new task(
        {...req.body,
        owner:req.user._id
        }
    )
    try{
        await Task.save()
        res.send(Task)
    }
    catch(e){
        res.status(404).send(e)
    }
    
})

router.get('/tasks',auth,async (req,res)=>{
     const match={}
     const sort={}
     if(req.query.sortBy)
     {
         const parts=req.query.sortBy.split(':')
         sort[parts[0]]=parts[1]==='desc'?-1:1
     }
     if(req.query.completed)
     {
         match.completed=req.query.completed==='true'
     }
    try{
        //const users=await task.find({owner:req.user._id})
        await req.user.populate({
        path:'tasks',
        match,
        options:{
            limit:parseInt(req.query.limit),
            skip:parseInt(req.query.skip),
            sort
        }
    }).execPopulate()
        res.send(req.user.tasks)
        //res.send(users)
    }catch(e){
        res.status(500).send(e)
    }
   
})
router.get('/tasks/:id',auth,async (req,res)=>{
    const _id=req.params.id
    try{
        //const user=await task.findById(_id)
        const user=await task.findOne({_id,owner:req.user._id})
        if(!user)
        {
         return    res.status(404).send()
        }
        res.send(user)

    }
    catch(e)
    {
        res.staus(500).send(e)
    }
   
})
router.patch('/tasks/:id',auth,async (req,res)=>{
    const allowed=['description','completed']
    const updates=Object.keys(req.body)
    const isvalid=updates.every((update)=>allowed.includes(update))
    if(!isvalid)
     {
         return res.status(400).send({error:"Invalid update"})
     }
     try{
        //  const tasks=await task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
        const tasks=await task.findOne({_id:req.params.id,owner:req.user._id})
       
         if(!tasks)
         {
                  return res.status(404).send()
         }
         updates.forEach((update)=>tasks[update]=req.body[update])
         await tasks.save()
         res.send(tasks)
     }
     catch(e)
     {
         res.status(404).send(e)
     }
})
router.delete('/tasks/:id',auth,async (req,res)=>{
    try{
        const user=await task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if(!user)
        {
            return res.status(404).send()
        }
        res.send(user)
    }
    catch(e){
        res.status(500).send()
    }
})
module.exports=router