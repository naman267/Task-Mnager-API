const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const e = require('express')
const jwt=require('jsonwebtoken')
const task = require('./task')
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        validate(value){
            if(!validator.isEmail(value))
            {
                throw new Error('Invalid email')
            }

        },
        lowercase:true,
        trim:true
    },
    age:{
        type:Number,
        default:0,
        validate(val){
                 if(val<0)
                 {
                     throw new Error('Age must be a positive no')
                 }
         }
    },
    password:{
        type:String,
        required:true,
        minlength:7,
        trim:true,
        validate(val)
        {
            if(val.includes('password'))
            {
                throw new Error('Password should not contain word password')
            }
        }

    },
    avatar:{
       type:Buffer
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
},{
    timestamps:true
})
userSchema.virtual('tasks',{
    ref:'task',
    localField:'_id',
    foreignField:'owner'
})
userSchema.methods.toJSON=function(){
    const user=this
     const usermethod=user.toObject()
    delete usermethod.password
    delete usermethod.tokens
    delete usermethod.avatar
    return usermethod
    // console.log(usermethod)
    // return user
}
userSchema.methods.getauthtoken=async function(){

    const user=this
    const token=jwt.sign({_id:user.id.toString()},process.env.JWT_SECRET)
    user.tokens=user.tokens.concat({token})
    await user.save()
    return token
}
userSchema.statics.findByCredentials=async (email,password)=>{
    const user=await User.findOne({email})
    if(!user)
    {
        throw new Error('Unable to login')
    }
    const ismatch=await bcrypt.compare(password,user.password)
    if(!ismatch)
    {
        throw new Error('Unable to login')
    }
    return user

}
//hashed password
userSchema.pre('save',async function(next){
    const user=this
    if(user.isModified('password'))
    {
        user.password=await bcrypt.hash(user.password,8)
    }

    next()
})
//delete task with user
userSchema.pre('remove',async function (next){
    const user=this
    await task.deleteMany({owner:user._id})
    next()

})
const User=mongoose.model('User',userSchema)

 module.exports=User