/* 
Copyright (c) 2011 Kai Mallea (kmallea@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining 
a copy of this software and associated documentation files (the "Software"), 
to deal in the Software without restriction, including without limitation the 
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
copies of the Software, and to permit persons to whom the Software is furnished 
to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE 
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*
Copyright (c) 2012 Michael Pivonka (http://www.codedninja.com/)

This modified version of Kai Mallea's bbcode parser is made to mimic/copy the 
bbcode parser made by GaiaOnline. This will take bbcode that is available on
GaiaOnline, if you find any issues or problems please contact me on my website
above.
*/
(function () {
    
    var root = this,
        bbcode = {},
        _htmlEscape;
    
    bbcode.VERSION = '0.1';


    _htmlEscape = function (str) {
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };
    
    _bbcodeEscape = function (str) {
        return str.replace(/\[/g, '&#91;').replace(/\]/g, '&#93;');
    };
    
       
    _render = function (input, opts) {
        
        // bbcode_table will contain objects with two
        // properties -- re and sub -- which contain
        // a regex literal and function to substitute the
        // match with, respectively
        var bbcode_table = {},
            options = {
                escape: true,
                newlines: true  
            };
       
        if (!input) { return ''; }

        if (opts) {
            for (var o in opts) {
                if (opts.hasOwnProperty(o)) {
                    options[o] = opts[o];
                }
            }
        }

        if (options.escape) {
            input = _htmlEscape(input);
        }
        
        // replace [code]...[/code] with <div class="code">...</div>
        bbcode_table.code = {
            re: /\[code\]([\s\S]*?)\[\/code\]/ig,
            sub: function (match, p1) { return '<div class="code">' + _bbcodeEscape(p1) + '</div>'; }
        };
        
        // replace [b]...[/b] with <strong>...</strong>
        bbcode_table.bold = {
            re: /\[b\]([\s\S]*?)\[\/b\]/ig,
            sub: function (match, p1) { return '<strong>' + p1 + '</strong>'; }
        };
        
        // replace [i]...[/i] with <em>...</em>
        bbcode_table.italic = {
            re: /\[i\]([\s\S]*?)\[\/i\]/ig,
            sub: function (match, p1) { return '<em>' + p1 + '</em>'; }
        };
        
        // replace [quote]...[/quote] with <div class="quote"><div class="cite">Quote:</div><div class="quoted">...<div class="clear"></div></div></div>
        bbcode_table.quote = {
            re: /\[quote\]([\s\S]*?)\[\/quote\]/ig,
            sub: function (match, p1) {return '<div class="quote"><div class="cite">Quote:</div><div class="quoted">' + p1 + '<div class="clear"></div></div></div>'; }
        };

        // replace [quote="Obama"]...[/quote] with <div class="quote"><div class="cite">Obama:</div><div class="quoted">...<div class="clear"></div></div></div>
        bbcode_table.quotespecific = {
            re: /\[quote\="?(.*?)"?\]([\s\S]*?)\[\/quote\]/ig,
            sub: function (match, p1, p2) { return '<div class="quote"><div class="cite">' + p1 + '</div><div class="quoted">' + p2 + '<div class="clear"></div></div></div>'; }
        };

        // relace [size="30"]...[/size] with <span style="font-size:30px;">...</span>
        bbcode_table.size = {
            re: /\[size\=(?:"|&quot;|)(.*?)(?:"|&quot;|)\]([\s\S]*?)\[\/size\]/ig,
            sub: function (match, p1, p2) { return '<span style="font-size:' + p1 + 'px;">' + p2 + '</span>'; }
        };
        
        // replace [s]...[/s] with <span style="text-decoration:line-through">...</span>
        bbcode_table.strikethrough = {
            re: /\[(?:s|strike)\]([\s\S]*?)\[\/(?:s|strike)\]/ig,
            sub: function (match, p1) { return '<span style="text-decoration:line-through">' + p1 + '</span>'; }
        };
        
        // replace [u]...[/u] with <span style="text-decoration:underline;">...</span>
        bbcode_table.underline = {
            re: /\[u\]([\s\S]*?)\[\/u\]/ig,
            sub: function (match, p1) { return '<span style="text-decoration:underline;">' + p1 + '</span>'; }
        };  

        // replace [center]...[/center] with <div class="postcontent-align-center" style="text-align:center;">...</div>
        bbcode_table.center = {
            re: /\[center\]([\s\S]*?)\[\/center\]/ig,
            sub: function (match, p1) { return '<div class="postcontent-align-center" style="text-align:center;">' + p1 + '</div>'; }
        };
        
		// replace [align=left]...[/align] with <div class="postcontent-align-left"style="text-align:left;">...</div>
		bbcode_table.align = {
		    re: /\[align\="?(right|left|center)"?\]([\s\S]*?)\[\/align\]/ig,
		    sub: function (match, p1, p2) { return '<div class="postcontent-align-'+p1+'" style="text-align:'+p1+'">'+p2+'</div>'; }
		};

        // relace [color=red]...[/color] with <span style="color:red;">...</span>
        bbcode_table.color = {
            re: /\[color=([#a-z0-9]+)\]([\s\S]*?)\[\/color\]/ig,
            sub: function (match, p1, p2) { return '<span style="color:' + p1 + ';">' + p2 + '</span>'; }
        };

        // replace [url]...[/url] with <a href="...">...</a>
        bbcode_table.url = {
            re: /\[url\]([\s\S]*?)\[\/url\]/ig,
            sub: function (match, p1) { return '<a href="' + p1 + '">' + p1 + '</a>'; }
        };
        
        // replace [url=someurl]some text[/url] with <a href="someurl">some text</a>
        bbcode_table.urlcustom = {
            re: /\[url=(.*?)\]([\s\S]*?)\[\/url\]/ig,
            sub: function (match, p1, p2) { return '<a href="' + p1 + '">' + p2 + '</a>'; }
        };
    
        // replace [img]...[/img] with <img src="..." alt="User Image"/>
        bbcode_table.img = {
            re: /\[img\]([\s\S]*?)\[\/img\]/ig,
            sub: function (match, p1) { return '<img src="' + p1 + '" alt="User Image"/>'; }
        };
        
        // replace [imgright]...[/imgright] with <img src="..." style="float:right;" alt="User Image"/>
        bbcode_table.imgalign = {
            re: /\[img(left|right)\]([\s\S]*?)\[\/img(left|right)\]/ig,
            sub: function (match, p1, p2, p3) { return '<img src="' + p2 + '" style="float:'+ p1 +';" alt="User Image"/>'; }
        };
        
        // replace [imgmap]...[/imgmap] with <img ismap="ismap" src="..." alt="User Image"/>
        bbcode_table.imgmap = {
            re: /\[imgmap\]([\s\S]*?)\[\/imgmap\]/ig,
            sub: function (match, p1, p2) { return '<img src="' + p1 + '" ismap="ismap" alt="User Image"/>'; }
        };
        
        // replace [list][*]item1 [*]item2 ...[/list] with <ul><li>item1</li><li>item2</li>...</ul>
        bbcode_table.lists = {
            re: /\[list\]([\s\S]*?)\[\/list\]/ig,
            sub: function (match, p1) {
                p1 = p1.replace(/\[\*\]([^\[\*\]]*)/ig, function (match, sp1) {
                    return '<li>' + sp1.replace(/[\n\r?]/, '') + '</li>';
                });
                
                return '<ul>'  + p1.replace(/[\n\r?]/, '') + '</ul>';
            }
        };

        // replace [list=1|a][*]item1 [*]item2 ...[/list] with (<ol>|<ol style="list-style-type: lower-alpha">)<li>item1</li><li>item2</li>...</ol>
        bbcode_table.lists2 = {
            re: /\[list=(1|a)\]([\s\S]*?)\[\/list\]/ig,
            sub: function (match, p1, p2) {
                var list_type = '';
                if (p1 === '1') {
                    list_type = '<ol>';
                } else if (p1 === 'a') {
                    list_type = '<ol style="list-style-type: lower-alpha">';
                } else {
                    list_type = '<ol>';
                }
                             
                p2 = p2.replace(/\[\*\]([^\[\*\]]*)/ig, function (match, sp1) {
                    return '<li>' + sp1.replace(/[\n\r?]/, '') + '</li>';
                });
                
                return list_type + p2.replace(/[\n\r?]/, '') + '</ol>';
            }
        };
        
        // replace [youtube]...[/youtube] with <iframe src="..."></iframe>
        bbcode_table.youtube = {
            re: /\[youtube\](?:http?:\/\/)?(?:www\.)?youtu(?:\.be\/|be\.com\/watch\?v=)([A-Z0-9\-_]+)(?:&(.*?))?\[\/youtube\]/ig,
            sub: function (match, p1) { return '<iframe class="youtube-player" type="text/html" width="640" height="385" src="http://www.youtube.com/embed/' + p1 + '" frameborder="0"></iframe>'; }
        };
        
        if (options.newlines) {
            // replace newlines with <br/>
            bbcode_table.newlines = {
                re: /\n\r?/g,
                sub: function () {
                    return '<br/>';
                }
            };            
        }
        
        // process input against everything in bbcode_table
        for (var k in bbcode_table) {
        	var stopReplacing = false;
        	while(stopReplacing === false)
        	{
	        	input = input.replace(bbcode_table[k].re, bbcode_table[k].sub);
	        	recursive = input.match(bbcode_table[k].re);
	        	if(recursive==null) {
	        		stopReplacing = true;
	        	}
	        }
        }
        
        return input;        
    };
    
    bbcode.render = _render;
    
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = bbcode;
    } else {
        root.bbcode = bbcode;
    }
}());