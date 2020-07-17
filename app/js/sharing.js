$('document').ready(function(){
    var tu = $("#tableUbah").DataTable();
    var t = $("#tableNota").DataTable({
        "paging" : false,
        "ordering" : false,
        "searching" : false,
        "info" : false
    });

    $('#tableNota').on('click','tbody tr td button',function(){
        t.row($(this).parents('tr')).remove().draw();
    });

    $('#tunai').on('keyup',function(){
        var totalBelanja = parseInt($('#total').text());
        var tunai = parseInt($('#tunai').val());
        $('#kembalian').html(tunai-totalBelanja);
    });

   
})