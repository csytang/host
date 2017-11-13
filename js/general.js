$(document).ready(function(){
	$('.menu a').click(function(){
		
		elem = this;
	
		$('.menu a').removeClass('active');
		$(this).addClass('active');
		
		$('.container-middle').find('.visible').slideUp('normal', function(){
			$(this).addClass('hide');
			$(this).removeClass('visible');
			$('.container-middle').find($(elem).attr('href')).slideDown('normal', function(){
				$(this).removeClass('hide');
				$(this).addClass('visible');
			});
		});
		
		return false;
	});
});