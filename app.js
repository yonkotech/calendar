let eventsArr = {};
///////////////////////////////////////////////////// CALENDAR ///////////////////////////////////////
class Calendar {
  constructor() {
    this.currentDate = new Date();
    this.activeDate = new Date();

    //Navigation buttons
    document.querySelector(".goto-date").addEventListener("submit", (event) => {
      event.preventDefault();
      this.goTo(document.querySelector(".date-input").value);
    });
    document.querySelector(".next").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.load(this.currentDate);
      document
        .getElementById(this.formatDate(this.activeDate))
        ?.classList.add("active");
    });
    document.querySelector(".prev").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.load(this.currentDate);
      document
        .getElementById(this.formatDate(this.activeDate))
        ?.classList.add("active");
    });
    document.querySelector(".today-btn").addEventListener("click", () => {
      this.goTo();
    });

    // Obtenir les noms des jours de la semaine dynamiques en fonction de la langue du navigateur
    const week_day_names = [...Array(7).keys()].map((i) =>
      new Intl.DateTimeFormat(navigator.language, { weekday: "short" }).format(
        new Date(2023, 0, i + 2)
      )
    );
    const weekDayContainer = document.querySelector(".weekdays");

    // Nettoyer le conteneur au cas où il contiendrait déjà du contenu
    weekDayContainer.innerHTML = "";

    // Ajouter les noms des jours dans la div
    week_day_names.forEach((day) => {
      let dayDiv = document.createElement("div");
      dayDiv.classList.add("week-day"); // Optionnel : classe CSS pour styliser les jours
      dayDiv.textContent = day;
      weekDayContainer.appendChild(dayDiv);
    });

    this.load();
    this.update();
  }

  formatDate(date) {
    return date
      .toLocaleDateString("fr-FR", { date: "2-digits" })
      .split("/")
      .reverse()
      .join("-");
  }

  load(month_date = new Date()) {
    const calendar = document.querySelector(".calendar");
    const rows = document.querySelectorAll(".calendar .row");

    const firstDay = new Date(
      month_date.getFullYear(),
      month_date.getMonth(),
      0
    );
    const lastDay = new Date(
      month_date.getFullYear(),
      month_date.getMonth() + 1,
      0
    );

    const currentMonth = month_date.toLocaleString("fr-FR", {
      month: "long",
      year: "numeric",
    });

    document.querySelector(".active-date").innerText =
      currentMonth[0].toUpperCase() + currentMonth.substring(1);

    let lastDateToShow = lastDay.getDate() + 7 - lastDay.getDay();

    rows.forEach((row) => {
      row.innerText = "";
    });

    for (let i = -firstDay.getDay() + 1, j = 0; i <= lastDateToShow; i++, j++) {
      const currentDate = new Date(
        month_date.getFullYear(),
        month_date.getMonth(),
        i
      );
      const day = document.createElement("div");
      day.classList.add("day");
      day.innerText = currentDate.getDate();
      day.id = this.formatDate(currentDate);

      eventsArr[day.id] && day.classList.add("event");

      day.addEventListener("click", () => {
        document.querySelectorAll(".day").forEach((day) => {
          day.classList.remove("active");
        });
        day.classList.add("active");
        this.activeDate = new Date(currentDate);

        document.querySelector(".events-list").innerHTML = "";
        if (eventsArr[this.formatDate(this.activeDate)]?.length > 0) {
          document.querySelector(".no-event").classList.add("dropped");

          eventsArr[this.formatDate(this.activeDate)].forEach((event) => {
            const e = document.createElement("div");

            e.innerText = rsm.topics[event.topic_id].name;
            e.classList.add("topic-" + event.topic_id);
            document.querySelector(".events-list").appendChild(e);
          });
        } else {
          document.querySelector(".no-event").classList.remove("dropped");
        }
        this.updateEventsDate();
      });

      if (i < 1) {
        day.classList.add("prev");
      } else if (i > lastDay.getDate()) {
        day.classList.add("next");
      } else {
        if (
          currentDate.getDate() == new Date().getDate() &&
          currentDate.getMonth() == new Date().getMonth() &&
          currentDate.getFullYear() == new Date().getFullYear()
        ) {
          // if( this.activeDate.getDate() == new Date().getDate() &&
          // this.activeDate.getMonth() == new Date().getMonth() &&
          // this.activeDate.getFullYear() == new Date().getFullYear()){
          //   day.click();
          // }
          day.classList.add("today");
        }
      }

      rows[Math.floor(j / 7)].appendChild(day);
    }
  }

  goTo(date = new Date()) {
    const target = new Date(date);
    this.activeDate = new Date(target);
    this.currentDate.setMonth(this.activeDate.getMonth());
    this.currentDate.setFullYear(this.activeDate.getFullYear());

    this.load(this.currentDate);
    document.getElementById(this.formatDate(target)).click();
    this.update();
  }

  update() {
    document.getElementById(this.formatDate(this.activeDate))?.click();
  }
  updateEventsDate() {
    document.querySelectorAll(".current-date").forEach((activeDate) => {
      activeDate.querySelector(".current-day").innerHTML =
        this.activeDate.toLocaleString("fr-FR", { weekday: "long" });
      activeDate.querySelector(".current-month-date").innerHTML =
        this.activeDate.toLocaleString("fr-FR", {
          month: "long",
          day: "2-digit",
        });
    });
    document.querySelectorAll(".full-date").forEach((activeDate) => {
      activeDate.innerHTML = this.activeDate.toLocaleString("fr-FR", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    });
  }
}
///////////////////////////////////////////// REVIEW MANAGER /////////////////////////////////////////
const calendar = new Calendar();

