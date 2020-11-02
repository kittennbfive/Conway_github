// ==UserScript==
// @name     Github: Conways Game of Life
// @version  0.4.2
// @grant    none
// @match    https://github.com/*
// ==/UserScript==

// This is a script for Greasemonkey for Firefox.
// (c) 2020 by kitten_nb_five
// https://github.com/kittennbfive
// AGPLv3+

function translate_coord(x,y)
{
	return [16-x, 15*(6-y)];
}

function color_cell(x, y, color)
{
	var [x_coord,y_coord]=translate_coord(x,y);
	
	try
	{
		document.getElementsByClassName("js-calendar-graph-svg")[0].querySelector("rect[class~=day][x=\""+x_coord+"\"][y=\""+y_coord+"\"]").setAttribute("fill", color);
	} 
	catch(e) {}
}

function get_value_from_cell(x,y)
{
	var [x_coord,y_coord]=translate_coord(x,y);
	
	try
	{
		return document.getElementsByClassName("js-calendar-graph-svg")[0].querySelector("rect[class~=day][x=\""+x_coord+"\"][y=\""+y_coord+"\"]").dataset.count;
	}
	catch(e)
	{
		return undefined;
	}
}	

var x,y;
var map=new Array(53);
var map_new=new Array(53);

function init()
{
	var threshold;
	var contr_count=new Array();

	for(x=0; x<53; x++)
	{
		for(y=0; y<7; y++)
		if(get_value_from_cell(x,y))
			contr_count.push(get_value_from_cell(x,y));
	}

	contr_count.sort(function cmp(a,b) { return a-b; });

	threshold=(contr_count[100]!=0?contr_count[100]:1); //change the index (both!) to make the starting map more or less populated

	console.log("threshold: "+threshold);

	for(x=0; x<53; x++)
	{
		map[x]=new Array(7);
		map_new[x]=new Array(7);
		for(y=0; y<7; y++)
		{
			var value=get_value_from_cell(x,y);
			map[x][y]=(value && value>=threshold)?1:0;
			map_new[x][y]=0;
		}
	}
}

function wrap_x(x)
{
	if(x<0)
		return 53+x;
	else if(x>=53)
		return x-53;
	else
		return x;
}

function wrap_y(y)
{
	if(y<0)
		return 7+y;
	else if(y>=7)
		return y-7;
	else
		return y;
}

function check_neighbors(x,y)
{
	var nb=0;
	if(map[wrap_x(x-1)][wrap_y(y-1)])
		nb++;
	if(map[wrap_x(x-1)][wrap_y(y)])
		nb++;
	if(map[wrap_x(x)][wrap_y(y-1)])
		nb++;
	if(map[wrap_x(x-1)][wrap_y(y+1)])
		nb++;
	if(map[wrap_x(x+1)][wrap_y(y-1)])
		nb++;
	if(map[wrap_x(x+1)][wrap_y(y)])
		nb++;
	if(map[wrap_x(x)][wrap_y(y+1)])
		nb++;
	if(map[wrap_x(x+1)][wrap_y(y+1)])
		nb++;
	return nb;
}

function loop()
{
	for(x=0; x<53; x++)
	{
		for(y=0; y<7; y++)
		{
			map_new[x][y]=0;
			
			if(!map[x][y] && check_neighbors(x,y)==3)
				map_new[x][y]=1;
			
			if(map[x][y])
			{
				var nb_n=check_neighbors(x,y);
				if(nb_n==2 || nb_n==3)
					map_new[x][y]=1;
			}
		}
	}
	
	for(x=0; x<53; x++)
	{
		for(y=0; y<7; y++)
		{
			map[x][y]=map_new[x][y];
			if(map[x][y])
				color_cell(x,y,"black");
			else
				color_cell(x,y,"white");
		}
	}
}

var timer;

if(document.getElementsByClassName("js-calendar-graph-svg").length) //only run if we are on a profile page where the calendar exists
{
  init();
	timer=setInterval(loop, 200);
}
