// const mongodb=require('mongodb')
// const MongoClient=mongodb.MongoClient
const{MongoClient,ObjectID}=require('mongodb')

const connectionUrl='mongodb://127.0.0.1:27017'
const databaseName='task-manager'
// const id=new ObjectID()
// console.log(id.id.length)
// console.log(id.toHexString().length)
MongoClient.connect(connectionUrl,{useNewUrlParser:true,useUnifiedTopology:true},(error,client)=>{
    if(error)
    {
        return console.log('Unable to connect to Database')
    }
     const db=client.db(databaseName)
    //  db.collection('users').findOne({_id:new ObjectID("5eea3ee0bcbcab7fe1a864ca")},(error,result)=>{
    //      if(error)
    //      {
    //          return console.log('Unable to fetch')
    //      }
    //      console.log(result);
    //  })
   
    // 
     db.collection('tasks').updateMany({
        completed:false
    },{
        $set:{
            completed:true
        }
    }).then((result)=>{
        console.log(result)
    }).catch((error)=>{
        console.log(error)
    })
    db.collection('users').deleteMany({
        age:18
    }).then((result)=>{
        console.log(result)
    }).catch((error)=>{
        console.log(error)
    })
    db.collection('tasks').deleteOne({
        description:"This is task1"
    }).then((result)=>{
        console.log(result)
    }).catch((error)=>{
        console.log(erorr)
    })

})
