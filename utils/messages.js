const moment = require("moment");

function formatMessage(
  Id,
  username,
  text,
  time,
  isSeen = false,
  isDelivered = false,
  isSender = false
) {
  return {
    Id,
    username,
    text,
    isSeen,
    isDelivered,
    isSender,
    time: moment(time, "YYYY-MM-DD hh:mm:ss").utc().format("h:mm A"),
  };
}

function formatLastSeen(date) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const d = new Date(date);

  const year = d.getFullYear();
  const dateOfMonth = d.getDate();

  const monthName = months[d.getMonth()];

  const dayName = days[d.getDay()];

  const localConvert = d.toLocaleString();

  const extractTime = localConvert.split(",")[1].split(":");

  const hour = extractTime[0];

  const minute = extractTime[1];

  const ap = extractTime[extractTime.length - 1].split(" ")[1];

  const time = `${dayName}, ${dateOfMonth} ${monthName} ${year} At ${hour}:${minute} ${ap}`;

  return time;
}

module.exports.FormatMessage = formatMessage;
module.exports.FormatLastSeen = formatLastSeen;
