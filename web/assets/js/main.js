$(document).ready(function () {

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
});

