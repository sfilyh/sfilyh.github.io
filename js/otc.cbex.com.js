function getDetail(id,title,bjNumber){
	$.ajax({
	    type: "get",
	    async: false, 
	    url: 'https://otc.cbex.com/page/jpxkc/prj/prjBidInfo?id=' + id,
	    dataType: "html", 
	    success: function (rsp) {
	        
	        var div = document.createElement('div');
	        div.innerHTML = rsp;

	       
	        var price = $('.fs18:first',div).text();
	        var buyPrice = $('.fs18:last',div).text();

	        var number = $('.jp_detail_jjinfo',div).find('span:eq(0)').text();
	        var count = $('.jp_detail_jjinfo',div).find('span:eq(1)').text();
	        var time = $('.jp_detail_jjinfo',div).find('span:eq(2)').text();

	        var rList = [];

	        rList.push(id);
	        rList.push(title.trim());
			rList.push(bjNumber.trim());
	        rList.push(price.trim());
	        rList.push(buyPrice.trim());
	        rList.push(number.trim());
	        rList.push(count.trim());
	        rList.push(time.trim());

	        console.log(rList.join('^'));
	    }
	});
}

function get(page){
	$.ajax({
	    type: "get",
	    async: false, 
	    url: 'https://otc.cbex.com/page/jpxkc/zc_prjs/prj_li?id=640&pageNo='+page+'&pageSize=16',
	    dataType: "html", 
	    success: function (rsp) {
	        
	        var ul = document.createElement('ul');
	        ul.innerHTML = rsp;

	        console.log(ul);
	        console.log($(ul).find('li').size());

	        $(ul).find('li').each(function(){
	        	var xmid = $(this).data('xmid');
	        	var title = $(this).find('.title').text();
	        	var bjNumber = $(this).find('.bdlist_side_num').text();
	        	getDetail(xmid,title,bjNumber);	
	        })
	    }
	});	
}

function start(){
	var pageTotal = 12;
	for (var i = 1; i <= pageTotal; i++) {
		get(i);	
	}
}
