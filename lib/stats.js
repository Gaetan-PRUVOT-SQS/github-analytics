function languagesToPercent(languagesObj) {
  var list = [];
  var total = 0;
  var name;

  for (name in languagesObj) {
    if (Object.prototype.hasOwnProperty.call(languagesObj, name)) {
      total = total + languagesObj[name];
    }
  }

  if (total === 0) {
    return {
      languages: [],
      totalBytes: 0,
      totalSizeLabel: formatBytes(0),
      languageCount: 0,
      dominant: null,
    };
  }

  // tous les langages, triés du plus présent au moins présent
  for (name in languagesObj) {
    if (Object.prototype.hasOwnProperty.call(languagesObj, name)) {
      var value = languagesObj[name];
      list.push({
        name: name,
        value: value,
        // % brut (2 décimales), ajusté plus bas pour totaliser 100
        percent: Math.round((value / total) * 10000) / 100,
        sizeLabel: formatBytes(value),
      });
    }
  }

  list.sort(function (a, b) {
    return b.value - a.value;
  });

  // ajuste le 1er langage pour que la somme des % = 100
  var sumOthers = 0;
  var i;
  for (i = 1; i < list.length; i++) {
    sumOthers = sumOthers + list[i].percent;
  }
  if (list.length > 0) {
    list[0].percent = Math.round((100 - sumOthers) * 100) / 100;
    if (list[0].percent < 0) {
      list[0].percent = 0;
    }
  }

  // percentLabel pour l'affichage (ex. "51.70 %" ou "< 0.01 %")
  for (i = 0; i < list.length; i++) {
    if (list[i].value > 0 && list[i].percent === 0) {
      list[i].percentLabel = "< 0.01 %";
    } else {
      list[i].percentLabel = list[i].percent.toFixed(2) + " %";
    }
  }

  return {
    languages: list,
    totalBytes: total,
    totalSizeLabel: formatBytes(total),
    languageCount: list.length,
    dominant: list[0] || null,
  };
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return bytes + " o";
  }
  if (bytes < 1024 * 1024) {
    return Math.round((bytes / 1024) * 10) / 10 + " Ko";
  }
  return Math.round((bytes / (1024 * 1024)) * 10) / 10 + " Mo";
}

function getCommitDate(commitItem) {
  if (commitItem.commit && commitItem.commit.author && commitItem.commit.author.date) {
    return commitItem.commit.author.date.slice(0, 10);
  }
  return null;
}

function getCommitDateTime(commitItem) {
  if (commitItem.commit && commitItem.commit.author && commitItem.commit.author.date) {
    return commitItem.commit.author.date;
  }
  return null;
}

function getCommitAuthor(commitItem) {
  if (commitItem.author && commitItem.author.login) {
    return commitItem.author.login;
  }
  if (commitItem.commit && commitItem.commit.author && commitItem.commit.author.name) {
    return commitItem.commit.author.name;
  }
  return "inconnu";
}

function groupCommitsByDay(commits) {
  var map = {};
  var i;
  var result = [];

  for (i = 0; i < commits.length; i++) {
    var day = getCommitDate(commits[i]);
    if (day) {
      if (!map[day]) {
        map[day] = 0;
      }
      map[day] = map[day] + 1;
    }
  }

  var dates = Object.keys(map);
  dates.sort();

  for (i = 0; i < dates.length; i++) {
    result.push({
      date: dates[i],
      count: map[dates[i]],
    });
  }

  return result;
}

function countCommitsByWeekday(commits) {
  // 0 = dimanche en JS → on réordonne Lun → Dim
  var labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  var counts = [0, 0, 0, 0, 0, 0, 0];
  var i;

  for (i = 0; i < commits.length; i++) {
    var day = getCommitDate(commits[i]);
    if (day) {
      var date = new Date(day + "T12:00:00");
      var jsDay = date.getDay();
      var index;
      if (jsDay === 0) {
        index = 6;
      } else {
        index = jsDay - 1;
      }
      counts[index] = counts[index] + 1;
    }
  }

  var result = [];
  for (i = 0; i < 7; i++) {
    result.push({
      day: labels[i],
      count: counts[i],
    });
  }
  return result;
}