class RevisionSessionManager {
  constructor() {
    this.reviewSessions = [];
    this.topics = [];
  }
  formatDate(date) {
    const result = new Date(date);
    return result
      .toLocaleDateString("fr-FR", { date: "2-digits" })
      .split("/")
      .reverse()
      .join("-");
  }

  addTopic(
    name,
    date = calendar.formatDate(calendar.activeDate),
    intervals = [0, 1, 3, 7, 15, 30, 90, 180, 365, 365, 365, 365]
  ) {
    if (
      name.length < 5 ||
      (this.topics.length > 0 &&
        this.topics.filter((topic) => topic.name == name).length > 0)
    ) {
      return;
    }

    let topic = {
      name: name,
      start_date: this.formatDate(date),
      current_date: this.formatDate(date),
      intervals: intervals,
      level: 0,
    };

    this.topics.push(topic);
    this.generateReviewSessionsFor(this.topics.length - 1);
    localStorage.setItem("review_sessions", JSON.stringify(eventsArr));
    localStorage.setItem("topics", JSON.stringify(this.topics));
  }

  getTopicsForDate(date) {
    return this.topics.filter((topic) => topic.start_date == date);
  }

  generateReviewSessionsFor(topic_id) {
    const topic = this.topics[topic_id];
    // console.log(topic.intervals);

    let topic_level = topic.level;
    topic.intervals.forEach((interval, index) => {
      for (let i = topic.level; i < index; i++) {
        interval += topic.intervals[i];
      }
      let date = new Date(topic.current_date);
      date.setDate(date.getDate() + interval);
      const reviewSession = {
        topic_id: topic_id,
        topic_level: topic_level,
        date: this.formatDate(date),
        realised: false,
      };
      this.reviewSessions.push(reviewSession);

      if (!eventsArr[reviewSession.date]) {
        eventsArr[reviewSession.date] = [];
      }

      document.getElementById(reviewSession.date)?.classList.add("event");
      eventsArr[reviewSession.date].push(reviewSession);
      topic_level++;
    });
    calendar.update();
  }

  upgradeTopicReviewSessions(topic_id) {
    const topic = this.topics[topic_id];
    topic.level++;
    this.reviewSessions
      .filter(
        (reviewSession) =>
          reviewSession.topic_id == topic_id &&
          reviewSession.date == topic.current_date
      )
      .forEach((session) => {
        session.realised = true;
      });

    this.reviewSessions
      .filter(
        (reviewSession) =>
          reviewSession.topic_id == topic_id &&
          reviewSession.topic_level == topic.level
      )
      .forEach((session) => {
        topic.current_date = session.date;
      });
  }

  checkSession(topic_id, realised) {
    if (realised) {
      this.upgradeTopicReviewSessions(topic_id);
    } else {
      this.updateByStepOne(topic_id, this.topics[topic_id].current_date);
    }
  }

  updateByStepOne(topic_id, current_date) {
    //Moving by one
    this.reviewSessions
      .filter(
        (reviewSession) =>
          reviewSession.topic_id == topic_id &&
          new Date(reviewSession.date) >= new Date(current_date)
      )
      .forEach((session) => {
        const date = new Date(session.date);
        date.setDate(date.getDate() + 1);
        session.date = this.formatDate(date);
      });

    //updating the current date
    let date = new Date(current_date);
    date.setDate(date.getDate() + 1);
    this.topics[topic_id].current_date = this.formatDate(date);

    //Put the missed review session
    const reviewSession = {
      topic_id: topic_id,
      topic_level: this.topics[topic_id].level,
      date: current_date,
      realised: false,
    };
    this.reviewSessions.push(reviewSession);
  }

  getReviewSessionsForDate(date) {
    return this.reviewSessions.filter(
      (reviewSession) => reviewSession.date == date
    );
  }

  update() {
    this.reviewSessions.forEach((session) => {
      let yesterday = new Date(session.date);
      let today = new Date(this.formatDate(new Date()));

      const diff = (today - yesterday) / 1000;

      if (diff == 86400) {
        this.checkSession(session.topic_id, false);
      }
    });
  }
}

const rsm = new RevisionSessionManager();

// rsm.addTopic("Principe de recursivite", "2025-02-06");
// rsm.addTopic("Loi de laplace", "2025-02-07");
// rsm.checkSession(0, false);
// console.log(eventsArr["2025-02-08"]);

// console.log(rsm.getReviewSessionsForDate("2025-02-08"));

document.querySelector("#add-topic").addEventListener("click", () => {
  document.querySelector(".add-topic-form").classList.add("active");
});
document.addEventListener("click", (event) => {
  if (
    !document.querySelector(".add-topic-form").contains(event.target) &&
    !document.querySelector("#add-topic").contains(event.target) && 
    !document.querySelector(".calendar").contains(event.target)
  ) {
    document.querySelector(".add-topic-form").classList.remove("active");
  }
});
document
  .querySelector(".add-topic-form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.querySelector(".add-topic-form .name").value;
    rsm.addTopic(name);
    document.querySelector(".add-topic-form").reset();
  });
document
  .querySelector(".add-event-btn")
  .addEventListener("click", (event) => {
    document.querySelector(".add-topic-form.tab").classList.add("active");
    console.log("visible");
    
    // rsm.addTopic(name);
    // document.querySelector(".add-topic-form").reset();
  });

window.addEventListener("load", () => {
  if (JSON.parse(localStorage.getItem("review_sessions"))) {
    eventsArr = JSON.parse(localStorage.getItem("review_sessions"));
  }
  if (JSON.parse(localStorage.getItem("topics"))) {
    rsm.topics = JSON.parse(localStorage.getItem("topics"));
  }
  calendar.load();
  calendar.update();
});
// if(JSON.parse(localStorage.getItem("topics"))){
//   rsm.topics = localStorage.getItem("topics");
// }
