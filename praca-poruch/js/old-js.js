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
  const kmlData = new DOMParser().parseFromString(kml, "text/xml");
  const convertedData = toGeoJSON.kml(kmlData);
  // Perform further operations with the converted JSON data here
  for (
    let jobCounter = 0;
    convertedData.features.length > jobCounter;
    jobCounter++
  ) {
    let widthoutImg = convertedData.features[
      jobCounter
    ].properties.description.replace(/.* width="auto" \/><br><br>/, "");
    let longDesc = widthoutImg.replace(/\[(.*?)\]/, "").trim();
    longDesc = longDescFunc(longDesc);
    jobs.push({
      name: convertedData.features[jobCounter].properties.name.replace(
        /\[[^\]]*\]/g,
        ""
      ),
      short_description: shortDescFunc(widthoutImg, longDesc),
      long_description: longDesc,
      image: convertedData.features[jobCounter].properties.gx_media_links,
      active: true,
      work_for: /\[/.test(convertedData.features[jobCounter].properties.name)
        ? convertedData.features[jobCounter].properties.name
            .match(/\[(.*?)\]/)[1]
            .replace(/\s/g, "")
            .toLowerCase()
            .split(",")
        : ["ж", "ч", "п", "д"],
      type: typeOfWork(convertedData.features[jobCounter].properties.styleUrl),
      location: convertedData.features[jobCounter].geometry.coordinates,
    });
  }
  function typeOfWork(type) {
    if (type === "#icon-1899-0288D1") return "Різнорабочі";
    if (type === "#icon-1899-4E342E-labelson") return "Cпеціалісти";
    if (type === "#icon-1899-0F9D58") return "Польові роботи";
    if (type === "#icon-1899-F57C00") return "Різне";
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

    return rebuildedLong2.join("");
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
function initMap() {
  map = new google.maps.Map(document.querySelector(".map"), {
    center: new google.maps.LatLng(52.219064, 19.467729),
    zoom: 5,
  });
  //creating jobs
  jobs.forEach((job, num) => {
    let x = new google.maps.Marker({
      position: { lat: job.location[1], lng: job.location[0] },
      map: map,
      title: job.name,
      icon:
        job.type == "Різнорабочі"
          ? "img/pin/blue-map.svg"
          : job.type == "Cпеціалісти"
          ? "img/pin/black-map.svg"
          : job.type == "Польові роботи"
          ? "img/pin/green-map.svg"
          : "img/pin/orange-map.svg",
      scaledSize: new google.maps.Size(323, 483),
    });

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
    //name of job under pin
    /* const infowindowUnder = new google.maps.InfoWindow({
  content: job.name,
  maxWidth: 200,
  ariaLabel: "text",
  pixelOffset: new google.maps.Size(0, 150)
});
infowindowUnder.open({
  anchor: x,
  map,
}); */

    //open jobs on click

    x.addListener("click", () => {
      generateJob(null, num);
      opened_job.classList.remove("opened-job-closed");
      opened_job.classList.add("opened-job-min");
      marshrut.href = `https://www.google.com/maps?q=${job.location[1]},${job.location[0]}`;
    });
    arrayOfClickableJobs.push([x, job.type, job.work_for]);
  });

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
    let footer_selected = document.querySelectorAll(
      ".filter-footer-selected p"
    );
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
    finalRemoval(CheckedJobs);
  }
  function finalRemoval(CheckedJobs) {
    arrayOfClickableJobs.forEach((job) => {
      if (
        (CheckedJobs.has(job[1]) ||
          document.querySelectorAll(".filter-footer-selected p").length ===
            0) &&
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

  google.maps.event.addListenerOnce(map, "tilesloaded", function () {
    // Map has finished loading
    console.log("Map has finished loading.");
  });
}
