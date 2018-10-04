require("dotenv").config(); // require dotenv
var request = require("request"); // require request
var inquirer = require("inquirer"); // require inquirer
var keys = require("./keys"); // hidden keys for accessing Hue bridge
var authorizedUser = keys.hue.id;
var hueIp = keys.hue.ip;
var queryUrl = `http://${hueIp}/api/${authorizedUser}`; // url base for API
var lightsNum = 10; // set a maximum number of lights/groups to loop through

var Question = function(type, message, choices, name) { // constructor function for inquirer prompts/questions
    this.type = type;
    this.message = message;
    this.choices = choices;
    this.name = name;
}

// constructed inquirer prompt objects inside of arrays for inquirer syntax
var openingQ = [new Question("list", "What do you want to do?", ["light-list", "group-list", "on", "off", "all-on", "all-off", "hue", "brightness", "strobe", "colorloop", "exit"], "action")];
var numberQ = [new Question("input","Enter light number...", null, "lightNumber")];
var brightnessQ = [new Question("input","Enter light number...",null,"lightNumber"), new Question("input","Enter brightness level (0-254)...",null,"bri")];
var hueQ = [new Question("input","Enter light number...",null,"lightNumber"), new Question("input","Enter hue number (0-65535)...",null,"hue")];

var PutRequest = function(url, method, json) { // constructor function for PUT requests
    this.url = url;
    this.method = method;
    this.json = json;
} 

function runProgram() { // inquire prompt recursive loop function
    inquirer.prompt(openingQ).then((answers) => {
        var action = answers.action;
        var lightsUrl = `${queryUrl}/lights/`
        switch(action) { // functionality will change depending on the action input by the user
            case "on": // turn single light on
                inquirer.prompt(numberQ).then((answer) => {
                    request(new PutRequest(`${lightsUrl}${answer.lightNumber}/state/`, 'PUT', {on: true}), (err) => {
                        if (err) console.log(`State change on light ${answer.lightNumber} was unsuccessful!`);
                    });
                    runProgram();
                });
            break;
            case "off": // turn single light off
                inquirer.prompt(numberQ).then((answer) => {
                    request(new PutRequest(`${lightsUrl}${answer.lightNumber}/state/`, 'PUT', {on: false}), (err) => {
                        if (err) console.log(`State change on light ${answer.lightNumber} was unsuccessful!`);
                    });
                    runProgram();
                });
            break;
            case "brightness": // change brightness of single light
                inquirer.prompt(brightnessQ).then((answer) => {
                    request(new PutRequest(`${lightsUrl}${answer.lightNumber}/state/`, 'PUT', {bri: parseInt(answer.bri)}), (err) => {
                        if (err) console.log(`State change on light ${answer.lightNumber} was unsuccessful!`);
                    });
                    runProgram();
                });
            break;
            case "hue": // change hue of single light
                inquirer.prompt(hueQ).then((answer) => {
                    request(new PutRequest(`${lightsUrl}${answer.lightNumber}/state/`, 'PUT', {hue: parseInt(answer.hue)}), (err) => {
                        if (err) console.log(`State change on light ${answer.lightNumber} was unsuccessful!`);
                    });
                    runProgram();
                });
            break;
            case "all-on": // turn all lights on
                for (let i = 1; lightsNum >= i > 0; i++) {
                    request(new PutRequest(`${lightsUrl}${i}/state/`,'PUT',{on: true}), (err) => {
                        if (err) console.log(`State change on light ${answer.lightNumber} was unsuccessful!`);
                    });
                };
                runProgram();
            break;
            case "all-off": // turn all lights off
                for (let i = 1; lightsNum >= i > 0; i++) {
                    request(new PutRequest(`${lightsUrl}${i}/state/`, 'PUT', {on: false}), (err) => {
                        if (err) console.log(`State change on light ${answer.lightNumber} was unsuccessful!`);
                    });
                };
                runProgram();
            break;
            case "light-list": // get a list of all lights connected to the hue bridge
                for (let i = 1; lightsNum >= i > 0; i++) {
                    request(`${lightsUrl}${i}`, (err, response, body) => {
                        if (err) console.log(`There was an error getting data for light ${i}!`);
                        if (!err && response.statusCode === 200) {
                            var data = JSON.parse(body, null, 2);
                            console.log(`\n${i}: ${data.name}`);
                            console.log(`Type: ${data.type}`);
                            console.log(`On: ${data.state.on}`);
                            console.log(`Brightness: ${data.state.bri}\n`);
                        };
                    });
                };
                runProgram();
            break;
            case "group-list": // get a list of all light groups connected to the hue bridge
                for (let i = 1; 4 >= i > 0; i++) {
                    request(`${queryUrl}/groups/${i}`, (err, response, body) => {
                        if (err) console.log(`There was an error getting data for group ${i}!`);
                        if (!err && response.statusCode === 200) {
                            var data = JSON.parse(body, null, 2);
                            console.log(`\n${i}: ${data.name}`);
                            console.log(`Lights: ${data.lights.length}`);
                            console.log(`On = ${data.state.all_on}\n`);
                        };
                    });
                };
                runProgram();
            break;
            case "strobe": // turn all lights on and off ten times
                for (let i = 0; i < 10; i++) {
                    for (let i = 1; lightsNum >= i > 0; i++) {
                        request(new PutRequest(`${lightsUrl}${i}/state/`, 'PUT', {on: true}), (err) => {
                            if (err) console.log(`State change on light ${i} was unsuccessful!`);
                        });
                        request(new PutRequest(`${lightsUrl}${i}/state/`, 'PUT', {on: false}), (err) => {
                            if (err) console.log(`State change on light ${i} was unsuccessful!`);
                        });
                    };
                };
                runProgram();
            break;
            case "colorloop": // change color light to "colorloop" effect - I only have 1 color light (light 3 - hard coded into the URL below)
                request(new PutRequest(`${lightsUrl}3/state/`, 'PUT', {on: true, effect: "colorloop"}), (err) => {
                    if (err) console.log(`Colorloop was unsuccessful!`);
                });
                runProgram();
            break;
            case "exit": // exit program
            break;
        };
    });
}; runProgram();