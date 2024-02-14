function load() {
  var fileInput = document.getElementById("file");

  if (fileInput.files.length > 0) {
    var reader = new FileReader();
    output.innerHTML = "";
    var incShorts = document.getElementById("yes").checked;

    reader.addEventListener("load", (e) => {
      print("parsing input data...");

      var history = JSON.parse(reader.result);

      print("done");
      print("counting per year...");

      var yearCounts = {};
      var currYear = new Date().getFullYear();

      for (var propYear = 2005; propYear <= currYear; propYear++) {
        yearCounts[propYear] = 0;
      }

      var total = 0;

      for (var i = 0; i < history.length; i++) {
        if (history[i].titleUrl != undefined && history[i].titleUrl.substring(8, 13) == "music") { continue; }

        yearCounts[history[i].time.substring(0, 4)]++;
        total++;
      }

      print("done");
      print("=========== RESULTS ===========");

      var start = false;

      for (let year in yearCounts) {
        if (yearCounts[year] != 0) { start = true; }

        if (start) {
          print(year + ": " + yearCounts[year] + ((incShorts && (year == "2020")) ? "   [YT Shorts created]" : ""));

          if (incShorts && (parseInt(year) >= 2020)) {
            print("  - est. #non-shorts: " + Math.round(yearCounts[year] * 0.071));
          }
        }
      }

      var totalTime = total * 11.7;
      var nsTotal = Math.round(total * 0.071);
      var nsTotalTime = Math.round(nsTotal * 11.7);

      print("===============================");
      print("TOTAL: " + total);

      if (incShorts) {
        print("est. non-short TOTAL: " + nsTotal);
        print("est. time watched: " + nsTotalTime + " min");
        print(" ~" + (Math.round(nsTotalTime / 60)) + " hrs");
      } else {
        print("est. time watched: " + totalTime + " min");
        print(" ~" + (Math.round(totalTime / 60)) + " hrs");
      }
    });

    reader.readAsText(fileInput.files[0]);
  }
}

function print(text) {
  var output = document.getElementById("output");
  output.innerHTML += text + "<br>";
  console.log(text);
}
