var db = new PouchDB('toko');
var {dialog} = require('electron').remote
var remoteCouch = false;
var cart = [];


$('document').ready(function(){
    showTableEdit();
    $(document).on("keydown", "form", function(event) { 
        return event.key != "Enter";
    });

    function tambahLaporan(data){
        var db_laporan = new PouchDB("laporan");
        var remoteCouch = false;

        console.log(data);
    }

    function tambahBarang() {
        var nama_barang = $('#nama_barang').val();
        var harga_grosir = $('#harga_grosir').val();
        var harga_eceran = $('#harga_eceran').val();
        var barcode = $('#barcode').val();
        var stok = $('#stok').val();
        var satuan = $('#satuan').val();


        var doc = {
            "_id": new Date().toISOString(),
            "nama_barang": nama_barang,
            "harga_grosir": harga_grosir,
            "harga_eceran": harga_eceran,
            "barcode": barcode,
            "stok": stok,
            "satuan": satuan
        };
        db.put(doc).then(function(response){
            dialog.showMessageBoxSync({
                type: "info",
                message: "Tambah barang Berhasil"
            });
            
        }).catch(function(err){
            dialog.showMessageBoxSync({
                type: "error",
                message: "Tambah barang gagal"
            });
        })
        
    }

    function showTableEdit(){
        var t = $("#tableUbah").DataTable();
        db.allDocs({include_docs:true},function(err,response){
            if(err){
                console.log(err)
            } else{
                //console.log(response);
                var counter = 1;
                $.each(response.rows,function(key,value){
                    t.row.add([
                        counter,
                        value.doc.nama_barang,
                        value.doc.harga_grosir,
                        value.doc.harga_eceran,
                        value.doc.barcode,
                        '<button data-id="'+value.doc._id+'" class="btn btn-info" data-toggle="modal" data-target="#modal-edit">ubah</button>'
                    ]).draw(false);
                    counter++;
               
                });
            }
        })
    }

    function showModalEdit(id){
        
        
        db.get(id,function(err,response){
            if(err){
                console.log(err);
            } else{
                var id = $("#id_modal").val(response._id);
                var nama_barang =  $('#nama_barang_modal').val(response.nama_barang);
                var harga_grosir =  $('#harga_grosir_modal').val(response.harga_grosir);
                var harga_eceran =  $('#harga_eceran_modal').val(response.harga_eceran);
                var barcode =  $('#barcode_modal').val(response.barcode);
                var stok =  $('#stok_modal').val(response.stok);
                var satuan =  $('#satuan_modal').val(response.satuan);
            }
        });
    }

    if($("#idbarang").val() != null){

        var src = $('#idbarang').val();
        var availBrg = [];
        var temp = null;
        db.allDocs({include_docs:true},function(err,response){
            if(!err){
                $.each(response.rows,function(key,value){
                    availBrg.push({value:value.doc.barcode+' | '+value.doc.nama_barang,data:value.doc});
                })
            }
        })
        console.log(availBrg);
        $('#idbarang').autocomplete({
            lookup: availBrg,
            onSelect: function(suggestion){
                $('#nama_barang').val(suggestion.data.nama_barang);
                temp = suggestion;
                
            }
        });
    }
    var total = 0;
    $('#goBelanja').on('click',function(e){
        var t = $('#tableNota').DataTable();
        var id = $('#idbarang').val();
        var jumlah = parseInt($("#jumlah").val());
        var harga = temp.data.harga_eceran;
        
  

        if($("#jenisjual").val() === "grosir"){
            harga = temp.data.harga_grosir;
        }

        t.row.add([
            temp.data.nama_barang,
            jumlah,
            harga,
            harga*jumlah,
            '<button class="hpsNota btn btn-danger" data-id="'+temp.data._id+'">hapus</button>'
            
        ]).draw(false);  
        total+=harga*jumlah;
        $("#total").html(total);
        temp.data.jumlah = jumlah;
        temp.data.pilihanHarga = $("#jenisjual").val();
        cart.push(temp);
        e.preventDefault();
    })

    $("#tableUbah").on('click','tbody tr td button',function(){
        var id = $(this)[0].dataset.id;
        showModalEdit(id);
    })

    $("#simpan_modal").on('click',function(){
        var id = $('#id_modal').val();
        db.get(id).then(function(doc){
            return db.put({
                "_rev" : doc._rev,
                "_id" : id,
                "nama_barang" : $('#nama_barang_modal').val(),
                "harga_grosir" : $('#harga_grosir_modal').val(),
                "harga_eceran" :$('#harga_eceran_modal').val(),
                "barcode" : $('#barcode_modal').val(),
                "stok" : $('#stok_modal').val(),
                "satuan" : $('#satuan_modal').val(),
            }).then(function(response){
                dialog.showMessageBoxSync({type:'info',message:"ubah sukses"});
                window.location.replace('ubah.html');
            }).catch(function(err){
                dialog.showMessageBoxSync({type:'error',message:"ubah gagal"});
                
            })
        })
    })

    $("#slsBelanja").on('click',function(){
        tambahLaporan(temp);
    })

    $('#submit_tambah').on('click',function(e){
        tambahBarang();
        e.preventDefault();
    })

    


})