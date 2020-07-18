$('document').ready(function(){
    var tu = $("#tableUbah").DataTable();
    var trekap = $("#tableRekap").DataTable();
    var t = $("#tableNota").DataTable({
        "paging" : false,
        "ordering" : false,
        "searching" : false,
        "info" : false
    });

    $('#tableNota').on('click','tbody tr td button',function(){
        var id = $(this)[0].dataset.id;
        t.row($(this).parents('tr')).remove().draw();
        for (let index = 0; index < cart.length; index++) {
            if(cart[index].data._id == id){
                cart.splice(index,1);
            }
        }
    });

    $('#tunai').on('keyup',function(){
        var totalBelanja = parseInt($('#total').text());
        var tunai = parseInt($('#tunai').val());
        $('#kembalian').html(tunai-totalBelanja);
    });

   
})