"use strict";

// Input data from AWS
const event = {
    Records: [
        {
            awsRegion: 'ap-northeast-1'
        }
    ]
};

// AWS Lambda runtime information
const context = {};

// call handler
const index = require("./index");
index.handler(event, context, (error, result) => {
    if(error) console.error(error);
    console.log(result);
});
