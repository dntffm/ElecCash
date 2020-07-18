var db_laporan = new PouchDB("laporan");
var db = new PouchDB('toko');
var {dialog} = require('electron').remote
var remoteCouch = false;
var cart = [];
var now = new Date().getDate()+"/"+new Date().getMonth()+"/"+new Date().getFullYear();

$('document').ready(function(){
    showTableEdit();
    showTableRekap();
    $(document).on("keydown", "form", function(event) { 
        return event.key != "Enter";
    });

    function showTableRekap(){
        var t = $("#tableRekap").DataTable();
        db_laporan.allDocs({include_docs:true},function(err,response){
            if(err){
                console.log(err)
            } else{
                var counter = 1;
                $.each(response.rows,function(key,value){
                    t.row.add([
                        counter,
                        value.doc._id,
                        value.doc.tanggal,
                        '<button data-id="'+value.doc._id+'" class="btn btn-info" data-toggle="modal" data-target="#modal-detail-transaksi">detail</button>'
                    ]).draw(false);
                    counter++;
               
                });
            }
        })
    }

    function tambahLaporan(data){
        db_laporan.put({
            "_id": new Date().toISOString(),
            "tanggal": now,
            data
        }).then(function(response){
            if(dialog.showMessageBoxSync({
                type: "info",
                message: "Transaksi Sukses",
                buttons:["Selesai, Tidak Print","Selesai dan print"]
            }) == 1) {
                var printer = new Recta('9415999884', '1811')
                printer.open().then(function () {
                  printer.align('center')
                    .text('Hello World !!')
                    .bold(true)
                    .text('This is bold text')
                    .bold(false)
                    .underline(true)
                    .text('This is underline text')
                    .underline(false)
                    .barcode('CODE39', '123456789')
                    .cut()
                    .print()
                })
            };

            cart = [];
            location.reload();
            //script print
        }).catch(function(error){
            console.log(error);
            dialog.showMessageBoxSync({
                type: "error",
                message: "Transaksi Gagal"
            });
        })
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
        });
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
        var ready = false;

        if($("#jenisjual").val() === "grosir"){
            harga = temp.data.harga_grosir;
        }

        for (let index = 0; index < cart.length; index++) {
            if(temp.data._id == cart[index].data._id){
                ready = true;
            }
            
        }
        if(ready){
            dialog.showMessageBoxSync({
                type: "warning",
                message: "barang sudah ada"
            });

            e.preventDefault();
        }else{
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
            $("#formkasir")[0].reset();
            e.preventDefault();
        }
    })

    $("#tableUbah").on('click','tbody tr td button',function(){
        var id = $(this)[0].dataset.id;
        showModalEdit(id);
    })

    $('#tableRekap').on('click','tbody tr td button',function(){
        var id = $(this)[0].dataset.id;
        var tbd = $('#tableRekapDetail').DataTable({
            "paging" : false,
            "ordering" : false,
            "searching" : false,
            "info" : false
        }
        );
        db_laporan.get(id).then(function(response){
            $('#detail-transaksi-tgl').html(response.tanggal+" | id:"+response._id);
            $.each(response.data,function(key,value){
                console.log(value);
                var harga_pilih = value.data.harga_eceran;
                if(value.data.pilihanHarga == "grosir"){
                    harga_pilih = value.data.harga_grosir;
                }
                tbd.row.add([
                    "-",
                    value.data.nama_barang,
                    value.data.jumlah,
                    harga_pilih,
                    value.data.jumlah  * harga_pilih
                ]).draw(false);
            })
        }).catch(function(error){
            console.log(error);
        })
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
        if(cart.length == 0){
            dialog.showMessageBoxSync({
                type: "warning",
                message: "Belanjaan Masih Kosong"
            })
        } else{
            if($("#tunai").val() == ""){
                dialog.showMessageBoxSync({
                    type: "warning",
                    message: "Masukkan Nominal Tunai"
                })  
            } else{
                tambahLaporan(cart);
            }
        }
        
    })

    $('#submit_tambah').on('click',function(e){
        tambahBarang();
        e.preventDefault();
    })

    


})