$(document).ready(function () {

    // -----------------------------------------------
    // -----------------------------------------------
    // Menus flottants
    // -----------------------------------------------
    // -----------------------------------------------

    $('.login').on('click', function (e) {
        e.preventDefault();

        $("#connect").toggle("slow");
        $("#signup").hide();
        $("#mdpmiss").hide();
    });

    $('.signup').on('click', function (e) {
        e.preventDefault();

        $("#signup").toggle("slow");
        $("#connect").hide();
        $("#mdpmiss").hide();
    });

    $('#sign').on('click', function (e) {
        e.preventDefault();

        $("#connect").hide();
        $("#signup").toggle("slow");
    });

    $('#passmiss').on('click', function (e) {
        e.preventDefault();

        $("#signup").hide();
        $("#connect").hide();
        $("#mdpmiss").toggle("slow");
    });

    $('.returnRes').click(function(){
        $("#mdpmiss").hide();
        $("#connect").toggle("slow");
    });

    setTimeout(function () {
        $('#infoEchap').css('display', 'block');
        $('#infoEchap').addClass('animated');
        $('#infoEchap').addClass('zoomInUp');

        setTimeout(function () {
            $('.fa-info-circle').addClass('animated');
            $('.fa-info-circle').addClass('rotateIn');
        }, 3000);
    }, 4000);


    // -----------------------------------------------
    // -----------------------------------------------
    // Echap Click
    // -----------------------------------------------
    // -----------------------------------------------

    function echap() {
        $('#infoEchap').hide();
        $("#signup").fadeOut('slow');
        $("#connect").fadeOut('slow');
        $("#mdpmiss").fadeOut('slow');
    }

    document.onkeydown = function (e) {
        var keyCode = e.keyCode;
        if (keyCode == 27) {
            echap();
        }
    };

    // -----------------------------------------------
    // -----------------------------------------------
    // Bouton Principal Home
    // -----------------------------------------------
    // -----------------------------------------------

    setInterval(function () { 
        $('.discover').addClass('infinite');
    }, 2000);

    setInterval(function () {
        $('.discover').removeClass('infinite');
    }, 1500);

    // -----------------------------------------------
    // -----------------------------------------------
    // General
    // -----------------------------------------------
    // -----------------------------------------------
    $(".offreSpe").click(function(){
        setTimeout(function () {
            $('#signup').toggle("slow");
        }, 1500);
    });
});

