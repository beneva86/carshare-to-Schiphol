const Sequelize = require('sequelize') 
const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const SequelizeStore = require('connect-session-sequelize')(session.Store);

// BCRYPT
const bcrypt = require('bcrypt');
const saltRounds = 10;

// API google maps
const apikey_distancematrix = 'AIzaSyCfuyDCJBadGM4rtZtXr-O0uqhy2zRdFRQ'

// CONFIG dependencies
const app = express()
const Op = Sequelize.Op;

// connect to the database
const sequelize = new Sequelize('carshare_app_final',process.env.POSTGRES_USER,null,{
  host: 'localhost',
  dialect: 'postgres',
  storage: './session.postgres' 
})

app.use(express.static('public'))

app.set('views','views')
app.set('view engine','pug')

app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
  secret: "safe",         
  saveUnitialized: true,  
  resave: false,         
  store: new SequelizeStore({
    db: sequelize,  
    checkExpirationInterval: 15 * 60 * 1000, 
    expiration: 24 * 60 * 60 * 1000 
  })
}))

// -------------- MODELS DEFINITION --------------

const User = sequelize.define('users', {
  username: {
    type: Sequelize.STRING,
    unique: true
  },
  email: {
    type: Sequelize.STRING,
    unique: true
  },
  password: {
    type: Sequelize.STRING
  },
  firstname: {
    type: Sequelize.STRING
  },
  lastname: {
    type: Sequelize.STRING
  },
  phone_number: {
    type: Sequelize.STRING
  },
  reserved_seats: {
    type:Sequelize.INTEGER
  },
  score: {
    type: Sequelize.DECIMAL
  },
  feedbacks: {
    type: Sequelize.ARRAY(Sequelize.STRING)  
  },
  status : {
    type: Sequelize.STRING
  }
})

const Route = sequelize.define('routes', {
  // price: {
  //   type: Sequelize.ARRAY(Sequelize.INTEGER)
  // },
  date: {
    type: Sequelize.DATEONLY
  },
  time: {
    type: Sequelize.STRING
  },
  depart_city: {
    type: Sequelize.STRING
  },
  price_from_depart: {
    type: Sequelize.STRING
  },
  pickup_point1: {
    type: Sequelize.STRING
  },
  pickup_point1_time: {
    type: Sequelize.STRING
  },
  price_from_p1: {
    type: Sequelize.STRING
  },
  pickup_point2: {
    type: Sequelize.STRING
  },
  pickup_point2_time: {
    type: Sequelize.STRING
  },
  price_from_p2: {
    type: Sequelize.STRING
  },
  pickup_point3: {
    type: Sequelize.STRING
  },
  pickup_point3_time: {
    type: Sequelize.STRING
  },
  price_from_p3: {
    type: Sequelize.STRING
  },
  drop_off_time: {
    type: Sequelize.STRING
  },
  available_seats: {
    type: Sequelize.INTEGER
  },
  car_reg: {
    type: Sequelize.STRING
  },
  driver_username: {
    type: Sequelize.STRING
  },
  passenger_username:  {
    type: Sequelize.ARRAY(Sequelize.STRING)
  },
  car_type: {
    type: Sequelize.STRING
  }
})

// TABLES RELATIONSHIP/ASSOCIATION 
User.belongsTo(Route) // foreign key in the source (users --> routeId)
Route.hasMany(User)  

//----------------ROUTES----------------

//ROUTE: LOGIN / SIGNUP PAGE------------------------
app.get('/', (req,res) => {
  const user = req.session.user
  const message = req.query.message
  res.render('index', {message: message})
})

//ROUTE: HOME------------------------
app.get('/home', (req,res) => {
  res.render('home')
})

