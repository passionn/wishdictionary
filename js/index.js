document.addEventListener("DOMContentLoaded", function() {
    $("#search_value").attr("disabled",true)
    $("#content").attr("disabled",true)
    setTimeout(checkNebpay, 100);
});

function checkNebpay() {
    console.log("check nebpay")
    try {
        var NebPay = require("nebpay");
        var nebPay = new NebPay();

        $("#search_value").attr("disabled", false)
        $("#content").attr("disabled", false);

        if(typeof(webExtensionWallet) === "undefined"){
            alert ("Extension wallet is not installed, please install it first.")
        }

    } catch (e) {
        $("#noExtension").removeClass("hide")
    }
}

var dappAddress = "n1kxCcrkhUmX3gRg9JGJMdstDvffnAaq8mo";


// 查询功能
$("#search").click(function() {
    $('.loading').removeClass('hide');
    var val=  $("#search_value").val().trim();
    if(!val){
        alert("请输入心愿标题");
        return;
    }

    var func = "get"
    var args = "[\"" + $("#search_value").val() + "\"]"

    window.postMessage({
        "target": "contentscript",
        "data": {
            "to": dappAddress,
            "value": "0",
            "contract": {
                "function": func,
                "args": args
            }
        },
        "method": "neb_call"
    }, "*");

})

$("#add").click(function() {
    var val=  $("#search_value").val().trim();
    var content =  $("#content").val().trim();

    if(!val){
        alert("请输入心愿标题");
        return;
    }
    if(!content){
        alert("请输入心愿内容");
        return;
    }
    console.log("********* call smart contract \"sendTransaction\" *****************")
    var func = "save"
    var args = "[\"" + val + "\",\"" + content + "\"]"

    window.postMessage({
        "target": "contentscript",
        "data": {
            "to": dappAddress,
            "value": "0",
            "contract": {
                "function": func,
                "args": args
            }
        },
        "method": "neb_sendTransaction"
    }, "*");
})


// listen message from contentscript
window.addEventListener('message', function(e) {
    // e.detail contains the transferred data
    console.log(e.data);
    var neb_call="";
    try{
        neb_call = e.data.data.neb_call;
    }catch (err){

    }
    if (!!neb_call) {
        var result = neb_call.result
        console.log("return of rpc call: " + JSON.stringify(result));
        $('.loading').addClass('hide');
        if (result === 'null') { // 不存在；
            $(".add_banner").addClass("hide");
            $(".result_success").addClass("hide");
            $("#add").removeClass("hide");
            $(".s_content").removeClass("hide");

        } else { // 查询

            try {
                result = JSON.parse(neb_call.result)
            } catch (err) {

            }

            if (!!result.key) {

                $("#search_banner").text($("#search_value").val())
                $("#search_result").text(result.value)
                $("#search_result_author").text(result.author)

                $(".result_success").removeClass("hide");
                $(".s_content").addClass("hide");

            } else { // 不存在
                $(".s_content").addClass("hide");
                $("#add").removeClass("hide");
                $(".add_banner").addClass("hide");

                $("#search_banner").text($("#search_value").val())
                $("#search_result").text(result)
                $("#search_result_author").text("")
                $(".result_success").removeClass("hide");
            }

        }

    }
});