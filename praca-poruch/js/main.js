const opened_job = document.querySelector(".opened-job");
const close_job = document.querySelector(".close-job");
const know_more = document.querySelector(".opened-job-min-footer");
const marshrut = document.querySelector(".marshrut");

close_job.addEventListener("click", () => {
  opened_job.classList.add("opened-job-closed");
  opened_job.classList.remove("opened-job-min");
});

know_more.addEventListener("click", () => {
  generateJob(true);
  opened_job.classList.remove("opened-job-min");
  opened_job.classList.remove("opened-job-closed");
});

const job_name = document.querySelector(".job-name h2");
const opened_job_scroll = document.querySelector(".opened-job-scroll");
let fixHeader;
function generateJob(short, num) {
  if (num != undefined) {
    job_name.innerHTML = jobs[num].name;
    fixHeader = num;
  } else job_name.innerHTML = jobs[fixHeader].name;
  if (window.innerWidth > 900) {
    if (jobs[num].image != undefined) {
      opened_job_scroll.innerHTML = `<div class="opened-job-img-container"><img
    src="${jobs[num].image}"
    alt=""></div>
<div class="job-text">
${jobs[num].long_description}
</div>`;
    } else {
      opened_job_scroll.innerHTML = `
  <div class="job-text">
  ${jobs[num].long_description}
  </div>`;
    }
  } else {
    if (short) {
      if (jobs[fixHeader].image != undefined) {
        opened_job_scroll.innerHTML = `<div class="opened-job-img-container"><img
        src="${jobs[fixHeader].image}"
        alt=""></div>
    <div class="job-text">
    ${jobs[fixHeader].long_description}
    </div>`;
      } else {
        opened_job_scroll.innerHTML = `
    <div class="job-text">
    ${jobs[fixHeader].long_description}
    </div>`;
      }
    } else
      opened_job_scroll.innerHTML = `<div class="job-text">${jobs[num].short_description}</div>`;
  }
}

//maps
var map;
var jobsKml =
  "https://www.google.com/maps/d/u/0/kml?forcekml=1&mid=1bV5yPb18H0qNbYTqCg6jPUQYiGDddqQ&lid=wkzlDF7iTuE";

// Fetch the KML file
fetch("INFO.txt")
  .then((response) => response.text())
  .then(convertKMLToJSON)
  .catch((error) => {
    console.error("Error:", error);
  });

