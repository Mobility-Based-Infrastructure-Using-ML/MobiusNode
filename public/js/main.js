$(document).ready(function(){
  uidata();
});

function request(type, req, loc, async) {
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        $(loc).html(this.response);
      }
  };
  xhttp.open(type, req, async);
  xhttp.send();
}
