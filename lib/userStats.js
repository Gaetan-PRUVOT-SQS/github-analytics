// agrège les stats d'une liste de dépôts GitHub (compte entier)

function aggregateRepos(repos) {
  var totalStars = 0;
  var totalForks = 0;
  var totalWatchers = 0;
  var totalOpenIssues = 0;
  var totalSize = 0;
  var langCounts = {};
  var langStars = {};
  var i;

  for (i = 0; i < repos.length; i++) {
    var r = repos[i];
    totalStars = totalStars + (r.stargazers_count || 0);
    totalForks = totalForks + (r.forks_count || 0);
    totalWatchers = totalWatchers + (r.watchers_count || 0);
    totalOpenIssues = totalOpenIssues + (r.open_issues_count || 0);
    totalSize = totalSize + (r.size || 0);

    var lang = r.language;
    if (lang) {
      if (!langCounts[lang]) {
        langCounts[lang] = 0;
        langStars[lang] = 0;
      }
      langCounts[lang] = langCounts[lang] + 1;
      langStars[lang] = langStars[lang] + (r.stargazers_count || 0);
    }
  }

  // liste langages par nombre de dépôts (valeur = nb repos)
  var languagesByRepos = languagesFromMap(langCounts);
  // liste langages pondérée par stars
  var languagesByStars = languagesFromMap(langStars);

  // top dépôts par stars
  var topByStars = repos.slice().sort(function (a, b) {
    return (b.stargazers_count || 0) - (a.stargazers_count || 0);
  });
  topByStars = topByStars.slice(0, 15);

  // top par activité (pushed_at)
  var topRecent = repos.slice().sort(function (a, b) {
    var da = a.pushed_at || a.updated_at || "";
    var db = b.pushed_at || b.updated_at || "";
    if (da < db) {
      return 1;
    }
    if (da > db) {
      return -1;
    }
    return 0;
  });
  topRecent = topRecent.slice(0, 15);

  var forksCount = 0;
  var originalCount = 0;
  var archivedCount = 0;
  for (i = 0; i < repos.length; i++) {
    if (repos[i].fork) {
      forksCount = forksCount + 1;
    } else {
      originalCount = originalCount + 1;
    }
    if (repos[i].archived) {
      archivedCount = archivedCount + 1;
    }
  }

  return {
    repoCount: repos.length,
    totalStars: totalStars,
    totalForks: totalForks,
    totalWatchers: totalWatchers,
    totalOpenIssues: totalOpenIssues,
    totalSize: totalSize,
    originalCount: originalCount,
    forksCount: forksCount,
    archivedCount: archivedCount,
    languagesByRepos: languagesByRepos,
    languagesByStars: languagesByStars,
    topByStars: simplifyRepos(topByStars),
    topRecent: simplifyRepos(topRecent),
    allRepos: simplifyRepos(repos),
  };
}

function languagesFromMap(map) {
  var total = 0;
  var name;
  for (name in map) {
    if (Object.prototype.hasOwnProperty.call(map, name)) {
      total = total + map[name];
    }
  }

  if (total === 0) {
    return {
      languages: [],
      languageCount: 0,
      dominant: null,
      totalBytes: 0,
      totalSizeLabel: "0",
      detected: false,
    };
  }

  var list = [];
  for (name in map) {
    if (Object.prototype.hasOwnProperty.call(map, name)) {
      var value = map[name];
      var percent = Math.round((value / total) * 10000) / 100;
      list.push({
        name: name,
        value: value,
        percent: percent,
        sizeLabel: String(value),
      });
    }
  }

  list.sort(function (a, b) {
    return b.value - a.value;
  });

  // ajuste le 1er pour total 100 %
  var sumOthers = 0;
  var i;
  for (i = 1; i < list.length; i++) {
    sumOthers = sumOthers + list[i].percent;
  }
  if (list.length > 0) {
    list[0].percent = Math.round((100 - sumOthers) * 100) / 100;
  }

  for (i = 0; i < list.length; i++) {
    if (list[i].value > 0 && list[i].percent === 0) {
      list[i].percentLabel = "< 0.01 %";
    } else {
      list[i].percentLabel = list[i].percent.toFixed(2) + " %";
    }
  }

  return {
    languages: list,
    languageCount: list.length,
    dominant: list[0] || null,
    totalBytes: total,
    totalSizeLabel: String(total),
    detected: list.length > 0,
    documentationOnly: false,
  };
}

function simplifyRepos(repos) {
  var list = [];
  var i;
  for (i = 0; i < repos.length; i++) {
    var r = repos[i];
    list.push({
      name: r.name,
      full_name: r.full_name,
      description: r.description,
      html_url: r.html_url,
      language: r.language,
      stargazers_count: r.stargazers_count || 0,
      forks_count: r.forks_count || 0,
      open_issues_count: r.open_issues_count || 0,
      size: r.size || 0,
      fork: !!r.fork,
      archived: !!r.archived,
      private: !!r.private,
      pushed_at: r.pushed_at,
      updated_at: r.updated_at,
      created_at: r.created_at,
      default_branch: r.default_branch,
      topics: r.topics || [],
    });
  }
  return list;
}

export { aggregateRepos, languagesFromMap, simplifyRepos };