//POST ROUTE FOR SIGNUP
app.post('/signup', (req, res) => {
  const firstname = req.body.firstname
  const lastname = req.body.lastname 
  const username = req.body.username
  const email = req.body.email
  const password = req.body.password
  const phone_number = req.body.phonenumber

  User.findOne({
    where: {
      username: username
    }
  }).then((returnUser) =>{
    if(returnUser !== null) {
      res.render('index', {message_username: 'This username is already in use. Please, select another username!'})
    } else {
    User.findOne({
      where: {
        email: email
      }
    }).then((returnEmail)=> {
    if(returnEmail!==null) {
      res.render('index', {message_email: 'This email address is already in use'})
    } else {
      bcrypt.hash(password, saltRounds).then(function(hash) {
        return hash 
      }).then ((hash) => { 
        User.create({
          firstname: firstname,
          lastname: lastname,
          username: username,
          email: email,
          password: hash,
          phone_number: phone_number,
      }).then( (user) => {
        res.render('index', {message: 'Your profile is successfully created. You can log in now!'})
      })
      })
    }
  })
  }
  })
  .catch(function(err) {
    console.log(err);
  })
})

//POST ROUTE FOR LOGIN
app.post('/login', (request, response) => {
  const username = request.body.username
  const password = request.body.password
  const status_passenger = request.body.passenger
  const status_driver = request.body.driver

if (status_driver === undefined) {
  User.findOne({
    where: {
      username : username
    }
  }).then((user) =>{
    if(user !== null) {
      bcrypt.compare(password, user.password, function(err,res) {
        if (res) {
          request.session.user = user
          request.session.user.status =  'passenger' 
          // console.log('REQUEST SESSION LOGIN IS: ' + JSON.stringify(request.session))     
          response.render('search', {user: user})
        } else {
          response.redirect('/?message=' + encodeURIComponent('Incorrect password'))
        }
      })
    } else {
          response.redirect('/?message=' + encodeURIComponent('User doesn\'t exist'))
    }
})
} else {
  User.findOne({
    where: {
      username : username
    }
  }).then((user) =>{
    if(user !== null) {
      bcrypt.compare(password, user.password, function(err,res) {
        if (res) {
          request.session.user = user  
          request.session.user.status = 'driver'
          // console.log('REQUEST SESSION LOGIN IS: ' + JSON.stringify(request.session))     
          response.render('addroute', {user: user})
        } else {
          response.redirect('/?message=' + encodeURIComponent('Incorrect password'))
        }
      })
    } else {
          response.redirect('/?message=' + encodeURIComponent('User doesn\'t exist'))
    }
})
}
})

//ROUTE: SHOW THE SEARCH PAGE
app.get('/search', (req, res) => {
  const user = req.session.user
  const message_nomatch = req.query.message_nomatch
  res.render('search', {user: user, message_nomatch: message_nomatch})
})

//ROUTE: GET FOR SEARCH
app.get('/searchresults', (req, res) => {
  const user = req.session.user
  const departuredate = req.query.departuredate
  const departuretime = req.query.departuretime
  let depart_city= req.query.depart_city
  const requiredseats = req.query.requiredseats

  if (depart_city.indexOf(',') === -1) {
    depart_city = depart_city = depart_city+',Netherlands'
  }
    if(depart_city.indexOf(' ') > -1){
    depart_city = depart_city.replace(/\s/g, "")
  }

  function addMinutesToTime(time, minsAdd) {
    function z(n){ 
      return (n < 10 ? '0' : '') + n
    };
    let bits = time.split(':');
    let mins = bits[0]*60 + +bits[1] + +minsAdd;
    return z(mins%(24*60)/60 | 0) + ':' + z(mins%60);  
    } 
      min_time=addMinutesToTime(departuretime,-60)
      max_time=addMinutesToTime(departuretime,60)
  const departuretime_number = Number(departuretime.replace(':', ''))
  const min_time_number = Number(min_time.replace(':', ''))
  const max_time_number = Number(max_time.replace(':', ''))

  Route.findAll({
    where: {
      date: departuredate,
      available_seats: {
          [Op.gte]: requiredseats  // greater than or equal to requiredseats
        },
      $or: [ 
      {depart_city: depart_city},
      {pickup_point1: depart_city}, 
      {pickup_point2: depart_city},
      {pickup_point3: depart_city}  
      ]
    }
  })
  .then(function(routes) {
    console.log('ROUTES ARE: ' + JSON.stringify(routes)) // it is an empty array, if there is no match
    if (routes.length !== 0) {  
      let matchRoutes = []

    for (let i=0; i < routes.length; i++) {
      // from 10:25 --> 1025 (it is a string) --> to number 1025 --> compare with the min and max time
      if(min_time_number <= Number(routes[i].time.replace(':', '')) <= max_time_number ){
        matchRoutes.push(routes[i])
      }
    }
       res.render('searchresults', {matchRoutes: routes, requiredseats: requiredseats, user: user})        
    } else {
       res.redirect('/search?message_nomatch=' + encodeURIComponent('There is no available route'))
    }
  }) 
})

