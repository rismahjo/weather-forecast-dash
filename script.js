$(document).ready(function () {
    const API_KEY = "4273da0ae67b824c6d417b030c59b6f0";
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
        let fiveQueryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
        $.ajax({
            url: fiveQueryURL,
            method: 'GET',
        }).then(function (fiveResponse) {
            //Loop through forecast starting with tomorrow
            for (var k = 1; k < 6; k++) {
                //Display image in card
                $(`#${k}img`).attr('src', `https://openweathermap.org/img/wn/${fiveResponse.daily[k].weather[0].icon}@2x.png`);
                //Display temp in card
                $(`#${k}temp`).html(`Temp: ${fiveResponse.daily[k].temp.day} &#8457;`);
                //Displays humidity in card
                $(`#${k}humid`).html(`Humidity: ${fiveResponse.daily[k].humidity}%`);
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