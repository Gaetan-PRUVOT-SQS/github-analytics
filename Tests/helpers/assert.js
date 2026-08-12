// petites aides de lecture pour les tests

function sumPercents(languages) {
  var total = 0;
  var i;
  for (i = 0; i < languages.length; i++) {
    total = total + languages[i].percent;
  }
  return total;
}

function namesOf(languages) {
  return languages.map(function (l) {
    return l.name;
  });
}

module.exports = {
  sumPercents,
  namesOf,
};