//ROUTE TO SHOW DETAILS
app.get('/searchresults', (req, res) => {
  res.render('searchresults')
})

//POST REQUEST FOR BOOK BTN ON SEARCH
app.post('/reservation', (req, res) => {
  const user = req.session.user
  const route = req.body.route
  const seats = req.body.requiredseats

   User.update({
      routeId: route.id,
      reserved_seats: seats,
    },{
    where: {
      id: user.id
    }})
  .then((user_loggedIn) => {
      // console.log(user.username, route.id);
      return Route.update({
      passenger_username: [user.username],
      available_seats: route.available_seats - seats
    }, {
      where: {
        id: route.id
      },
      returning: true
    })
  }).then((route_update) => {
   return User.findOne ({
        where: {
          username: route.driver_username,
        }
      })
  }).then((driver) => {
      res.redirect(`/confirm/?routeId=${route.id}&driverId=${driver.id}`)
  })
  .catch(err =>{
    console.error(err);
  })
})

//ROUTE: SHOW THE ADDROUTE PAGE
app.get('/addroute', (req, res) => {
  const user = req.session.user
  res.render('addroute', {user: user})
})

//POST REQUEST FOR ADDING ROUTE
app.post('/addroute', (req, res) => {
  const user = req.session.user
  let depart_city = req.body.departcity
  const departure_date = req.body.departuredate
  const departure_time = req.body.departuretime
  let pickup_point1 = req.body.pickuppoint1
  let pickup_point2 = req.body.pickuppoint2
  let pickup_point3 = req.body.pickuppoint3
  const available_seats = req.body.availableseats 
  const carregistration = req.body.carregistration
  const car_type = req.body.car_type
  const endpoint = 'Schiphol' 

// API request has to include ",Netherlands" and has not to include white spaces. 
 if(depart_city.indexOf(',') === -1){
  depart_city = depart_city+',Netherlands'
} 
 if(pickup_point1.length > 0 && pickup_point1.indexOf(',') === -1) {
  pickup_point1 = pickup_point1+',Netherlands'
 }
 if(pickup_point2.length > 0 && pickup_point2.indexOf(',') === -1) {
  pickup_point2 = pickup_point2+',Netherlands'
 }
 if(pickup_point3.length > 0 && pickup_point3.indexOf(',') === -1) {
  pickup_point3 = pickup_point3+',Netherlands'
}
  if(depart_city.indexOf(' ') > -1 || pickup_point1.indexOf(' ') > -1 || pickup_point2.indexOf(' ') > -1 || pickup_point3.indexOf(' ') > -1 ) {
    depart_city = depart_city.replace(/\s/g, "")
    pickup_point1 = pickup_point1.replace(/\s/g, "")
    pickup_point2 = pickup_point2.replace(/\s/g, "")
    pickup_point3 = pickup_point3.replace(/\s/g, "")
  }

// send request to the google distancematrix API to get the distance and travel time
  let https = require('https');
  let options = {
    host: 'maps.googleapis.com',
    path: '/maps/api/distancematrix/json' + '?' + 'origins=' + depart_city + '|' + pickup_point1 + '|' + pickup_point2 + '|' + pickup_point3 + '&destinations=' + pickup_point1 + '|' + pickup_point2 + '|' + pickup_point3 + '|' + endpoint +  '&key=' + apikey_distancematrix,
    method: 'GET',
    useQuerystring: true,
  };

  https.get(options, (resp) => {
    let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  })

  resp.on('end', () => {
    let result = JSON.parse(data);
    console.log('this is the data: ' + data)
    console.log('this is the length: ' + result.origin_addresses.length)

    let distance_array = []
    let travelTime_array = []
    let distanceAtoB 
    let distanceBtoC 
    let distanceCtoD 
    let distanceDtoE 
    let travelTimeAtoB 
    let travelTimeBtoC 
    let travelTimeCtoD 
    let travelTimeDtoE

    for (let i = 0; i < result.origin_addresses.length; i++) {
      distance_array.push(result.rows[i].elements[i].distance.text)
      travelTime_array.push(Math.floor(result.rows[i].elements[i].duration.value / 60))
    } 

    function addMinutesToTime(time, minsAdd) {
      function z(n){ 
        return (n < 10 ? '0' : '') + n
      };
          let bits = time.split(':');
          let mins = bits[0]*60 + +bits[1] + +minsAdd;
        return z(mins%(24*60)/60 | 0) + ':' + z(mins%60);  
    } 

  User.findOne({
    where: {
      username: user.username
    }
  }).then(function(user) {

    let pickup_point1_time
    let pickup_point2_time
    let pickup_point3_time
    let drop_off_time
    let priceAtoB
    let priceBtoC
    let priceCtoD
    let priceDtoE

   if (pickup_point1, pickup_point2, pickup_point3) {
     travelTimeAtoB = travelTime_array[0]
     travelTimeBtoC = travelTime_array[1]
     travelTimeCtoD = travelTime_array[2]
     travelTimeDtoE = travelTime_array[3]
     distanceAtoB = distance_array[0]
     distanceBtoC = distance_array[1]
     distanceCtoD = distance_array[2]
     distanceDtoE = distance_array[3]
     pickup_point1_time = addMinutesToTime(departure_time, travelTimeAtoB)
     pickup_point2_time = addMinutesToTime(pickup_point1_time, travelTimeBtoC)
     pickup_point3_time = addMinutesToTime(pickup_point2_time, travelTimeCtoD)
     drop_off_time = addMinutesToTime(pickup_point3_time, travelTimeDtoE)
     priceDtoE = Math.floor(distanceDtoE.substring(0, distanceDtoE.length-3) * 2/Number(available_seats))
     priceCtoD = priceDtoE + Math.floor(distanceCtoD.substring(0, distanceCtoD.length-3) * 2/Number(available_seats))
     priceBtoC = priceCtoD + Math.floor(distanceBtoC.substring(0, distanceBtoC.length-3) * 2/Number(available_seats))
     priceAtoB = priceBtoC + Math.floor(distanceAtoB.substring(0, distanceAtoB.length-3) * 2/Number(available_seats))     
  
  } else if (pickup_point1, pickup_point2) { 
     travelTimeAtoB = travelTime_array[0]
     travelTimeBtoC = travelTime_array[1]
     travelTimeCtoD = travelTime_array[2]
     distanceAtoB = distance_array[0]
     distanceBtoC = distance_array[1]
     distanceCtoD = distance_array[2]
     pickup_point1_time = addMinutesToTime(departure_time, travelTimeAtoB)
     pickup_point2_time = addMinutesToTime(pickup_point1_time, travelTimeBtoC)
     pickup_point3_time = ''
     drop_off_time = addMinutesToTime(pickup_point2_time, travelTimeCtoD)
     priceDtoE = ''
     priceCtoD = Math.floor(distanceCtoD.substring(0, distanceCtoD.length-3) * 2/Number(available_seats))
     priceBtoC = priceCtoD + Math.floor(distanceBtoC.substring(0, distanceBtoC.length-3) * 2/Number(available_seats))
     priceAtoB = priceBtoC + Math.floor(distanceAtoB.substring(0, distanceAtoB.length-3) * 2/Number(available_seats))
 
  } else if (pickup_point1) {
     travelTimeAtoB = travelTime_array[0]
     travelTimeBtoC = travelTime_array[1]
     distanceAtoB = distance_array[0]
     distanceBtoC = distance_array[1]
     pickup_point1_time = addMinutesToTime(departure_time, travelTimeAtoB)
     pickup_point2_time = ''
     pickup_point3_time = ''
     drop_off_time = addMinutesToTime(pickup_point1_time, travelTimeBtoC)
     priceDtoE = ''
     priceCtoD = ''
     priceBtoC = Math.floor(distanceBtoC.substring(0, distanceBtoC.length-3) * 2/Number(available_seats))
     priceAtoB = priceBtoC + Math.floor(distanceAtoB.substring(0, distanceAtoB.length-3) * 2/Number(available_seats))

  } else {
     travelTimeAtoB = travelTime_array[0]
     distanceAtoB = distance_array[0]
     pickup_point1_time = ''
     pickup_point2_time = ''
     pickup_point3_time = ''
     drop_off_time = addMinutesToTime(departure_time, travelTimeAtoB)
     priceAtoB = Math.floor(distanceAtoB.substring(0, distanceAtoB.length-3) * 2/Number(available_seats))
     priceBtoC = ''
     priceCtoD = ''
     priceDtoE = ''
  }
    return Route.create({
      driver_username: user.username,
      date: departure_date,
      time: departure_time,
      depart_city: depart_city,
      price_from_depart: priceAtoB,
      pickup_point1: pickup_point1,
      pickup_point1_time: pickup_point1_time,
      price_from_p1: priceBtoC,
      drop_off_time: drop_off_time,
      pickup_point2: pickup_point2,
      pickup_point2_time: pickup_point2_time,
      price_from_p2: priceCtoD,
      pickup_point3: pickup_point3,
      pickup_point3_time: pickup_point3_time,
      price_from_p3: priceDtoE,
      available_seats: available_seats,
      car_reg: carregistration,
      car_type: car_type,
    })
  }).then(function(route) {
    res.redirect(`/confirm/?routeId=${route.id}`);
  })
})
}); 
})