//jobs from KML file
let jobs = [];
function convertKMLToJSON(kml) {
  //if double space in name than textolite add &nbsp ad whole map crashes this fixes it
  kml = kml.replace(/&nbsp;/g, "");
  //

  const kmlData = new DOMParser().parseFromString(kml, "text/xml");
  kmlData.querySelectorAll("Folder").forEach((type) => {
    let typeArr = type.querySelector("name").innerHTML;
    type.querySelectorAll("Placemark styleUrl").forEach((name) => {
      name.innerHTML = typeArr;
    });
  });

  const convertedData = toGeoJSON.kml(kmlData);
  // Perform further operations with the converted JSON data here
  for (
    let jobCounter = 0;
    convertedData.features.length > jobCounter;
    jobCounter++
  ) {
    //fix empty description
    let widthoutImg;
    if (
      convertedData.features[jobCounter].properties.description === undefined
    ) {
      widthoutImg = "Опис роботи не доступний";
    } else {
      widthoutImg = convertedData.features[
        jobCounter
      ].properties.description.replace(/.* width="auto" \/><br><br>/, "");
    }

    let longDesc = widthoutImg.replace(/\[(.*?)\]/, "").trim();
    longDesc = longDescFunc(longDesc);
    jobs.push({
      name: convertedData.features[jobCounter].properties.name.replace(
        /\[[^\]]*\]/g,
        ""
      ),
      short_description: shortDescFunc(widthoutImg, longDesc),
      long_description: longDesc.join(''),//dobavil
      image: convertedData.features[jobCounter].properties.gx_media_links,
      active: !convertedData.features[jobCounter].properties.name.match(/!/),
      work_for: /\[/.test(convertedData.features[jobCounter].properties.name)
        ? convertedData.features[jobCounter].properties.name
            .match(/\[(.*?)\]/)[1]
            .replace(/\s/g, "")
            .toLowerCase()
            .split(",")
        : ["ж", "ч", "п", "д"],
      type: convertedData.features[jobCounter].properties.styleUrl.slice(1),
      location: convertedData.features[jobCounter].geometry.coordinates,
    });
  }

  function shortDescFunc(widthoutImg, longDesc) {
    //if no [] or empty []
    if (
      widthoutImg.includes("[]") ||
      longDesc.length + 30 >= widthoutImg.length
    ) {
      if (longDesc.startsWith("<br>")) return longDesc.slice(4, 130);
      else return longDesc.slice(0, 130);
    } else
      return widthoutImg
        .slice(widthoutImg.indexOf("[") + 1, widthoutImg.indexOf("]"))
        .trim();
  }
  function longDescFunc(longDesc) {
    let structuredDescription =
      "<p>" +
      longDesc.replace(/^<br>|<br>$/g, "").replace(/<br><br>/g, "</p><br><p>") +
      "<p>";

    let rebuildedLong = [];
    let rebuildedLong2 = [];
    let arrStar = structuredDescription.split("**");

    arrStar.forEach((x, index) => {
      if (index % 2 === 0) {
        rebuildedLong.push(x);
        rebuildedLong.push('<span class="alert">');
      } else {
        rebuildedLong.push(x);
        rebuildedLong.push("</span>");
      }
    });

    let arrOneStar = rebuildedLong.join("").split("*");
    arrOneStar.forEach((x, index) => {
      if (index % 2 === 0) {
        rebuildedLong2.push(x);
        rebuildedLong2.push("<span>");
      } else {
        rebuildedLong2.push(x);
        rebuildedLong2.push("</span>");
      }
    });
    if(rebuildedLong2[0].startsWith('<p><br>'))rebuildedLong2[0]=rebuildedLong2[0].replace(/<br>/,'')
    console.log(rebuildedLong2)
    return rebuildedLong2;
  }
}
///////
///////
///////
///////
///////
///////
///////
///////
///////
///////
///////
const typeOfWork = document.querySelectorAll(".js-footer-filter li");
const typeOfGender = document.querySelectorAll(".js-header-filter li");
let arrayOfClickableJobs = [];
var markerSize = 10;
function initMap() {
  let map = new google.maps.Map(document.querySelector(".map"), {
    center: new google.maps.LatLng(51.254572, 18.753715),
    zoom: 6,
    gestureHandling: "greedy",
    zoomControl: false,
    streetViewControl: false,
    disableDefaultUI: true,
  });

  map.addListener("dragstart", () => {
    filter_header.classList.remove("filter-header-opened");
    filter_btn.classList.remove("filter-btn-opened");
    h2Hide.classList.add("hideOnMobile");
  });
  //change marker size based on zoom
  map.addListener("zoom_changed", () => {
    markerSize = map.getZoom() * 3;
    if (markerSize > 60) {
      return;
    } else if (markerSize < 10) {
      return;
    }
    //

    arrayOfClickableJobs.forEach((x) => {
      x[0].setIcon({
        // Set the same icon URL
        url: x[0].getIcon().url,
        // Scale the icon using the markerScale variable
        scaledSize: new google.maps.Size(markerSize, markerSize),
      });
    });
  });
  const currentTime = new Date().getTime();
  //creating jobs
  google.maps.event.addListenerOnce(map, "tilesloaded", function () {
    //if map loads too fast (less than 1 second) pins load only after 1 second
    const endTime = new Date().getTime();
    let timeDiff = (endTime - currentTime) / 1000;
    if (timeDiff > 1) timeDiff = 0;
    else timeDiff = (1 - timeDiff) * 1000;
    //
    setTimeout(() => {
      jobs.forEach((job, num) => {
        let x = new google.maps.Marker({
          position: { lat: job.location[1], lng: job.location[0] },
          map: map,
          title: job.name,
          icon: {
            url:
              job.type == "Різноробочі"
                ? "img/pin/blue-map.svg"
                : job.type == "Cпеціалісти"
                ? "img/pin/black-map.svg"
                : job.type == "Польові роботи"
                ? "img/pin/green-map.svg"
                : "img/pin/orange-map.svg",
            scaledSize: new google.maps.Size(markerSize + 4, markerSize + 4),
          },
          /*         label:{
          text:job.name,
          color: "black",
          fontWeight: "400",
          fontSize: markerSize+'px',
        } // size */
        });
        job.active === false && x.setMap(null);
        //info on hoover on computer
        const infowindow = new google.maps.InfoWindow({
          content: `<h2 class='popup-api-click-h2'>${job.name}</h2> <p class='popup-api-click-p'>${job.short_description}</p>`,
          maxWidth: 400,
          ariaLabel: "text",
        });
        x.addListener("mouseover", () => {
          infowindow.open({
            anchor: x,
            map,
          });
        });
        x.addListener("mouseout", () => {
          infowindow.close({
            anchor: x,
            map,
          });
        });
        //open jobs on click
        x.addListener("click", () => {
          filter_header.classList.remove("filter-header-opened");
          generateJob(null, num);
          opened_job.classList.remove("opened-job-closed");
          opened_job.classList.add("opened-job-min");
          marshrut.href = `https://www.google.com/maps?q=${job.location[1]},${job.location[0]}`;
        });
        arrayOfClickableJobs.push([x, job.type, job.work_for]);
      });
      //add places api
      (function () {
        //on search press simulate enter but it does not work
        const searchPlacesBtn = document.querySelector(".searchPlacesImg");
        const placeInput = document.querySelector(".inputJs");
        const searchBox = new google.maps.places.SearchBox(placeInput);
        searchPlacesBtn.addEventListener("click", () => {
          var event = new Event('keydown');
          event.keyCode = 13; // Enter key
          event.which = 13; // Enter key
          placeInput.dispatchEvent(event);
        })
        //
        map.addListener("bounds_changed", function () {
          searchBox.setBounds(map.getBounds());
        });
        searchBox.addListener("places_changed", function () {
          var places = searchBox.getPlaces();

          if (places.length === 0) {
            return;
          }
          var bounds = new google.maps.LatLngBounds();

          places.forEach(function (place) {
            if (!place.geometry || !place.geometry.location) {
              console.log("Returned place contains no geometry");
              return;
            }
            if (place.geometry.viewport) {
              bounds.union(place.geometry.viewport);
            } else {
              bounds.extend(place.geometry.location);
            }
          });
          map.fitBounds(bounds);
          var zoom = getZoomLevel(bounds, map);
          console.log(zoom);
          map.setZoom(zoom + 3);
          //remove input text and close filter
          placeInput.value = "";
          filter_btn.click();
        });
        // Calculate zoom level based on the width and height of the bounds
      })();
      function getZoomLevel(bounds, map) {
        var zoomMax = map.maxZoom || 20; // Set the maximum zoom level you want to allow
        var zoomMin = 0; // Set the minimum zoom level you want to allow

        var ne = bounds.getNorthEast();
        var sw = bounds.getSouthWest();

        var latDiff = Math.abs(ne.lat() - sw.lat());
        var lngDiff = Math.abs(ne.lng() - sw.lng());

        var latZoomLevel = Math.floor(Math.log2(360 / latDiff));
        var lngZoomLevel = Math.floor(Math.log2(180 / lngDiff));

        var zoomLevel = Math.min(latZoomLevel, lngZoomLevel, zoomMax);
        zoomLevel = Math.max(zoomLevel, zoomMin);

        return zoomLevel;
      }
    }, timeDiff);
  });
}
//filters
typeOfGender.forEach((li) => {
  li.addEventListener("click", () => {
    li.classList.toggle("filter-header-selected");
    removeJob();
  });
});
typeOfWork.forEach((li) => {
  li.addEventListener("click", () => {
    li.classList.toggle("filter-footer-selected");
    removeJob();
  });
});

