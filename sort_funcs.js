
function compareT(a, b)
{
if (a.title < b.title)
  return -1;
if (a.title > b.title)
return 1;
}

function compareA(a, b)
{
  if (a.author < b.author)
    {return -1;}
  if (a.author > b.author)
    {return 1; }
  return 0;
  
}
//module.exports = compareA;
module.exports.compareA = compareA;
//module.exports.compareT = compareT;
