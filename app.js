//jshint version:6

const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date.js');

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
let itemsName = [];
let itemsWeight = [];
let itemsCurrent = [];
let itemsDestination = [];
let distances = [];
var submitVale;
var finalPrice = [];
var indexPrice = 0;

app.use(express.static("public"));
app.set("view engine", 'ejs');

app.get('/', (req,res)=>{

  let day = date.getDate();
  let totalPrice = 0;
  for (let i = 0; i < finalPrice.length; i++) {
    totalPrice += finalPrice[i];
  }
  res.render('list', {listTitle: day, newListItems: itemsName, newListWeight:itemsWeight, newListCurrent:itemsCurrent, newListDestination: itemsDestination, finalCalculatedPrice: finalPrice, indexPrice: indexPrice});

})

app.post('/', (req,res)=>{

  if(req.body.submitValue === "add-item")
  {
    indexPrice++;
    itemName = req.body.newItem;
    itemWeight = req.body.weight;
    itemCurrent = req.body.currentLocation;
    itemDestination = req.body.Destination;
    itemsName.push(itemName);
    itemsWeight.push(itemWeight);
    itemsCurrent.push(itemCurrent);
    itemsDestination.push(itemDestination);
    // distance calculator starts

        const { exec } = require("child_process");
        let placeName ='{}',distance;
        var fromLatitude,fromLongitude,toLatitude,toLongitude;

        exec(`curl "https://api.radar.io/v1/search/autocomplete?query=${itemCurrent}" \ -H "Authorization: prj_live_sk_5b2985957580330b27fae32db8f9a5ecd7771458`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        placeName = JSON.parse(stdout);
        fromLatitude = JSON.stringify(placeName.addresses[0].latitude);
        fromLongitude = JSON.stringify(placeName.addresses[0].longitude);
        fromLatitude = parseFloat(fromLatitude);
        fromLongitude = parseFloat(fromLongitude);
        exec(`curl "https://api.radar.io/v1/search/autocomplete?query=${itemDestination}" \ -H "Authorization: prj_live_sk_5b2985957580330b27fae32db8f9a5ecd7771458`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        placeName = JSON.parse(stdout);
        toLatitude = JSON.stringify(placeName.addresses[0].latitude);
        toLongitude = JSON.stringify(placeName.addresses[0].longitude);
        toLatitude = parseFloat(toLatitude);
        toLongitude = parseFloat(toLongitude);
        exec(`curl "https://api.radar.io/v1/route/distance?origin=${fromLatitude},${fromLongitude}&destination=${toLatitude},${toLongitude}&modes=car&units=imperial" \  -H "Authorization: prj_live_sk_5b2985957580330b27fae32db8f9a5ecd7771458"`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        distance = JSON.parse(stdout);
        distance = (distance.routes.car.distance.value*0.254)/1000;
        // 1 imperial = 0.254m
        distances.push(distance);
        });
        });
        });
    // distance calculator ends
        res.redirect('/');
  }
  else if(req.body.submitValue === "final-submit"){
    //10rs per kg
    //10rs per kg
    for (var i = 0; i < distances.length; i++) {
      finalPrice.push(parseFloat((parseFloat(itemsWeight[i]) + parseFloat(distances[i]))*10));
    }
    res.redirect('/');
  }
})





// curl "https://api.radar.io/v1/route/distance?origin=28.557163,77.163665&destination=19.125501,72.897224&modes=car&units=imperial" \  -H "Authorization: prj_live_sk_5b2985957580330b27fae32db8f9a5ecd7771458"


app.listen(3000, (req,res)=>{
  console.log("server started!")
})
