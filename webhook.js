'use strict';
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN || "EAACUshJyvdIBAOxSiYcAlZAEC3qubJTvtpmONJLsLxwVjys5hJU5ujNw7mF15mtFT7hhTUftCnL0eRynoT28VVAZAMZAcvZBYlHjYzLkT1GXrFZCx6H067NREr5IXW0p4bSMEYo9WZCvZAZAEEFzX7sZCXBgZCEHrnZBIA5wVoZBZBHEyZCgZDZD";
//const APIAI_TOKEN = process.env.APIAI_TOKEN;
//const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
//const apiai = require('apiai');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const server = app.listen(process.env.PORT || 5000, () => {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

//const apiaiApp = apiai(APIAI_TOKEN);

/* For Facebook Validation */
app.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'AlonTheKing') {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.status(403).end();
    }
});

/* Handling all messenges */
app.post('/webhook', (req, res) => {
    if (req.body.object === 'page') {
        req.body.entry.forEach((entry) => {
            entry.messaging.forEach((event) => {
                if (event.message && event.message.text) {
                    receivedMessage(event);
                }
            });
        });
        res.status(200).end();
    }
});

/* GET query from API.ai */

function receivedMessage(event) {
    let sender = event.sender.id;
    let text = event.message.text;

    request({
        url: 'https://api.imgflip.com/get_memes',
        method: 'GET',
    }, (error, response) => {
        if (error) {
            console.log('Error sending get all memes: ', error);
            return;
        }
        // console.log('I is: ', response.body);
        let json = JSON.parse(response.body);
        if (!json.success) {
            console.log('Error getting all memes: ', json);
        } else {
            let meme = json.data.memes[0];
            request({
                url: 'https://api.imgflip.com/caption_image',
                method: 'POST',
                formData: {template_id: meme.id, username: 'razbensimon', password: 'FIzA2qa4s3HE', text0: 'mother', text1: 'fucker'}
            }, (error2, response2) => {
                if (error2) {
                    console.log('Error sending get meme: ', error2);
                    return;
                }
                //console.log('I is 2: ', response2.body);
                let json2 = response2.body;
                if (!json2.success) {
                    console.log('Error get meme: ', text, ' and ', json2);
                } else {
                    let url = json2.data.url;
                    prepareSendAiMessage(sender, url);
                }
            });
        }
    });
    //

    // let apiai = apiaiApp.textRequest(text, {
    //   sessionId: 'tabby_cat'
    // });

    // apiai.on('response', (response) => {
    //   let aiText = response.result.fulfillment.speech;
    //   console.log(aiText);
    //
    //   switch (aiText) {
    //     case 'SHOW_BIOGRAPHY':
    //       prepareSendBio(sender);
    //       break;
    //
    //     default:
    //       prepareSendAiMessage(sender, aiText);
    //   }
    //
    // });
    //
    // apiai.on('error', (error) => {
    //   console.log(error);
    // });
    //
    // apiai.end();
}

function sendMessage(messageData) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token: PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: messageData
    }, (error, response) => {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}

function prepareSendAiMessage(sender, aiText) {
    let messageData = {
        recipient: {id: sender},
        message: {text: aiText}
    };
    sendMessage(messageData);
}

function prepareSendBio(sender) {
    let messageData = {
        recipient: {
            id: sender
        },
        message: {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'generic',
                    elements: [{
                        title: 'Twitter',
                        subtitle: '@girlie_mac',
                        item_url: 'https://www.twitter.com/girlie_mac',
                        image_url: 'https://raw.githubusercontent.com/girliemac/fb-apiai-bot-demo/master/public/images/tomomi-twitter.png',
                        buttons: [{
                            type: 'web_url',
                            url: 'https://www.twitter.com/girlie_mac',
                            title: 'View Twitter Bio'
                        }],
                    }, {
                        title: 'Work History',
                        subtitle: 'Tomomi\'s LinkedIn',
                        item_url: 'https://www.linkedin.com/in/tomomi',
                        image_url: 'https://raw.githubusercontent.com/girliemac/fb-apiai-bot-demo/master/public/images/tomomi-linkedin.png',
                        buttons: [{
                            type: 'web_url',
                            url: 'https://www.linkedin.com/in/tomomi',
                            title: 'View LinkedIn'
                        }]
                    }, {
                        title: 'GitHub Repo',
                        subtitle: 'girliemac',
                        item_url: 'https://github.com/girliemac',
                        image_url: 'https://raw.githubusercontent.com/girliemac/fb-apiai-bot-demo/master/public/images/tomomi-github.png',
                        buttons: [{
                            type: 'web_url',
                            url: 'https://github.com/girliemac',
                            title: 'View GitHub Repo'
                        }]
                    }]
                }
            }
        }
    };
    sendMessage(messageData);
}

/* Webhook for API.ai to get response from the 3rd party API */
app.post('/ai', (req, res) => {
    console.log('*** Webhook for api.ai query ***');
    console.log(req.body.result);

    if (req.body.result.action === 'weather') {
        console.log('*** weather ***');
        let city = req.body.result.parameters['geo-city'];
        let restUrl = 'http://api.openweathermap.org/data/2.5/weather?APPID=' + WEATHER_API_KEY + '&q=' + city;

        request.get(restUrl, (err, response, body) => {
            if (!err && response.statusCode == 200) {
                let json = JSON.parse(body);
                console.log(json);
                let tempF = ~~(json.main.temp * 9 / 5 - 459.67);
                let tempC = ~~(json.main.temp - 273.15);
                let msg = 'The current condition in ' + json.name + ' is ' + json.weather[0].description + ' and the temperature is ' + tempF + ' ℉ (' + tempC + ' ℃).'
                return res.json({
                    speech: msg,
                    displayText: msg,
                    source: 'weather'
                });
            } else {
                let errorMessage = 'I failed to look up the city name.';
                return res.status(400).json({
                    status: {
                        code: 400,
                        errorType: errorMessage
                    }
                });
            }
        })
    }

});