function removeJob() {
  let CheckedJobs = new Set();
  let footer_selected = document.querySelectorAll(".filter-footer-selected p");
  let header_selected = document.querySelectorAll(".filter-header-selected");
  //type of work
  footer_selected.forEach((pHtml) => {
    arrayOfClickableJobs.forEach((job) => {
      if (pHtml.innerHTML == job[1]) {
        CheckedJobs.add(job[1]);
      }
    });
  });
  header_selected.forEach((pHtml) => {
    let firstLetterOfGender = pHtml.innerHTML
      .match(/[А-Яа-я]/)[0]
      .toLowerCase();
    arrayOfClickableJobs.forEach((job) => {
      if (job[2].includes(firstLetterOfGender)) {
        CheckedJobs.add(firstLetterOfGender);
      }
    });
  });

  //fix if no job of type or gender than remove all jobs
  if (
    (CheckedJobs.size === 0 &&
      document.querySelector(".filter-footer-selected")) ||
    (CheckedJobs.size === 0 &&
      document.querySelector(".filter-header-selected"))
  ) {
    arrayOfClickableJobs.forEach((job) => {
      job[0].setVisible(false);
    });
    return;
  }
  //
  finalRemoval(CheckedJobs);
}
function finalRemoval(CheckedJobs) {
  arrayOfClickableJobs.forEach((job) => {
    if (
      (CheckedJobs.has(job[1]) ||
        document.querySelectorAll(".filter-footer-selected p").length === 0) &&
      (document.querySelectorAll(".filter-header-selected").length === 0 ||
        checkGender())
    ) {
      job[0].setVisible(true);
    } else job[0].setVisible(false);
    function checkGender() {
      let m = false;
      job[2].forEach((x) => {
        if (CheckedJobs.has(x)) m = true;
      });
      return m;
    }
    if (CheckedJobs.size === 0) job[0].setVisible(true);
  });
}
//delete hoover on mob
var windowHeight = window.innerHeight;

// Set the height of the overflowing element
//document.querySelector('body').style.height = windowHeight + 'px';
