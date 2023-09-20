const ics = require('ics')

let schedule = {}
const fileUrl = `./IMG_3214.jpg`;
const positions =  {"TBHExit": "Butterfly House Exit", "B2": "Building 2 Roam", "TBHIn": "Butterfly House Enterance", "Lu": "Lunch", "Tidepool":"Tidepool",}

fetch('http://localhost:3000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({"fileUrl": fileUrl}),
  })
  .then(response => response.json())
  .then(data => {
    dataClean(data.schedule);
  })
  .catch(error => {
    console.error('Error:', error);
  });


function dataClean (schedule) {
  let clean = [];
  let i = 0;
  schedule = schedule.slice(1);
  for (let i = 0; i < schedule.length; i++) {
    let duration = 0;
    if (schedule[i] in positions) {
      pos = schedule[i]
      duration = 60
      clean.push({`${schedule[i]}`:duration})
    } else{
      if (schedule[i+1] == '/'){
        if
        clean.push(schedule[i] + schedule[i+1] + schedule[i+2]);
        i+=2
      }
    }
  }
  console.log(clean)
}