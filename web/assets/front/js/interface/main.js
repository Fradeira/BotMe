
if (location.pathname == "/creation_bot" || location.pathname == "/analyze")  {
    
    if (sessionStorage.getItem("popup") == 1) {
        $("#navTwo").css("marginTop", "unset");
        $(".popUp").remove();
    }
    
    $(".closePop").click(function () {

        $(".popUp").addClass("animated");
        $(".popUp").addClass("zoomOut");
        setTimeout(() => {
            $(".popUp").css("display", "none");
            $("#navTwo").css("marginTop", "unset");
        }, 350);

        sessionStorage.setItem('popup', '1');

    });
} else if (location.pathname == "/index"){
    sessionStorage.removeItem('popup');
    sessionStorage.clear();
}

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})