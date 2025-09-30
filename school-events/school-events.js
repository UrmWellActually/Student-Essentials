const daysTag = document.querySelector(".days"),
    currentDate = document.querySelector(".current-date"),
    prevNextIcon = document.querySelectorAll(".icons ion-icon");

// getting new date, current year and month
let date = new Date(),
    currYear = date.getFullYear(),
    currMonth = date.getMonth();

// storing full name of all months in array
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

// Predefined holidays (in "day month" format)
const holidays = [
    "1 1",
    "16 1",
    "17 1",
    "20 1",
    "21 1",
    "22 1",
    "23 1",
    "24 1",
    "27 1",
    "28 1",
    "29 1",
    "30 1",
    "31 1",
    "3 2",
    "4 2",
    "5 2",
    "6 2",
    "7 2",
    "10 2",
    "11 2",
    "12 2",
    "13 2",
    "14 2",
    "17 2",
    "18 3",
    "31 3",
    "1 4",
    "2 4",
    "3 4",
    "4 4",
    "1 5",
    "12 5",
    "30 5",
    "2 6",
    "3 6",
    "4 6",
    "5 6",
    "6 6",
    "9 6",
    "27 6",
    "29 8",
    "1 9",
    "2 9",
    "3 9",
    "4 9",
    "5 9",
    "8 9",
    "16 9",
    "20 10",
    "21 10",
    "22 10",
    "23 10",
    "24 10",
    "11 12",
    "19 12",
    "22 12",
    "23 12",
    "24 12",
    "25 12",
    "26 12",
    "29 12",
    "30 12",
    "31 12",
];

const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(),
        lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(),
        lastDayofMonth = new Date(
            currYear,
            currMonth,
            lastDateofMonth
        ).getDay(),
        lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate();

    let liTag = "";

    // Loop through the days of the previous month
    for (let i = firstDayofMonth; i > 0; i--) {
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }

    // Loop through all days of the current month
    for (let i = 1; i <= lastDateofMonth; i++) {
        let isToday =
            i === date.getDate() &&
            currMonth === new Date().getMonth() &&
            currYear === new Date().getFullYear()
                ? "active"
                : "";

        // Check if the current day is a holiday
        let currentDayMonth = `${i} ${currMonth + 1}`; // Format: "day month"
        if (holidays.includes(currentDayMonth)) {
            isToday += " holiday"; // Add holiday class
        }

        liTag += `<li class="${isToday}">${i}</li>`;
    }

    // Loop through the days of the next month to fill the calendar grid
    for (let i = lastDayofMonth; i < 6; i++) {
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`;
    }

    // Set the current month and year in the header
    currentDate.innerText = `${months[currMonth]} ${currYear}`;

    // Inject the generated HTML into the calendar
    daysTag.innerHTML = liTag;
};

// Initial render of the calendar
renderCalendar();

prevNextIcon.forEach((icon) => {
    icon.addEventListener("click", () => {
        // Update the month first
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

        // Adjust the year and month if the month goes out of bounds
        if (currMonth < 0 || currMonth > 11) {
            date = new Date(currYear, currMonth, new Date().getDate());
            currYear = date.getFullYear();
            currMonth = date.getMonth();
        } else {
            date = new Date();
        }

        // Block 2024 and 2026
        if (currYear === 2024 || currYear === 2026) {
            // Revert the year change to the previous year
            currYear = icon.id === "prev" ? currYear + 1 : currYear - 1;
            // Optionally, you can add an alert to inform the user
            alert("This year is not available.");
            return; // Exit the function to prevent rendering the calendar
        }

        renderCalendar(); // Re-render the calendar with the new date
    });
});
