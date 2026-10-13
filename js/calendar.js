/* Upcoming shows: fetches Google Calendar events and renders them in our own
   markup so the styling is entirely ours (no Google iframe). */
(function () {
  const cfg = window.POWERNAP_CONFIG || {};
  const list = document.getElementById("shows-list");
  const sub = document.getElementById("shows-sub");
  const subscribe = document.getElementById("shows-subscribe");
  if (!list) return;

  const configured = Boolean(cfg.calendarId && cfg.apiKey);

  // ---------- data ----------

  async function fetchFromGoogle() {
    const params = new URLSearchParams({
      key: cfg.apiKey,
      timeMin: new Date().toISOString(),
      singleEvents: "true",      // expand recurring events
      orderBy: "startTime",
      maxResults: String(cfg.maxResults || 8),
    });
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cfg.calendarId)}/events?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Calendar API ${res.status}`);
    const data = await res.json();
    return (data.items || []).map(normalize);
  }

  // Google event → our shape. Everything the renderer needs lives here, so
  // swapping the data source later (ICS, your own backend) only touches this file.
  function normalize(ev) {
    const allDay = !ev.start.dateTime;
    return {
      id: ev.id,
      title: ev.summary || "Untitled show",
      start: new Date(ev.start.dateTime || ev.start.date + "T00:00:00"),
      end: ev.end ? new Date(ev.end.dateTime || ev.end.date + "T00:00:00") : null,
      allDay,
      location: ev.location || "",
      description: ev.description || "",
      link: ev.htmlLink || "",
    };
  }

  // Sample data shown while the calendar isn't configured yet.
  function sampleShows() {
    const d = (days, h) => { const x = new Date(); x.setDate(x.getDate() + days); x.setHours(h, 0, 0, 0); return x; };
    return [
      { id: "s1", title: "PowerNap live", start: d(9, 20), allDay: false, location: "The Blue Note, Columbia, MO", link: "" },
      { id: "s2", title: "Basement show w/ friends", start: d(23, 21), allDay: false, location: "Ask a band member", link: "" },
      { id: "s3", title: "Fall fest", start: d(41, 0), allDay: true, location: "Peace Park", link: "" },
    ];
  }

  // ---------- render ----------

  const fmt = {
    date: new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }),
    time: new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }),
  };

  function el(tag, attrs = {}, children = []) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else n.setAttribute(k, v);
    }
    for (const c of children) if (c) n.append(c);
    return n;
  }

  // One table row per show: When | Show | Where
  function renderShow(show) {
    const when = el("td", { class: "when" }, [
      el("time", { datetime: show.start.toISOString() }, [
        el("b", { text: fmt.date.format(show.start) }),
        document.createTextNode(show.allDay ? "all day" : fmt.time.format(show.start)),
      ]),
    ]);

    const title = show.link
      ? el("a", { href: show.link, target: "_blank", rel: "noopener" }, [el("b", { text: show.title })])
      : el("b", { text: show.title });
    const what = el("td", { class: "what" }, [title]);

    const where = el("td", { class: "where" }, [
      show.location
        ? el("a", {
            href: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(show.location),
            target: "_blank", rel: "noopener", text: show.location,
          })
        : el("span", { text: "TBA" }),
    ]);

    return el("tr", {}, [when, what, where]);
  }

  function renderMessage(text, cls) {
    list.replaceChildren(el("tr", { class: cls }, [el("td", { colspan: "3", text })]));
  }

  function render(shows) {
    list.setAttribute("aria-busy", "false");
    if (!shows.length) return renderMessage("Nothing on the books yet. Check back soon!", "row--empty");
    list.replaceChildren(...shows.map(renderShow));
  }

  // ---------- go ----------

  (async () => {
    if (!configured) {
      sub.append(" (Sample data: add your calendar ID + API key in js/config.js.)");
      render(sampleShows());
      return;
    }
    subscribe.href = "https://calendar.google.com/calendar/u/0/r?cid=" + encodeURIComponent(cfg.calendarId);
    subscribe.hidden = false;
    try {
      render(await fetchFromGoogle());
    } catch (err) {
      console.error(err);
      list.setAttribute("aria-busy", "false");
      renderMessage("Couldn't load shows right now. Try again in a bit.", "row--empty");
    }
  })();
})();
