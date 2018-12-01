
(function(){

    var dug = document.querySelector("#btn1");
    var kuc = document.getElementById("typein");
    var drpI = document.getElementById("drpI");
    var drpII = document.getElementById("drpII");

    var response = document.getElementById("api-response");

    dug.addEventListener("click", function(){
       let url = kuc.value;
       let site = drpI.value;
       let engine = drpII.value;
       
       dug.disabled = true;
       response.innerHTML = "";
       response.setAttribute( "class", "hide");

       contactDetailAPi(url, site, engine);
    });

    function contactDetailAPi(url, site, engine){

        let data = {
            "detail_url": url,
            "spider_name": site,
            "engine": engine
        };
        //testing url: //"https://suchen.mobile.de/fahrzeuge/details.html?id=268572688&lang=en" 
        $.ajax({
            type: "POST",
            url: '/api/v1/detail',
            data: data,
            dataType: "json",
            success(result){
                console.log(result);
                if($( "#api-response" ).hasClass( "hide" ))
                    response.removeAttribute( "class", "hide" );
                dug.disabled = false;
                response.appendChild(document.createTextNode(JSON.stringify(result, null, "\t")));
            },
            error(error){
                console.log("ERROR dashboard!!!");
            }
        });
    }   

})();
  