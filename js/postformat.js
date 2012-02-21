$(document).ready(function() {

	function inarray(needle,haystack)
	{
		for(var i=0;i<haystack.length;i++)
		{
			if(haystack[i]==needle)
			{
				return true;
			}
		}
		return false;
	}
	
	// Everything for post formatting is in here.
	function formatEngine(cont)
	{
		// WindPower's formatting engine, version 4.0: Rewritten.... Again!
		// Remastered for jQuery by Winged Demon X! :D
		// Note: This time it IS faster and nicer.
		// Yeah ! Format engine, woot~
		var beginning = $('#beginning');
		var ending = $('#ending');
		var head = $('#header');
		var foot = $('#footer');
		
		var style = {'beginning':beginning.val(),'ending':ending.val(),'header':head.val(),'footer':foot.val()};
		console.log(style);
		var sta=style['beginning'];
		var fin=style['ending'];
		var header=style['header'];
		var footer=style['footer'];
		
		cont=$.trim(cont);
		var lowercont=cont.toLowerCase();
		var lowersta=sta.toLowerCase();
		var decltags=new Array();
		var opentags=new Array('b','i','u','strike','code','color','align','quote','url','size');
		var paramtags=new Array('color','align','size','quote','url');
		var defaultparams={'color':'','align':'','size':'','quote':'','url':''};
		var lastparams={'color':'','align':'','size':'','quote':'','url':''};
		var depth=0;
		var curind=0;
		var depthbreak=new Array();
		var depthtags=new Array('code','quote','img','imgleft','imgright','imgmap');
		for(var i=0;i<opentags.length;i++)
		{
			if(sta.indexOf('['+opentags[i]+']')+1 || sta.indexOf('['+opentags[i]+'=')+1)
			{
				decltags[decltags.length]=opentags[i];
				var ind=sta.indexOf('['+opentags[i]+'=');
				if(ind+1)
				{
					defaultparams[opentags[i]]=sta.substr(ind+opentags[i].length+2,sta.substr(ind+opentags[i].length+2).indexOf(']'));
					defaultparams[opentags[i]]=defaultparams[opentags[i]];
				}
			}
		}
		var len=cont.length;
		if(cont.indexOf('[')!=-1 && cont.indexOf('[')<len-2)	// There's an opening bracket, and it's not the last character of the string
		{
			var texts=new Array(cont.substr(0,cont.indexOf('[')));
			i=texts[0].length+1;
		}
		else
		{
			var texts=new Array(cont);
			i=len;
		}
		// So now we've placed i at the index of the character after the first opening bracket, if any.
		// Bla bla bla [b]bold[/b] bla bla bla
		//             /\ Here, between the [ and the b.
		while(i<len)
		{
			var endind=lowercont.substr(i).indexOf(']');
			if(endind!=-1 && endind<255)	// 255 is a very arbitrary number to prevent processing "false positive" tags. I don't think many tags go over that, though there's no limit with [quote=LongUsernameHere] or [color=LongColorNameHere], etc.~
			{
				var realtag=cont.substr(i,endind);
				var sign=1;
				var hasParams = false;
				var params='';
				if(realtag.substr(0,1)=='/')
				{
					sign=-1;
					realtag=realtag.substr(1);
					var tag=realtag.toLowerCase();
				}
				else
				{
					var equal=realtag.indexOf('=');
					if(equal+1) // Tags like [quote], [url], [color], [align], etc
					{
						hasParams = true;
						params=realtag.substr(equal+1);
						var tag=realtag.substr(0,equal).toLowerCase();
					}
					else
					{
						var tag=realtag.toLowerCase();
					}
				}
				if(inarray(tag,depthtags))
				{
					if(depth==1 && sign==-1)
					{
						texts[curind]+='[/'+tag+']';
						curind++;
						texts[curind]='';
					}
					else
					{
						if(!depth && sign==1)
						{
							curind++;
							depthbreak[curind]=tag.substr(0,3)!='img';
							texts[curind]='';
						}
						var text='['+(sign==-1?'/':'')+tag+(params?'='+params:'')+']';
						texts[curind]+=text;
					}
					depth+=sign;
				}
				else if(!depth && inarray(tag,decltags))
				{
					if(params && sign==1 && defaultparams[tag]!=params)
					{
						lastparams[tag]=params;
						texts[curind]+='[/'+tag+']['+tag+'='+params+']';
					}
					else if(sign==-1 && inarray(tag,paramtags) && defaultparams[tag]!=lastparams[tag])
					{
						texts[curind]+='[/'+tag+']['+tag+'='+defaultparams[tag]+']';
						lastparams[tag]=defaultparams[tag];
					}
					// Else, the tag is already declared in the beginning tags, so just ignore the tag.
				}
				else
				{
					texts[curind]+='['+(sign==1?'':'/')+tag+(params?'='+params:'')+']';
				}
				i+=1+(sign==-1)+tag.length+(hasParams?params.length+1:0);
			}
			var staind=cont.substr(i).indexOf('[')+1;
			if(staind)
			{
				texts[curind]+=cont.substr(i,staind-1);
				i+=staind;
			}
			else
			{
				texts[curind]+=cont.substr(i);
				i=len;
			}
		}
		var swtch=true;
		var truecont='';
		for(i=0;i<texts.length;i++)
		{
			if(texts[i] || !depthbreak[i-1])
			{
				if(swtch && texts[i].length > 0)
				{
					if(!i || (i && depthbreak[i-1]))
					{
						truecont+=sta;
					}
					truecont+=texts[i];
					if(i==texts.length-1 || (i<texts.length-1 && depthbreak[i+1]))
					{
						truecont+=fin;
					}
				}
				else
				{
					truecont+=texts[i];
				}
			}
			swtch=!swtch;
		}
		return $.trim(header+truecont+footer);
	}
		
	function previewFormat() {
		var textarea = $('#textarea').val();
		var preview = $('#postcontent');
		
		// Format post
		var code = formatEngine(textarea);
		
		// Parse out bbcode to HTML
		code = bbcode.render(code);
		
		preview.html(code);
		
	}
	
	$('#postStyle').change(function(e){
		var postStyle = $('#postStyle');
		var avi_speech = $('#avi-speech');
		
		avi_speech.removeClass('say');
		avi_speech.removeClass('think');
		avi_speech.removeClass('shout');
		avi_speech.removeClass('whisper');
		avi_speech.removeClass('document');
		avi_speech.removeClass('ornate');
		
		avi_speech.addClass(postStyle.val());
	});
	
	$('textarea').keyup(function() {
			previewFormat();
	});
});