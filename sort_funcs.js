function compareA(a, b)
{
    if (a.author > b.author)
        return -1;
    return 1;
}

function compareD(a, b)
{
    if (a.data > b.data)
        return -1;
    return 1;
}


module.exports.compareA = compareA;
module.exports.compareD = compareD ;