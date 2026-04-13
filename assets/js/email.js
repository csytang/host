function fill_email() {
  var emails = {
    "staff" : "c!@#c-bss-s!@#taff@lis!@#ts.gat!@#ech.e!@#du",
    "taesoo": "t!@#a!@#esoo@!@#gatech.!@#e!@#du",
    "sslab" : "s!@#sl!@#ab@cc.!@#g!@#a!@#tec!@#h.ed!@#u",
    "assist": "!@#nd!@#on!@#gi@c!@#c.g!@#a!@#tech!@#.e!@#d!@#u"
  };

  for (var recv in emails) {
    var email = (emails[recv]).replace(/!@#/g,"");
    var alls  = document.getElementsByClassName("reference external");
    var forms = Array.prototype.filter.call(alls, function(e) {
      return e.href === 'mailto:' + recv;
    });
    for (var i = 0; i < forms.length; i ++) {
      forms[i].href = "mailto:" + email;
      forms[i].textContent = email;
    }
  }
}

$(fill_email);
