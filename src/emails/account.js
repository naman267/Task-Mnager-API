const sgmail=require('@sendgrid/mail')

sgmail.setApiKey(process.env.SENDGRID_API_KEY)
const sendWelcomeEmail=(email,name)=>{
1
sgmail.send({
    to:email,
    from:'namanb139j@gmail.com',
    subject:'This is my first creation',
    text:`Welcome to the App ${name}.Let me KNow how you get along with our App`
})
}
const sendCancelationEmail=(email,name)=>{
    sgmail.send({
        to:email,
        from:'namanb139j@gmail.com',
        subject:'Un-registering the Task-App',
        text:`Why are you unregistering${name} our app please let us know so that we can improve`
    })
}
module.exports={
    sendWelcomeEmail,
    sendCancelationEmail
}