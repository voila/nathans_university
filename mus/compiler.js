

var max = function(a,b){
  return a > b ? a : b;
};

var pitch_to_midi = function(p){
  var letterPitch = { 
      c: 0,
      d: 2,	
      e: 4,
      f: 5,
      g: 7,
      a: 9,
      b: 11
  };

  var note = p[0];
  var i = Number(p[1]);

  return 12 + 12 * i + letterPitch[note];
}


var repeat_to_seq = function(section, count){
  if(count === 1)
	return section;
  else
    	return { tag:'seq', 
                 left: section,
                 right: repeat_to_seq(section, count-1)};
}


var compile = function (musexpr) {
  var res = compile_aux(musexpr, 0);
  return res.notes;
}; 

var compile_aux = function (musexpr, start0) {
    var note, rest, res1, notes1, start1, res2, notes2, start2;

    if(musexpr.tag === 'note'){
        note = { tag:'note', 
                     pitch: pitch_to_midi(musexpr.pitch),
                     start: start0,
                     dur: musexpr.dur
                   };
        
        return {notes: [note], end: start0 + note.dur};
    }

    else if(musexpr.tag === 'rest'){
	return {notes: [], end: start0 + musexpr.dur};
    } 

    else if(musexpr.tag === 'repeat'){
        return compile_aux(repeat_to_seq(musexpr.section, musexpr.count), start0);
    }

    else if(musexpr.tag === 'seq'){ 
        res1 = compile_aux(musexpr.left, start0);
        notes1 = res1.notes;
        start1 = res1.end;
        res2 = compile_aux(musexpr.right, start1);
        notes2 = res2.notes;
        start2 = res2.end;
        return {notes: notes1.concat(notes2), end: start2};
    }
    else { // a 'par' node
	res1 = compile_aux(musexpr.left, start0);
        notes1 = res1.notes;
        start1 = res1.end;
        res2 = compile_aux(musexpr.right, start0);
        notes2 = res2.notes;
        start2 = res2.end;
        return {notes: notes1.concat(notes2), end: max(start1, start2)};
    }
};

var melody_mus = 
    { tag: 'seq',
      left: 
       { tag: 'seq',
         left: { tag: 'repeat',
  	         section: { tag: 'note', pitch: 'c4', dur: 250 },
  	         count: 3 },
         right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
       { tag: 'seq',
         left: { tag: 'rest', dur: 500 },
         right: { tag: 'note', pitch: 'd4', dur: 500 } } };


console.log(melody_mus);
console.log(compile(melody_mus));



