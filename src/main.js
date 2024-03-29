const ics = require("ics");
const fetch = require("node-fetch");
const fs = require("fs");
let year = new Date().getFullYear();
let day = new Date().getDate();
let month = new Date().getMonth();
const fileUrl = `./IMG_0074.jpg`;

const positions = {
  TBHExit: "Butterfly House Exit",
  TBHIn: "Butterfly House Enterance",
  Tidepool: "Tidepool",
};
let times = [
  "9:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-17:15",
];
let startTime = 0;
let endTime = 8;
let finalSchedule = [];

function getScheduleData() {
  fetch("http://localhost:3000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileUrl: fileUrl }),
  })
    .then((response) => response.json())
    .then((data) => {
      clean = cleanData(data.schedule);
      finalSchedule = defSchedule(clean);
      console.log(finalSchedule)

      const events = finalSchedule.map((item) => {
        const title = Object.keys(item)[0];
        const time = item[title];
        if (time == undefined) {
          return null;
          // {
          //  start: [year, month, day, 0, 0], // Assuming time format is "HH:mm-HH:mm"
          //  end: [year, month, day, 0, 1], // Splitting start and end times
          //  title: "Bug",
          //};
        }
        //console.log(time)
        return {
          start: [
            year,
            month + 1,
            day,
            /**hour */ parseInt(time.split("-")[0].split(":")[0]),
            parseInt(time.split("-")[0].split(":")[1]),
          ], // Assuming time format is "HH:mm-HH:mm"
          end: [
            year,
            month + 1,
            day,
            /**hour */ parseInt(time.split("-")[1].split(":")[0]),
            parseInt(time.split("-")[1].split(":")[1]),
          ], // Splitting start and end times
          title: title,
        };
      }).filter(event => event !== null); // Filter out null values;

      //console.log(JSON.stringify(events));
      //console.log(`FINAL SCHEDULE: ${JSON.stringify(finalSchedule, null, 1)}`);
      const { error, value } = ics.createEvents(events);

      if (error) {
        console.error("Error:", error);
      } else {
        fs.writeFileSync("schedule.ics", value);
        console.log("ICS file written successfully!");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function cleanData(schedule) {
  let clean = [];
  let i = 0;
  schedule = schedule.slice(1);
  for (let i = 0; i < schedule.length; i++) {
    if (schedule[i + 1] == "/") {
      clean.push(schedule[i] + schedule[i + 1] + schedule[i + 2]);
      i += 2;
    } else if(schedule[i] == "("){
      let specialHours = schedule[i+1] //when parenthasies show up, it means special hours
      let tempStart = parseInt(specialHours[0])
      let tempEnd = parseInt(specialHours[2])
      
      startTime = tempStart > 8 ? tempStart - 9 : tempStart - 6 + startTime; // never start before 9, and never end past 7
      endTime =  tempEnd == 12?  3: 2 + endTime;
      i+=2
    }
     else {
      clean.push(schedule[i]);
      //console.log(`scheudle[i] ${schedule[i]}`)
    }
  }
  // console.log(clean);
  return clean;
}

function defSchedule(schedule) {
  let newSchedule = [];
  let n = startTime;

  if (n == 0) {
    title = "Morning Meeting + Prep";
    let obj = {};
    obj[title] = times[n];
    n++;
    newSchedule.push(obj);
  }

  for (let i = 0; i < schedule.length; i++) {
    //console.log(schedule)
    let title = "";
    if (i < 2) {
      title = schedule[i];
    } else if (schedule[i] in positions) {
      title = schedule[i];
    } else if (schedule[i] == "Lu") {
      title = schedule[i] + " -> " + schedule[i + 1];
      i++;
    } else if (schedule[i + 1] == "Lu") {
      //console.log(`schedule[${i}] is ${schedule[i]} `)
      title = schedule[i] + " -> " + schedule[i + 1];
      i++;
    } else if (n == endTime) {
      title = schedule.slice(i, schedule.length + 1).join(" ");
    } else {
      title = schedule[i];
    }
    let obj = {};
    obj[title] = times[n];
    n++;
    newSchedule.push(obj);
  }
  return newSchedule;
}

getScheduleData();
