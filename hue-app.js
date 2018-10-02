var request = require("request");
var authorizedUser = "Your registered user key";
var hueIp = "Your Hue Bridge IP";
var action = process.argv[2];
var lightsNum = 10;

switch(action) {

    // turn all lights on
    case "all-on":
        for (let i = 1; lightsNum >= i > 0; i++) {
            request({
                url: `http://${hueIp}/api/${authorizedUser}/lights/${i}/state/`,
                method: 'PUT',
                json: {on: true}
            }, (err) => {
                if (err) console.log("State change was unsuccessful!");
                console.log("State change was successful!");
            });
        };
    break;

    // turn all lights off
    case "all-off":
        for (let i = 1; lightsNum >= i > 0; i++) {
            request({
                url: `http://${hueIp}/api/${authorizedUser}/lights/${i}/state/`,
                method: 'PUT',
                json: {on: false}
            }, (err) => {
                if (err) console.log("State change was unsuccessful!");
                console.log("State change was successful!");
            });
        };
    break;

    // get a list of all lights connected to the hue bridge
    case "light-list":
        for (let i = 1; lightsNum >= i > 0; i++) {
            request(`http://${hueIp}/api/${authorizedUser}/lights/${i}`, (error, response, body) => {
                if (error) console.log("There was an error getting the light data!");
                if (!error && response.statusCode === 200) {
                    var data = JSON.parse(body, null, 2);
                    console.log(`\n${i}: ${data.name}`);
                    console.log(`Type: ${data.type}`);
                    console.log(`On = ${data.state.on}\n`);
                };
            });
        };
    break;

    // get a list of all light groups connected to the hue bridge
    case "group-list":
        for (let i = 1; 4 >= i > 0; i++) {
            request(`http://${hueIp}/api/${authorizedUser}/groups/${i}`, (error, response, body) => {
                if (error) console.log("There was an error getting the light data!");
                if (!error && response.statusCode === 200) {
                    var data = JSON.parse(body, null, 2);
                    console.log(`\n${i}: ${data.name}`);
                    console.log(`Lights: ${data.lights.length}`);
                    console.log(`On = ${data.state.all_on}\n`);
                };
            });
        };
    break;

    // turn all lights on and off ten times
    case "strobe":
        for (let i = 0; i < 10; i++) {
            for (let i = 1; lightsNum >= i > 0; i++) {
                request({
                    url: `http://${hueIp}/api/${authorizedUser}/lights/${i}/state/`,
                    method: 'PUT',
                    json: {on: true}
                }, (err) => {
                    if (err) console.log("State change was unsuccessful!");
                    console.log("State change was successful!");
                });
                request({
                    url: `http://${hueIp}/api/${authorizedUser}/lights/${i}/state/`,
                    method: 'PUT',
                    json: {on: false}
                }, (err) => {
                    if (err) console.log("State change was unsuccessful!");
                    console.log("State change was successful!");
                });
            };
        };
    break;

    // change color light to "colorloop" effect - I only have one color light (light 3 - see url below)
    case "colorloop":
        request({
            url: `http://${hueIp}/api/${authorizedUser}/lights/3/state/`,
            method: 'PUT',
            json: {on: true, effect: "colorloop"}
        }, (err) => {
            if (err) console.log("State change was unsuccessful!");
            console.log("State change was successful!");
        });
    break;
};