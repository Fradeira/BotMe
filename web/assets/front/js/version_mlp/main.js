$(".closePop").click(function(e){
    $(".popUp").addClass("animated");
    $(".popUp").addClass("zoomOut");
    setTimeout(() => {
        $(".popUp").css("display", "none");
        $("#navTwo").css("marginTop", "unset");
    }, 350);
});

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
})