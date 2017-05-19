$(function () {
    var user_profile = $('.user-profile');
    user_profile.css({
        'border-radius': user_profile.width() + 'px'
    });

    $('.mainFrame').css('margin-top',$('.navbar').height() + 'px');

    // $('input[name="sex-radio"]').iCheck({
    //     checkboxClass: 'icheckbox_minimal-red',
    //     radioClass: 'iradio_minimal-red',
    //     increaseArea: '20%' // optional
    // });

    
    $('#confirm').click(function(){
        var username = $('#username').val();
        var age = $('#age').val();
        var sex = 0;
        var val=$('input:radio[name="sex-radio"]:checked').val();
        if(val=="male"){
            sex = 0;
        }
        else{
            sex = 1;
        }
        $.ajax({
            type: "get",
            async: true,
            url: '/editUserInfo?username=' + username + '&age=' + age + '&sex=' + sex,
            data: {},
            datatype: 'json',
            success: function(result) {
                if(!result.status)
                    alert('修改信息成功！');
                else
                    alert('修改信息失败！');
            },
            error: function(errorMsg) {
                alert('修改信息失败！');
            }
        });
    });
    
});

function jumpTo() {
    window.location.href = "/accountInfo";
}