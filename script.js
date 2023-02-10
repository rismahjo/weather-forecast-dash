$(document).ready(function () {
    const API_KEY = "e72eb7a1085e23048af906386ec342d3";
    var searchHistory = [];
    //Today's date using dayjs
    const currentDay = dayjs().format('dddd, MMMM D');
    $('.todayDate').prepend(currentDay);

    // Create dates for the 5-day forecast using loop
    for (var i = 1; i < 6; i++) {
        $(`#${i}Date`).text(dayjs().add(i, 'd').format('dddd, MMMM D'));
    }




    //Event Listeners
    //Submit
    $('form').on('submit', function (event) {
        event.preventDefault();
        //Get value from inputted city
        let city = $('input').val();
        //Return if empty
        if (city === '') {
            return;
        }

        //Run function to call the API 
        call();

        //Clear and reset form
        $('form')[0].reset();
    });

    // Click event for search history buttons
    $('.searchHistoryEl').on('click', '.historyBtn', function (event) {
        event.preventDefault();
        //Get value from the button text
        let btnCityName = $(this).text();
        //Call API
        call(btnCityName);
    });

    $('#clearBtn').on('click', function (event) {
        event.preventDefault();
        //Clear local storage
        window.localStorage.clear();
        //Clear search history
        $('.searchHistoryEl').empty();
        searchHistory = [];
        renderButtons();
        //Clear form
        $('form')[0].reset();
    });





    //Create buttons for searched cities
    const renderButtons = () => {
        //Clear search history
        $('.searchHistoryEl').html('');
        // For each item in the search history array
        for (var j = 0; j < searchHistory.length; j++) {
            //Store searched city and create button for it
            let cityName1 = searchHistory[j];
            let historyBtn = $('<button type="button" class="btn btn-primary btn-lg btn-block historyBtn">').text(cityName1);
            //Prepend to search history
            $('.searchHistoryEl').prepend(historyBtn);
        }
    };


    //Pull localStorage into searchHistory array
    const init = () => {
        let storedCities = JSON.parse(localStorage.getItem('searchHistory'));
        //Update search history array with cities from localStorage if any exist
        if (storedCities !== null) {
            searchHistory = storedCities;
        }
        renderButtons();
    };
    init();

    //Add searched content to local storage when submitted
    const storeCities = () =>
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));






    //API call for 5-day forecast. Takes the lat/lon from current weather call
    const fiveDay = (lon, lat) => {
        let fiveQueryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
        $.ajax({
            url: fiveQueryURL,
            method: 'GET',
        }).then(function (fiveResponse) {
            var days = [];
            for (var i = 0; i < fiveResponse.list.length; i++) {
                var item = fiveResponse.list[i];
                if (item.dt_txt.includes('12:00:00')) {
                    days.push(item)
                }
            }
            //Loop through forecast starting with tomorrow
            for (var k = 0; k < 5; k++) {
                //Display image in card
                $(`#img${k}`).attr('src', `https://openweathermap.org/img/wn/${days[k].weather[0].icon}@2x.png`);
                //Display temp in card
                $(`#temp${k}`).html(`Temp: ${days[k].main.temp} &#8457;`);
                //Displays humidity in card
                $(`#humid${k}`).html(`Humidity: ${days[k].main.humidity}%`);
            }
        });
    };

    //Calling API when opening from search history
    const call = (btnCityName) => {
        let cityName = btnCityName || $('input').val();
        //Current weather conditions
        let queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=imperial&appid=${API_KEY}`;
        $.ajax({
            url: queryURL,
            method: 'GET',
        }).then(function (response) {
            if (!btnCityName) {
                //Add searched city to search history array
                searchHistory.unshift(cityName);
                // Run function to store search history array in local storage
                storeCities();
                // Run function to create and display buttons of searched cities
                renderButtons();
            }
            //Store lon and lat for subsequent API calls
            var lon = response.coord.lon;
            var lat = response.coord.lat;
            //List the data in Jumbotron
            $('#cityName').text(response.name);
            $('#currentImg').attr('src', `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`);
            $('#tempData').html(`${response.main.temp} &#8457;`);
            $('#humidData').html(`${response.main.humidity}%`);
            $('#windData').html(`${response.wind.speed} mph`);
            $('#windArrow').css({ transform: `rotate(${response.wind.deg}deg)` });
            fiveDay(lon, lat);
        })
            //Alert if city is invalid
            .catch(function (error) {
                alert('Enter a valid city');
            });

    };
    call(searchHistory[0]);

});