// main controller

var convertTime = function(time){
  return moment(time, 'HHmm').format('h:mm A');
};

var nonEmpty = function(item){
  return item !== '';
}

var processGame = function(game){
    var values = game.split('-');
    return {
      team1: values[0].toUpperCase(),
      team2: values[1].toUpperCase(),
      time: convertTime(values[2]),
      victor: values[3],
      hasVictor: values[3] !== 'na'
    };
};

var timeComparison = function(a, b) {
    return parseInt(a.time) > parseInt(b.time);
};

var parseGame = function(game){
    var games = game.split(';');
    return games.filter(nonEmpty).map(processGame).sort(timeComparison);
};


var render = function(games, todays_date){
  var date_source = $("#current-date-template").html();
  var date_template = Handlebars.compile(date_source);
  var todays_moment = moment(todays_date, 'YYYY-MM-DD');
  $('#todays-date').innerHTML = "";
  $('#todays-date').style = "";
  $('#todays-date').html(date_template(
    {
      day: todays_moment.format('dddd'),
      date: todays_moment.format('MMMM Do'),
    }
  ));

  document.getElementById('game-table').innerHTML = "";
  var source   = $("#game-table-template").html();
  var template = Handlebars.compile(source);
  for (var i = 0; i < games.length; i++) {
    var newRow = '<tr class="game' + i + ' game-row"></tr>'
    var newRowButtons = '<tr class="game-subinfo"><td><button class="btn btn-xs notify-me-btn">Notify me</button></td></tr>';
    $('#game-table').append(newRow);
    $('#game-table').append(newRowButtons);
    $('.game' + i).html(template(games[i]));
    $('.game' + i).css('height', 65);
  }
  // document.getElementById('doc').height = (150 + (50 * games.length));
  // $('html').height( 0 + 'px' );
  // chrome.browserAction.setPopup({popup: "popup.html"});
  // window.resizeTo(250, 10);
  // $('html').css('height', ( 0 ));
  // $('html').css('height', ( 0 ));
  document.body.style.height = '0px';
  document.body.style.minHeight = '0px';
  document.documentElement.style.height = '0px';
  document.documentElement.style.minHeight = '0px';
  // $('#test-content').html(template(context));
};

var nextGame = function(){
  db.getNextGameday('NA').then(function(snapshot){
    var context = parseGame(snapshot.val().matches);
    render(context, snapshot.key);
    console.log('next day: ' + snapshot.key);
    db.setMoment(snapshot.key);
  });
}

var previousGame = function() {
  console.log('PREVIOUS GAME')
  db.getPreviousGameday('NA').then(function(snapshot){
    var context = parseGame(snapshot.val().matches);
    render(context, snapshot.key);
    console.log('previous day: ' + snapshot.key);
    db.setMoment(snapshot.key);
  });
}

var addListeners = function(){
  document.getElementById('next_game').addEventListener('click', nextGame);
  document.getElementById('previous_game').addEventListener('click', previousGame);
};

var getFirstGame = function(db){
  db.getNextGameday('NA').then(function(snapshot){
    var context = parseGame(snapshot.val().matches);
    render(context);
    db.setMoment(snapshot.key);
    addListeners();
  });
};


// document.addEventListener('DOMContentLoaded', function () {

Handlebars.registerHelper("checkIfWon", function(team, victor) {
  team = team.toString().toLowerCase();
  victor = victor.toString().toLowerCase();
  if (team === victor) {
      return new Handlebars.SafeString("<span style='color:gold;' class='victor-text'>WIN</span>");
  }
  else {
      return new Handlebars.SafeString("<span style='color:red;' class='victor-text'>LOSS</span>");
  }
});

db = new Database();
  // console.log(getNextGames('NA', moment(), db));
  // getAllGames('NA', db);
db.getTodaysGameday('NA').then(function(snapshot){
  var context = parseGame(snapshot.val().matches);
  render(context, snapshot.key);
  db.setMoment(snapshot.key);
  addListeners();
});
  // var initialContext = parseGame(getTodaysGames('NA', moment(), db));
  // render(initialContext);
  // console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));
	// console.log( getCurrentTime().dayOfWeek );
  // var context = {
  //   title: "lul will this actually work"
  // };
  // var source   = $("#header-template").html();
  // var template = Handlebars.compile(source);
  //
  // $('#test-content').html(template(context));

// });
