require("dotenv").config(); // require dotenv
var request = require("request"); // require request
var inquirer = require("inquirer"); // require inquirer
var keys = require("./keys"); // hidden keys for accessing Hue bridge
var authorizedUser = keys.hue.id;
var hueIp = keys.hue.ip;
var queryUrl = `http://${hueIp}/api/${authorizedUser}`; // url base for API
var amount = process.argv[4]; // argument at index 4 is the amount to apply (for brightness, hue)
var lightsNum = 10; // set a maximum number of lights/groups to loop through
var questions = [ // questions for inquirer prompt
{
    type: "list",
    message: "What do you want to do?",
    choices: ["on", "off", "exit"],
    name: "action"
},
{
    type: "input",
    message: "Which light?",
    name: "lightNumber"
}];

// inquire prompt recursive loop function
function askAgain() {
    inquirer.prompt(questions).then(function(answers) {
        var lightNum = answers.lightNumber;
        var action = answers.action;
        if (lightNum === "all") {
            var action = `${lightNum}-${action}`;
        }
        switch(action) { // functionality will change depending on the action input by the user
            case "on": // turn single light on
                request({
                    url: `${queryUrl}/lights/${lightNum}/state/`,
                    method: 'PUT',
                    json: {on: true}
                }, (err) => {
                    if (err) console.log("State change was unsuccessful!");
                });
                askAgain();
            break;
            case "off": // turn single light off
                request({
                    url: `${queryUrl}/lights/${lightNum}/state/`,
                    method: 'PUT',
                    json: {on: false}
                }, (err) => {
                    if (err) console.log("State change was unsuccessful!");
                });
                askAgain();
            break;
            case "bri": // change brightness of single light
                request({
                    url: `${queryUrl}/lights/${lightNum}/state/`,
                    method: 'PUT',
                    json: {bri: parseInt(amount)}
                }, (err) => {
                    if (err) console.log("State change was unsuccessful!");
                });
                askAgain();
            break;
            case "hue": // change hue of single light
                request({
                    url: `${queryUrl}/lights/${lightNum}/state/`,
                    method: 'PUT',
                    json: {hue: parseInt(amount)}
                }, (err) => {
                    if (err) console.log("State change was unsuccessful!");
                });
                askAgain();
            break;
            case "all-on": // turn all lights on
                for (let i = 1; lightsNum >= i > 0; i++) {
                    request({
                        url: `${queryUrl}/lights/${i}/state/`,
                        method: 'PUT',
                        json: {on: true}
                    }, (err) => {
                        if (err) console.log("State change was unsuccessful!");
                        });
                };
                askAgain();
            break;
            case "all-off": // turn all lights off
                for (let i = 1; lightsNum >= i > 0; i++) {
                    request({
                        url: `${queryUrl}/lights/${i}/state/`,
                        method: 'PUT',
                        json: {on: false}
                    }, (err) => {
                        if (err) console.log("State change was unsuccessful!");
                        });
                };
                askAgain();
            break;
            case "light-list": // get a list of all lights connected to the hue bridge
                for (let i = 1; lightsNum >= i > 0; i++) {
                    request(`${queryUrl}/lights/${i}`, (error, response, body) => {
                        if (error) console.log(`There was an error getting data for light ${i}!`);
                        if (!error && response.statusCode === 200) {
                            var data = JSON.parse(body, null, 2);
                            console.log(`\n${i}: ${data.name}`);
                            console.log(`Type: ${data.type}`);
                            console.log(`On: ${data.state.on}`);
                            console.log(`Brightness: ${data.state.bri}\n`);
                        };
                    });
                };
                askAgain();
            break;
            case "group-list": // get a list of all light groups connected to the hue bridge
                for (let i = 1; 4 >= i > 0; i++) {
                    request(`${queryUrl}/groups/${i}`, (error, response, body) => {
                        if (error) console.log(`There was an error getting data for group ${i}!`);
                        if (!error && response.statusCode === 200) {
                            var data = JSON.parse(body, null, 2);
                            console.log(`\n${i}: ${data.name}`);
                            console.log(`Lights: ${data.lights.length}`);
                            console.log(`On = ${data.state.all_on}\n`);
                        };
                    });
                };
                askAgain();
            break;
            case "strobe": // turn all lights on and off ten times
                for (let i = 0; i < 10; i++) {
                    for (let i = 1; lightsNum >= i > 0; i++) {
                        request({
                            url: `${queryUrl}/lights/${i}/state/`,
                            method: 'PUT',
                            json: {on: true}
                        }, (err) => {
                            if (err) console.log("State change was unsuccessful!");
                                });
                        request({
                            url: `${queryUrl}/lights/${i}/state/`,
                            method: 'PUT',
                            json: {on: false}
                        }, (err) => {
                            if (err) console.log("State change was unsuccessful!");
                                });
                    };
                };
                askAgain();
            break;
            case "colorloop": // change color light to "colorloop" effect - I only have 1 color light (light 3 - hard coded into the URL below)
                request({
                    url: `${queryUrl}/lights/3/state/`,
                    method: 'PUT',
                    json: {on: true, effect: "colorloop"}
                }, (err) => {
                    if (err) console.log("State change was unsuccessful!");
                });
                askAgain();
            break;
            case "exit":
            break;
        };
    });
}; askAgain();