function countCommitsByHour(commits) {
  var counts = [];
  var i;
  for (i = 0; i < 24; i++) {
    counts.push({ hour: i + "h", count: 0, hourNum: i });
  }

  for (i = 0; i < commits.length; i++) {
    var iso = getCommitDateTime(commits[i]);
    if (iso) {
      var date = new Date(iso);
      var hour = date.getUTCHours();
      counts[hour].count = counts[hour].count + 1;
    }
  }

  return counts;
}

function countCommitsByAuthor(commits) {
  var map = {};
  var i;
  var total = commits.length;

  for (i = 0; i < commits.length; i++) {
    var author = getCommitAuthor(commits[i]);
    if (!map[author]) {
      map[author] = 0;
    }
    map[author] = map[author] + 1;
  }

  var list = [];
  var name;
  for (name in map) {
    if (Object.prototype.hasOwnProperty.call(map, name)) {
      var count = map[name];
      var percent = 0;
      if (total > 0) {
        percent = Math.round((count / total) * 1000) / 10;
      }
      list.push({
        login: name,
        count: count,
        percent: percent,
      });
    }
  }

  list.sort(function (a, b) {
    return b.count - a.count;
  });

  return list;
}

function levelFromCount(count) {
  if (count <= 0) {
    return 0;
  }
  if (count === 1) {
    return 1;
  }
  if (count <= 3) {
    return 2;
  }
  if (count <= 6) {
    return 3;
  }
  return 4;
}

function buildHeatmap(commits) {
  var byDay = groupCommitsByDay(commits);
  var result = [];
  var i;

  for (i = 0; i < byDay.length; i++) {
    result.push({
      date: byDay[i].date,
      count: byDay[i].count,
      level: levelFromCount(byDay[i].count),
    });
  }

  return result;
}

// résumé chiffré des commits (échantillon)
function analyzeCommits(commits) {
  var timeline = groupCommitsByDay(commits);
  var byWeekday = countCommitsByWeekday(commits);
  var byHour = countCommitsByHour(commits);
  var byAuthor = countCommitsByAuthor(commits);
  var heatmap = buildHeatmap(commits);

  var total = commits.length;
  var activeDays = timeline.length;
  var avgPerDay = 0;
  if (activeDays > 0) {
    avgPerDay = Math.round((total / activeDays) * 10) / 10;
  }

  var peakDay = null;
  var maxDayCount = 0;
  var i;
  for (i = 0; i < timeline.length; i++) {
    if (timeline[i].count > maxDayCount) {
      maxDayCount = timeline[i].count;
      peakDay = timeline[i];
    }
  }

  var peakWeekday = null;
  var maxWeekCount = 0;
  for (i = 0; i < byWeekday.length; i++) {
    if (byWeekday[i].count > maxWeekCount) {
      maxWeekCount = byWeekday[i].count;
      peakWeekday = byWeekday[i];
    }
  }

  var peakHour = null;
  var maxHourCount = 0;
  for (i = 0; i < byHour.length; i++) {
    if (byHour[i].count > maxHourCount) {
      maxHourCount = byHour[i].count;
      peakHour = byHour[i];
    }
  }

  var firstDate = null;
  var lastDate = null;
  if (timeline.length > 0) {
    firstDate = timeline[0].date;
    lastDate = timeline[timeline.length - 1].date;
  }

  // span en jours entre premier et dernier commit de l'échantillon
  var spanDays = 0;
  if (firstDate && lastDate) {
    var t1 = new Date(firstDate + "T12:00:00").getTime();
    var t2 = new Date(lastDate + "T12:00:00").getTime();
    spanDays = Math.round((t2 - t1) / (1000 * 60 * 60 * 24)) + 1;
  }

  var avgOverSpan = 0;
  if (spanDays > 0) {
    avgOverSpan = Math.round((total / spanDays) * 10) / 10;
  }

  // top 5 jours les plus actifs
  var topDays = timeline.slice();
  topDays.sort(function (a, b) {
    return b.count - a.count;
  });
  topDays = topDays.slice(0, 5);

  // messages de commit : longueur moyenne
  var messageTotalLength = 0;
  var messageCount = 0;
  for (i = 0; i < commits.length; i++) {
    if (commits[i].commit && commits[i].commit.message) {
      var msg = commits[i].commit.message.split("\n")[0];
      messageTotalLength = messageTotalLength + msg.length;
      messageCount = messageCount + 1;
    }
  }
  var avgMessageLength = 0;
  if (messageCount > 0) {
    avgMessageLength = Math.round(messageTotalLength / messageCount);
  }

  return {
    total: total,
    activeDays: activeDays,
    spanDays: spanDays,
    avgPerActiveDay: avgPerDay,
    avgOverSpan: avgOverSpan,
    firstDate: firstDate,
    lastDate: lastDate,
    peakDay: peakDay,
    peakWeekday: peakWeekday,
    peakHour: peakHour,
    topDays: topDays,
    authorCount: byAuthor.length,
    topAuthors: byAuthor.slice(0, 10),
    avgMessageLength: avgMessageLength,
    timeline: timeline,
    byWeekday: byWeekday,
    byHour: byHour,
    heatmap: heatmap,
  };
}

