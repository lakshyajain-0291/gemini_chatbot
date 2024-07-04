// //import required modules
// import express from 'express';
// import axios from 'axios';
// import bodyParser from 'body-parser';
// import dotenv from 'dotenv';
// import {GoogleGenerativeAI} from '@google/generative-ai';

// //configure env to load environment variables
// dotenv.config();

// //Initialize Express App
// const app=express();
// const PORT = process.env.PORT || 3000;

// //Middleware to parse JSON request body
// app.use(bodyParser.json());

// // Initialize the Google Generative AI with the API key from environment variables
// const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// //In -memory Object to store session context
// const sessionContexts={};

// //Endpoitn to handle chat requests
// app.post('/chat',async(req,res)=>{
//     const{userId,message} =req.body;

//     //Initializing the context for the user if it doesn't exist

//     if(!sessionContexts[userId]){
//         sessionContexts[userId]={
//             history:[
//                 {
//                     role: "user",
//                     parts: [{text: "Hello, I have a dog in my house."}],
//                 },
//                 {
//                     role: "model",
//                     parts: [{text: "Great to meet you. What would you like to know?"}],
//                 },
//             ],
//         };
//     }

//     try{

//         const model =genAI.getGenerativeModel({model: 'gemini-1.5-flash'});

//         const chat =model.startChat({
//             history: sessionContexts[userId].history,
//             generationConfig: {
//                 maxOutputTokens: 100,
//             },
//         });

//         const result= await chat.sendMessage(message);
//         const response= await result.response;
//         const responseText=await response.text();

//         //Update the chat history with user's message and model's response
//         sessionContexts[userId].history.push(
//             {
//                 role: "user",
//                 parts: [{text: message}],
//             },
//             {
//                 role: "model",
//                 parts: [{text: responseText}],
//             },
//         );

//         //send model's response back to client
//         res.json({reply: text});
//     }catch(error){
//         console.error('Error communicating with the Gemini API : ',error.response?error.response.data:error.message);
//         res.status(500).send('Error communicating with the Gemini API');
//     }
// });

// // Add a root route handler
// app.get('/', (req, res) => {
//     res.send('Server is up and running!');
// });


// //Start the server
// app.listen(PORT,()=>{
//     console.log(`Server is running on port ${PORT}`);
// });

import express from 'express';
import axios from 'axios';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import {GoogleGenerativeAI} from '@google/generative-ai';
import cors from 'cors';

//configure env to load environment variables
dotenv.config();

//Initialize Express App
const app=express();
const PORT = process.env.PORT || 3000;

//Middleware to parse JSON request body
app.use(bodyParser.json());

app.use(cors());


// Initialize the Google Generative AI with the API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const sessionContexts={};

app.post('/chat',async(req,res)=>{
    const{userId,message} =req.body;

    console.log('Received request:', req.body); // Debug: Log the request body

    console.log("userId : ",userId);
    console.log("message : ",message);

    if (!userId || !message) {
        return res.status(400).json({ error: 'Invalid input' });
    }

    if(!sessionContexts[userId]){
        sessionContexts[userId]={
            history:[
                {
                    role: "user",
                    parts: [{text: "Hello"}],
                },
                {
                    role: "model",
                    parts: [{text: "Great to meet you. What would you like to know?"}],
                },
            ],
        };
    }

    try{
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

        const chat = model.startChat({
            history: sessionContexts[userId].history,
            generationConfig: {
            maxOutputTokens: 100,
            },
        });
        
        // const msg = message;
        
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const responseText = response.text();
        console.log(responseText);

        //Update the chat history with user's message and model's response
        sessionContexts[userId].history.push(
            {
                role: "user",
                parts: [{text: message}],
            },
            {
                role: "model",
                parts: [{text: responseText}],
            },
        );


        res.json({reply: responseText});          
    }catch(error){
        console.error('Error communicating with the Gemini API : ',error.response?error.response.data:error.message);
        res.status(500).send('Error communicating with the Gemini API');
    }
});

// Add a root route handler
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});


//Start the server
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
});
