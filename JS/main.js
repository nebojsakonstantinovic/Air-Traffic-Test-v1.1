//SCRIPTS

//Automatic Geolocation

var x = document.getElementById("lonlat");
var lat;
var lon;

//1
//Call for geolocation

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(handlePosition, handleError);
}


//2
//User accepts

function handlePosition(position) {
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  x.innerHTML = '<div class="wrap-lon-lat">' + '<h5>Above Your Position</h5>' + '<table><tr>' +
    '<td>Latitude:</td><td>' + lat.toPrecision(8) + '</td></tr>' +
    '<tr><td>Longitude:</td><td> ' + lon.toPrecision(8) + '</td></tr></table></div>';
  getResults();
  setInterval(eraseData, 60000);
  setInterval(getResults, 60000);
}

//3
//User denies

function handleError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      x.innerHTML = '<h5 class="error">It is necessary to Allow Location Access</h5>' + '<p class="error">Please reload page</p>';
      break;
    case error.POSITION_UNAVAILABLE:
      x.innerHTML = '<h5 class="error">Position is currently unavailable</h5>';
      break;
    case error.UNKNOWN_ERROR:
      x.innerHTML = '<h5 class="error">An unknown error occurred</h5>'
      break;
  }
}


//eraseData
//Calling this function deletes all data in div

function eraseData() {
  document.getElementById('result').innerHTML = '';
}


//getServer
//This function makes url for ajax request
//////////////////////100km//// during the night search radius should be increased
///DstL=0 to DstU=100 makes search radius 100km for coordinates

function getServer(x, y) {
  return 'http://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?lat=' + x + '&lng=' + y + '&fDstL=0&fDstU=100';
}







//getPicture function
//Sets picture if plane is going west or east


function getPicture(arg) {
  if (arg < 180) {
    var picture = '<figure><img src="img/aircraft-east.png" alt="img-plane-east"></figure>'
  } else if (arg > 180) {
    var picture = '<figure><img src="img/aircraft-west.png" alt="img-plane-west"></figure>'
  } else {
    var picture = '<p>plane is going south or north</p>'
  }
  return picture;
};


//Sort acList
//Sorting acList by altitude


function compare(a, b) {

  let comparison = 0;
  if (a.Alt < b.Alt) {
    comparison = 1;
  } else if (a.Alt > b.Alt) {
    comparison = -1;
  }
  return comparison;
}

//planes.sort(compare)

//getLogo function
//Returns image for logo in modal


function getLogo(arg) {
  var pic = arg.replace(/\s/g, '').toLowerCase() + '.com';
  return '<img src="http://logo.clearbit.com/' + pic + '?size=40">'
};









//AJAX request////////
//CORS security//////////////////This was my biggest problem that I couldn't find work around so I used JSONP



///////////////////////////////////////////
///////////////////////////////////////////

//showPlane(plane)
//function that is setting modal

function showPlane(plane) {
  //console.log(plane);
  document.getElementById('airCraftModalLabel').innerHTML = plane.Call
  document.getElementById('man').innerHTML = plane.Man
  document.getElementById('mdl').innerHTML = plane.Mdl
  document.getElementById('from').innerHTML = plane.From;
  document.getElementById('to').innerHTML = plane.To;
  document.getElementById('logo').innerHTML = getLogo(plane.Op);
  $('#airCraftModal').modal();
  //console.log(getLogo(plane.Op));
}


function makeTd(val) {
  var td = document.createElement('td');
  td.innerHTML = val;
  return td;
}

function makeTh(val) {
  var th = document.createElement('th');
  th.innerHTML = val;
  return th;
}

//makes row in table body and adds event listener

function makeRow(plane) {
  var tr = document.createElement('tr');
  tr.appendChild(makeTd(getPicture(plane.Trak)));
  tr.appendChild(makeTd(plane.Alt));
  tr.appendChild(makeTd(plane.Call));
  tr.addEventListener('click', function() {
    showPlane(plane);
  }, false);
  return tr;
}

function makeHeadRow() {
  var tr = document.createElement('tr');
  tr.appendChild(makeTh('West/East'));
  tr.appendChild(makeTh('Altitude(ft)'));
  tr.appendChild(makeTh('Flight code No'));
  return tr;
}


//main function

function getResults() {
  // if response is taking to long tells user that should wait
  document.getElementById('result').innerHTML = '<p>Results are loading ...</p>';
  //request
  $.post({
    url: getServer(lat, lon),
    dataType: "jsonp"
  }).then(function(response) {
    var planes = response.acList;
    //sort planes by altitude
    planes.sort(compare);

    //creates table and calls above functions

    var tblContainer = document.createElement('table');

    var tblHead = document.createElement('thead');
    tblContainer.appendChild(tblHead);

    tblHead.appendChild(makeHeadRow());

    var tblBody = document.createElement('tbody');
    tblContainer.appendChild(tblBody);

    planes.forEach(function(plane) {
      tblBody.appendChild(makeRow(plane));
    });
    //empty #result ////// This was part of solution for problem in Google Chrome
    document.getElementById('result').innerHTML = '';
    //appends whole table
    document.getElementById('result').appendChild(tblContainer);
    //writes message if there are no planes
    if (planes == '') {
      document.getElementById('result').innerHTML = '';
      document.getElementById('result').innerHTML = '<p>There are no airplanes at the moment</p>';
    }
    console.log();
  });
}
//console.log();


//this was static url that I used before introducing geolocation
//'http://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?lat=33.433638&lng=-112.008113&fDstL=0&fDstU=100'

//Idea for the function that I wrote above
//getServer(lat,lon)