//ROUTE TO SHOW CONFIRMATION PAGE
app.get('/confirm', (req, res) => {
  const user = req.session.user
  const routeId = req.query.routeId
  const driverId = req.query.driverId

  if(user.status === 'driver') {
    Route.findOne({
      where: {
        id: routeId
      }
    }).then(function(route) {
     console.log('--------- ROUTE CONFIRM DRIVER IS: ' + JSON.stringify(route))
      res.render('confirm', {routedetails: route, user: user})
    })
  } else {
      return Route.findOne({
        where: {
          id: routeId
        },
        include: [{
              model: User,
              }]
    }).then(function(route) {
     console.log('--------- ROUTE CONFIRM PASSENGER IS: ' + JSON.stringify(route))
      return User.findOne({
        where: {
          username: route.driver_username
        }
      })
      .then(driver =>{
        console.log(`Driver returned is ${JSON.stringify(driver)}`)
         res.render('confirm', {routedetails: route, user: user, driver: driver})
      })
     
    })
  }
})

//ROUTE TO SHOW PROFILE
app.get('/profile', (req, res) => {
  const user = req.session.user;
  console.log('USERNAME IS::::::: ' + user.username)

  if (user === undefined) {
    res.render('profile', {message: "Please log in to view your profile"})
  } else {
    Route.findAll({ 
      where: {
        driver_username: user.username,
      } 
    }).then((routes_driver) => {
      console.log('-------ROUTES PROFILE IS: ' + JSON.stringify(routes_driver))
      if(routes_driver.length === 0) {
        Route.findAll({
             where: {
               passenger_username: {
                $contains: [user.username]}
            }
          }).then((routes_passenger) => {
            if(routes_passenger.length === 0) {
              res.render('profile', {user: user, message_noroutes: 'You don\'t have any routes'})
            } else {
              res.render('profile', {user: user, routes_passenger: routes_passenger})
            }
        })
      } else {
            res.render('profile', {user: user, routes_driver: routes_driver});   
        }
    })
}
})


//ROUTE TO LOGOUT
app.get('/logout', (req,res)=> {
  req.session.destroy((error)=> {
    if(error) {
      throw error;
    }
  res.redirect('/?message=' + encodeURIComponent('Successfully logged out'))
  })
})

sequelize.sync()

app.listen(3000, function(){
  console.log("Carshare app is listening on port 3000")
})