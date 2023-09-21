const { json } = require("body-parser");
const ics = require("ics");

let schedule = {};
const fileUrl = `./IMG_3219.jpg`;
const positions = {
  TBHExit: "Butterfly House Exit",
  TBHIn: "Butterfly House Enterance",
  Tidepool: "Tidepool",
};
let times = [
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-17:15"
];
let finalSchedule = [];

fetch("http://localhost:3000", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ fileUrl: fileUrl }),
})
  .then((response) => response.json())
  .then((data) => {
    clean = dataClean(data.schedule);
    finalSchedule = defSchedule(clean);

    const events = finalSchedule.map(item => {
      const title = Object.keys(item)[0];
      const time = item[title];
      
      return {
        start: time.split("-")[0], // Assuming time format is "HH:mm-HH:mm"
        end: time.split("-")[1],   // Splitting start and end times
        title: title
      };
    });
    
    console.log(JSON.stringify(events))
    //console.log(`FINAL SCHEDULE: ${JSON.stringify(finalSchedule, null, 1)}`);
    
  })
  .catch((error) => {
    console.error("Error:", error);
  });

function dataClean(schedule) {
  let clean = [];
  let i = 0;
  schedule = schedule.slice(1);
  for (let i = 0; i < schedule.length; i++) {
    if (schedule[i + 1] == "/") {
      clean.push(schedule[i] + schedule[i + 1] + schedule[i + 2]);
      i += 2;
    } else {
      clean.push(schedule[i]);
    }
  }
  // console.log(clean);
  return clean;
}

function defSchedule(schedule) {
  let newSchedule = [];
  let n = 0;
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
    } else if(times[n] == "17:00-17:15") {
      title = schedule.slice(i, schedule.length + 1).join(' ')
    }
    else {
      title = schedule[i];
    }
    let obj = {};
    obj[title] = times[n];
    n++;
    newSchedule.push(obj);
  }
  return newSchedule;
}


