// ==UserScript==
// @name        Strava Profile All Time Elevation Gain
// @namespace   http://brett.cave.za.net
// @description Adds "Elevation Gain" to "All Time Stats" on your Strava.com profile page.
// @author      Brett Cave <brett@cave.za.net>
// @homepage    https://github.com/brettcave/strava-profile
// @include     https://www.strava.com/athletes/*
// @include     https://strava-profile.herokuapp.com/*
// @include     https://strava-profile.herokuapp.com
// @include     http://localhost:3000*
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @version     1
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_xmlhttpRequest

// ==/UserScript==

stravaProfileCode = GM_getValue('stravaProfileCode');
stravaAthleteId = GM_getValue('stravaAthleteId');

function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.'); x1 = x[0]; x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {x1 = x1.replace(rgx, '$1' + ',' + '$2');}
    return x1 + x2;
}

// resetStravaStore();


(function() {
    noticeArea = $('div#noticeArea');

    if ((typeof stravaProfileCode === 'undefined' || typeof stravaAthleteId === 'undefined') && window.location.hostname != "www.strava.com") {
        // Configure code
        // console.log("Unconfigured");
        SPCFromDom = $('#stravaCode');
        SAIDFromDom = $('#stravaAthleteId');
        if (typeof SPCFromDom !== 'undefined' && typeof SAIDFromDom !== 'undefined' && typeof SPCFromDom.html() !== 'undefined' && typeof SAIDFromDom.html() !== 'undefined') {
            // console.log("Values found, setting GM values - " + SPCFromDom.html() + " and " + SAIDFromDom.html());
            GM_setValue('stravaProfileCode',SPCFromDom.html());
            GM_setValue('stravaAthleteId',SAIDFromDom.html());
            stravaProfileCode = GM_getValue('stravaProfileCode');
            stravaAthleteId = GM_getValue('stravaAthleteId');
            if (typeof noticeArea !== 'undefined') {
                noticeArea.append($('<div>Values set, head over to your <a href="https://www.strava.com/athletes/'+stravaAthleteId+'">Strava.com profile</a> now. Click <a href="#" id="resetLink">here</a> to unset.</div>'));
                $('a#resetLink').on("click", function() {
                    try {
                        resetStravaStore();
                    } catch (e) {}
                });
            }
        }
        else {
            // console.log("Values from DOM are not defined.");
        }

    } else {
        // Code is configured.
        // console.log("Configured: " + stravaProfileCode + ";" + stravaAthleteId);
        if (typeof noticeArea !== 'undefined') {
            noticeArea.append($('<div>Status: configured (<a href="https://www.strava.com/athletes/'+stravaAthleteId+'">Strava.com profile</a>). Click <a href="#" id="resetLink">here</a> to unset.</div>'));
            $('a#resetLink').on("click", function() {
                try {
                    resetStravaStore();
                } catch (e) {}

            });
        }

        // If we're on your own profile page...
        if (window.location == "https://www.strava.com/athletes/"+stravaAthleteId) {
            // ... then get JSON from the custom app.
            atcLocator = 'div.cycling > table.striped > :nth-child(5)';
            GM_xmlhttpRequest({
                method: 'get',
                dataType: 'json',
                url: 'https://strava-profile.herokuapp.com/token/receive.json?state=&code=' + stravaProfileCode,
                onload: function (response) {
                    if (response.status == '200') {
                        atr = JSON.parse(response.responseText);
                        // and inject it into the page.
                        waitForKeyElements(atcLocator, $(atcLocator).append($('<tr><td>Elevation Gain</td><td>'+addCommas(atr["elevation_gain"])+' m</td></tr>')));
                    }
                }
            });
        }
    }

})();

function resetStravaStore() {
    try {
        GM_deleteValue('stravaProfileCode');
        GM_deleteValue('stravaAtheleteId');
        stravaProfileCode = undefined;
        stravaAthleteId = undefined;
        return true;
    }
    catch (e) { return false; }
}