function enrichContributors(contributors) {
  var total = 0;
  var i;
  for (i = 0; i < contributors.length; i++) {
    total = total + contributors[i].contributions;
  }

  var list = [];
  for (i = 0; i < contributors.length; i++) {
    var item = contributors[i];
    var percent = 0;
    if (total > 0) {
      percent = Math.round((item.contributions / total) * 1000) / 10;
    }
    list.push({
      login: item.login,
      avatar_url: item.avatar_url,
      html_url: item.html_url,
      contributions: item.contributions,
      percent: percent,
    });
  }

  return {
    contributors: list,
    totalContributions: total,
    contributorCount: list.length,
    topContributor: list.length > 0 ? list[0] : null,
  };
}

function filterIssuesOnly(items) {
  var result = [];
  var i;
  for (i = 0; i < items.length; i++) {
    // les issues qui sont des PR ont un champ pull_request
    if (!items[i].pull_request) {
      result.push(items[i]);
    }
  }
  return result;
}

// âge du dépôt en jours / texte
function repoAgeDays(createdAt) {
  if (!createdAt) {
    return null;
  }
  var created = new Date(createdAt).getTime();
  var now = Date.now();
  return Math.floor((now - created) / (1000 * 60 * 60 * 24));
}

function formatAge(days) {
  if (days === null || days === undefined) {
    return "—";
  }
  if (days < 30) {
    return days + " jours";
  }
  if (days < 365) {
    var months = Math.round(days / 30);
    return months + " mois";
  }
  var years = Math.round((days / 365) * 10) / 10;
  return years + " ans";
}

function formatSizeKb(sizeKb) {
  if (sizeKb === null || sizeKb === undefined) {
    return "—";
  }
  if (sizeKb < 1024) {
    return sizeKb + " Ko";
  }
  return Math.round((sizeKb / 1024) * 10) / 10 + " Mo";
}

// true si uniquement de la doc type README (pas de langage de prog)
function isDocumentationOnly(languages) {
  if (!languages || languages.length === 0) {
    return false;
  }
  // seulement Markdown / MDX = dépôt doc / profil
  var i;
  for (i = 0; i < languages.length; i++) {
    var name = languages[i].name;
    if (name !== "Markdown" && name !== "MDX") {
      return false;
    }
  }
  return true;
}

// ajoute les flags d'info sur un objet analysis langages
function markLanguageAnalysis(analysis) {
  if (!analysis) {
    return analysis;
  }
  var langs = analysis.languages || [];
  analysis.documentationOnly = isDocumentationOnly(langs);
  if (analysis.documentationOnly && analysis.detected) {
    analysis.infoMessage =
      "Ce dépôt ne contient que de la documentation ou des fichiers de config " +
      "(ex. README). Aucun langage de programmation n'a été trouvé. " +
      "Ce n'est pas un bug de détection.";
    if (!analysis.note) {
      analysis.note = analysis.infoMessage;
    }
  }
  return analysis;
}

export {
  languagesToPercent,
  formatBytes,
  groupCommitsByDay,
  countCommitsByWeekday,
  countCommitsByHour,
  countCommitsByAuthor,
  buildHeatmap,
  analyzeCommits,
  enrichContributors,
  filterIssuesOnly,
  repoAgeDays,
  formatAge,
  formatSizeKb,
  isDocumentationOnly,
  markLanguageAnalysis,
};
