const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv/config");
const fs = require("fs");
const { ImageAnnotatorClient } = require("@google-cloud/vision");

const app = express();
const port = 3000;


/**
 * 
 * 
 * NEW METHOD:
 * SEPERATE STATIONS BY BOTTOM TIMES POSITIONS.
 * USE SAME LOGIC TO GET POSITIONS
 * BUT ONLY GET ONE POSITION AT A TIME
 * 
 */

app.use(bodyParser.json());
app.use(cors());


let topLeft = [0, 0];
let bottomLeft = [0, 0];
let topRight = [0, 0];
let bottomRight = [0, 0];

app.post("/", async (req, res) => {
  //console.log(req.body.fileUrl)
  const imageBuffer = fs.readFileSync(req.body.fileUrl);

  // Process the image buffer as needed
  // For example, you can use it in your API call
  try {
    // Performs label detection on the image file
    const client = new ImageAnnotatorClient();

    /**
     * TODO(developer): Uncomment the following line before running the sample.
     */
    

    // Performs text detection on the local file
    const [result] = await client.textDetection(imageBuffer);
    const detections = result.textAnnotations;
    let schedule = [];
    // console.log(detections[detections.length - 1])
    topRight[0] = detections[detections.length - 1].boundingPoly.vertices[2].x;
    bottomRight[0] =
      detections[detections.length - 1].boundingPoly.vertices[1].x;

    findRowBounds(detections);

    detections.forEach((detection) => {
      if (detection.boundingPoly !== undefined) {
        let point = [
          detection.boundingPoly.vertices[0].x,
          detection.boundingPoly.vertices[0].y,
        ];
        if(inBounds(point)){
          schedule.push(detection.description)

        }
        //console.log(`DETECTION, (${detection.description})\n vertecies: (${detection.boundingPoly.vertices[0].x},${detection.boundingPoly.vertices[0].y}), (${detection.boundingPoly.vertices[1].x},${detection.boundingPoly.vertices[1].y}), (${detection.boundingPoly.vertices[2].x},${detection.boundingPoly.vertices[2].y}), (${detection.boundingPoly.vertices[3].x},${detection.boundingPoly.vertices[3].y}) \n\n`)
      }
    });

    res.json({
      schedule: schedule,
    });
  } catch (error) {
    console.error("Error performing label detection:", error);
    return [];
  }

  // res.json({
  //   return the labels
  // });
});
//function will take the slope of the two points, then return the height at a given point, x3

/**
 *
 * @param {point} p1 2 element array for first point
 * @param {point} p2 2 element array for second point
 *
 * @param {number} x an x-coordinate to find the y coordinate following the line by p1 and p2
 * @returns int y, the y coordinate to create p3, a point on the line p1-p2
 */
function getMaxHeight(p1, p2, x) {
  let y = 0;

  let x1 = p1[0];
  let x2 = p2[0];
  let y1 = p1[1];
  let y2 = p2[1];

  let slope = (y2 - y1) / (x2 - x1);
  let b = y2 - slope * x2;

  y = slope * x + b;

  return y;
}

function inBounds(point) {
  let x = point[0];
  let y = point[1];
  return (
    (y > topLeft[1] - 20 || y > topRight[1] - 20) &&
    (y < bottomLeft[1]  || y < bottomRight[1])
  );
}

function findRowBounds(detections) {
  for (let i = 0; i < detections.length; i++) {
    let detection = detections[i];
    if (detection.description === "Yassine") {
      //console.log(detection.boundingPoly.vertices)
      topLeft[0] = detection.boundingPoly.vertices[0].x; //gets x value of box vertex in the top left.
      topLeft[1] = detection.boundingPoly.vertices[0].y;
      bottomLeft[0] = detection.boundingPoly.vertices[3].x;
       bottomLeft[1] = detection.boundingPoly.vertices[3].y;

      //small box corners to find the shape and total height of the row
      let tempTopRight = [
        detection.boundingPoly.vertices[1].x,
        detection.boundingPoly.vertices[1].y,
      ];
      let tempBottomRight = [
        detection.boundingPoly.vertices[0].x,
        detection.boundingPoly.vertices[0].y,
      ];
      topRight[1] = getMaxHeight(topLeft, tempTopRight, topRight[0]) + 10;
      bottomRight[1] = getMaxHeight(
        bottomLeft,
        tempBottomRight,
        bottomRight[0]
      ) +10;

      break;
    }
  }
}


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
